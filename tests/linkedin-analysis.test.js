import test from "node:test";
import assert from "node:assert/strict";
import intake from "../api/competitor-content-request.js";
import status from "../api/linkedin-analysis-status.js";
import { researchLinkedinAnalysis } from "../src/server/linkedin-research.js";
import { normalizeClayPayload } from "../src/server/linkedin-clay.js";

function response() {
  return { code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    setHeader(key, value) { this.headers[key] = value; return this; },
    json(body) { this.body = body; return this; } };
}

test("two-field intake uses the existing Clay webhook and creates a resumable job", async () => {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  const jobs = new Map();
  let clayPayload;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (url === "https://redis.example") {
      const [verb, key, value] = JSON.parse(options.body);
      if (verb === "SET") { jobs.set(key, value); return Response.json({ result: "OK" }); }
      if (verb === "GET") return Response.json({ result: jobs.get(key) || null });
    }
    if (url === "https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-00ea8418-d321-481a-bf50-c3e3d30e7bbe") {
      clayPayload = JSON.parse(options.body);
      return Response.json({ ok: true });
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
  try {
    const submitted = response();
    await intake({ method: "POST", body: {
      linkedinUrl: "https://www.linkedin.com/in/example/", companyDomain: "example.com",
      knownCompetitors: "Ignored old field",
    } }, submitted);
    assert.equal(submitted.code, 200);
    assert.match(submitted.body.jobId, /^[a-f0-9]{40}$/);
    assert.equal(clayPayload.companyDomain, "example.com");
    assert.equal(clayPayload.linkedinUrl, "https://www.linkedin.com/in/example/");
    assert.equal(clayPayload.knownCompetitors, undefined);
    assert.match(clayPayload.callbackUrl, /^https:\/\/www\.enablement\.ch\/api\/linkedin-analysis-callback\?jobId=/);
    const checked = response();
    await status({ method: "GET", query: { jobId: submitted.body.jobId } }, checked);
    assert.equal(checked.body.status, "waiting_for_clay");
    assert.equal(checked.body.callbackToken, undefined);
  } finally { globalThis.fetch = originalFetch; }
});

test("research screens websites and reads founder profiles rather than company-associated post snippets", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  process.env.RAPIDAPI_KEY = "test-fresh-key";
  const originalFetch = globalThis.fetch;
  const promptInputs = [];
  const freshPaths = [];
  let paginated = false;
  const founders = {
    "example": ["Jane Example", "Example"],
    "alice-a": ["Alice A", "Peer A"],
    "bob-b": ["Bob B", "Peer B"],
    "cara-c": ["Cara C", "Peer C"],
  };
  const postUrls = ["https://www.linkedin.com/posts/alice-a-one", "https://www.linkedin.com/posts/bob-b-one"];
  globalThis.fetch = async (url, options = {}) => {
    if (url === "https://example.com/" || /^https:\/\/peer-[a-d]\.com\/$/.test(url)) {
      return new Response("Example B2B agency builds outbound systems, founder content and revenue operations for SaaS buyers. ".repeat(5),
        { headers: { "content-type": "text/html" } });
    }
    if (url === "https://api.openai.com/v1/responses") {
      const request = JSON.parse(options.body);
      promptInputs.push(request.input);
      const output = request.text.format.name === "linkedin_competitor_candidates" ? {
        companyDescription: "B2B GTM services agency", companySourceUrl: "https://example.com/",
        businessModel: "agency/services", subindustry: "GTM engineering",
        searchPhrases: ["GTM engineering agency", "B2B founder content agency"],
        competitors: ["a", "b", "c", "d"].map((letter) => ({
          name: `Peer ${letter.toUpperCase()}`, domain: `peer-${letter}.com`,
          sourceUrl: `https://peer-${letter}.com/`, reason: "Same service and buyer",
        })),
      } : request.text.format.name === "linkedin_competitor_screen" ? {
        accepted: ["peer-a.com", "peer-b.com", "peer-c.com"].map((domain) => ({ domain, reason: "Same delivery model" })),
      } : request.text.format.name === "linkedin_competitor_founders" ? {
        founders: ["a", "b", "c", "d"].map((letter) => ({ domain: `peer-${letter}.com`,
          founderName: ({a:"Alice A",b:"Bob B",c:"Cara C",d:"Dee D"})[letter],
          founderUrl: `https://www.linkedin.com/in/${({a:"alice-a",b:"bob-b",c:"cara-c",d:"dee-d"})[letter]}/`,
          founderSourceUrl: `https://peer-${letter}.com/`,
        })),
      } : {
        headline: "A credible content opening", summary: "Peers are active.", mode: "crowded",
        pain: "Buyers can hear from other founders before they hear from you.",
        categoryFinding: "Three founders post on this topic.",
        topics: [
          { title: "Outbound systems", finding: "Peer A shows systems.", sourceUrl: postUrls[0] },
          { title: "Founder content", finding: "Peer B teaches content.", sourceUrl: postUrls[1] },
        ],
        openings: [{ title: "Show the handoff", buyerProblem: "Leads get lost",
          whyItFits: "The agency builds GTM systems", firstMove: "Show one CRM handoff" }],
        limitations: "This is a rapid automated scan of public content.",
      };
      return Response.json({ status: "completed", output: [...(request.tools ? [{ type: "web_search_call", action: {
        sources: ["a", "b", "c", "d"].map((letter) => ({ url: `https://peer-${letter}.com/` })),
      } }] : []), { type: "message",
        content: [{ type: "output_text", text: JSON.stringify(output) }] }] });
    }
    if (String(url).startsWith("https://fresh-linkedin-profile-data.p.rapidapi.com/")) {
      const parsed = new URL(url);
      freshPaths.push(parsed.pathname);
      const slug = parsed.searchParams.get("linkedin_url")?.match(/\/in\/([^/]+)/)?.[1];
      if (!founders[slug]) throw new Error(`Unscreened founder: ${slug}`);
      const [name, company] = founders[slug];
      if (parsed.pathname === "/enrich-lead") return Response.json({ data: {
        full_name: name, headline: `Founder at ${company}`, follower_count: 1200 } });
      if (parsed.pathname === "/get-profile-posts") {
        const row = {
        posted: new Date(Date.now() - 86400000).toISOString(),
        poster_linkedin_url: `https://www.linkedin.com/in/${slug}/`,
        post_url: `https://www.linkedin.com/posts/${slug}-one`, text: "A concrete buyer problem and solution",
        num_likes: 12, num_comments: 3, num_reposts: 1, reshared: false,
        };
        if (slug === "alice-a" && parsed.searchParams.has("start")) {
          assert.equal(parsed.searchParams.get("start"), "50");
          assert.equal(parsed.searchParams.get("pagination_token"), "page-2-token");
          paginated = true;
          return Response.json({ data: [row, { ...row, post_url: `${row.post_url}-next` },
            { ...row, post_url: `${row.post_url}-old`, posted: new Date(Date.now() - 100 * 86400000).toISOString() }] });
        }
        if (slug === "alice-a") return Response.json({ data: Array.from({ length: 50 }, (_, i) => ({
          ...row, post_url: i ? `${row.post_url}-${i}` : row.post_url,
        })), paging: { pagination_token: "page-2-token" } });
        return Response.json({ data: [row] });
      }
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
  try {
    const report = await researchLinkedinAnalysis(
      { companyDomain: "example.com", linkedinUrl: "https://www.linkedin.com/in/example/" },
      { company: { name: "Example", domain: "example.com" },
        contact: { firstName: "Jane", lastName: "Example", jobTitle: "CEO" },
        email: "private@example.com" });
    assert.equal(report.competitors.length, 3);
    assert.equal(report.topics.length, 2);
    assert.equal(report.competitors[0].posts90, 51);
    assert.equal(report.competitors[0].countIsMinimum, false);
    assert.equal(report.competitors[0].averageEngagement, 16);
    assert.equal(freshPaths.filter((path) => path === "/get-profile-posts").length, 5);
    assert.equal(paginated, true);
    assert.equal(freshPaths.includes("/search-posts"), false);
    assert.equal(promptInputs.some((input) => input.includes("private@example.com")), false);
  } finally { globalThis.fetch = originalFetch; }
});

test("Clay enrichment verifies the submitted inputs and ignores legacy competitor values", () => {
  const input = { companyDomain: "example.com", linkedinUrl: "https://www.linkedin.com/in/example/" };
  const payload = {
    contact_first_name: "Jane", contact_last_name: "Example", contact_job_title: "CEO",
    contact_linkedin_url: "https://www.linkedin.com/in/example/",
    company_name: "Example Inc", company_domain: "https://www.example.com",
    company_linkedin_url: "https://www.linkedin.com/company/example/",
    competitors: ["Old value"],
  };
  const result = normalizeClayPayload(payload, input);
  assert.equal(result.contact.firstName, "Jane");
  assert.equal(result.company.name, "Example Inc");
  assert.equal(result.knownCompetitors, undefined);
  assert.throws(() => normalizeClayPayload({ ...payload, company_domain: "wrong.com" }, input), /does not match/);
});
