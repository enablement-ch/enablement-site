import test from "node:test";
import assert from "node:assert/strict";
import intake from "../api/competitor-content-request.js";
import status from "../api/linkedin-analysis-status.js";
import { researchLinkedinAnalysis } from "../src/server/linkedin-research.js";
import { normalizeClayPayload } from "../src/server/linkedin-clay.js";

function response() {
  return {
    code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    setHeader(key, value) { this.headers[key] = value; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("minimal form sends the unchanged Clay webhook and exposes a resumable job", async () => {
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
      linkedinUrl: "https://www.linkedin.com/in/example/",
      companyDomain: "example.com", knownCompetitors: "Peer Co",
    } }, submitted);
    assert.equal(submitted.code, 200);
    assert.match(submitted.body.jobId, /^[a-f0-9]{40}$/);
    assert.equal(clayPayload.companyDomain, "example.com");
    assert.equal(clayPayload.knownCompetitors, "Peer Co");
    assert.equal(clayPayload.jobId, submitted.body.jobId);
    assert.match(clayPayload.callbackUrl, /^https:\/\/www\.enablement\.ch\/api\/linkedin-analysis-callback\?jobId=/);
    assert.equal(clayPayload.email, undefined);
    assert.equal(clayPayload.firstName, undefined);
    const checked = response();
    await status({ method: "GET", query: { jobId: submitted.body.jobId } }, checked);
    assert.equal(checked.body.status, "waiting_for_clay");
    assert.equal(checked.body.callbackToken, undefined);
  } finally { globalThis.fetch = originalFetch; }
});

test("research uses recent executive posts from verified competitors and omits private Clay fields", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  process.env.RAPIDAPI_KEY = "test-fresh-key";
  const originalFetch = globalThis.fetch;
  const prompts = [];
  let freshCalls = 0;
  globalThis.fetch = async (url, options) => {
    if (url === "https://api.openai.com/v1/responses") {
      const prompt = JSON.parse(options.body).input;
      prompts.push(prompt);
      const body = prompts.length === 1 ? {
        companyDescription: "Example sells software to operations teams", companySourceUrl: "https://example.com/",
        competitors: [{ name: "Peer A", domain: "peer-a.com", reason: "Same buyer" }, { name: "Peer B", domain: "peer-b.com", reason: "Same buyer" }],
      } : {
        companyName: "Example", headline: "A specific opening", summary: "Evidence based summary", categoryFinding: "The sampled field is quiet.",
        openings: [{ title: "Explain the tradeoff", buyerProblem: "A buying decision", whyItFits: "The company solves it", firstMove: "Publish a case example", sourceUrl: "https://example.com/" }],
        limitations: "The latest-post sample is limited.",
      };
      return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(body) }] }] });
    }
    if (String(url).includes("/get-company-by-domain")) {
      freshCalls++;
      const companyDomain = new URL(url).searchParams.get("domain");
      const company = companyDomain === "example.com" ? "Example" : companyDomain === "peer-a.com" ? "Peer A" : "Peer B";
      return Response.json({ confident_score: "80%", data: { company_id: companyDomain, company_name: company } });
    }
    if (String(url).includes("/search-posts")) {
      freshCalls++;
      const companyDomain = JSON.parse(options.body).author_company[0];
      const peer = companyDomain === "example.com" ? "Example" : companyDomain === "peer-a.com" ? "Peer A" : "Peer B";
      return Response.json({ data: peer === "Example" ? [] : [{ posted: new Date(Date.now() - 60000).toISOString(), poster_name: `Founder of ${peer}`, poster_title: `CEO at ${peer} | B2B`, post_url: `https://www.linkedin.com/posts/${peer.toLowerCase().replace(" ", "-")}-recent`, text: "A concrete buyer issue", num_likes: 12, num_comments: 3, num_shares: 1, is_sponsored: false }] });
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
  try {
    const report = await researchLinkedinAnalysis({ companyDomain: "example.com", linkedinUrl: "https://www.linkedin.com/in/example/" }, { company: { name: "Example", domain: "example.com" }, contact: { firstName: "Jane", lastName: "Example", linkedinUrl: "https://www.linkedin.com/in/example/" }, email: "private@example.com" });
    assert.equal(report.openings.length, 1);
    assert.equal(report.evidence.length, 2);
    assert.equal(report.evidence.every((item) => item.url.includes("linkedin.com/posts/")), true);
    assert.equal(prompts.some((prompt) => prompt.includes("private@example.com")), false);
    assert.equal(freshCalls, 6);
  } finally { globalThis.fetch = originalFetch; }
});

test("Clay's snake-case fields map to the requested company and competitor set", () => {
  const input = { companyDomain: "example.com", linkedinUrl: "https://www.linkedin.com/in/example/", knownCompetitors: "Peer One" };
  const payload = {
    contact_first_name: "Jane", contact_last_name: "Example", contact_job_title: "CEO",
    contact_linkedin_url: "https://www.linkedin.com/in/example/",
    company_name: "Example Inc", company_domain: "https://www.example.com",
    company_linkedin_url: "https://www.linkedin.com/company/example/",
    competitors: [{ name: "Peer Two", domain: "peer-two.com" }],
  };
  const result = normalizeClayPayload(payload, input);
  assert.equal(result.contact.firstName, "Jane");
  assert.equal(result.company.name, "Example Inc");
  assert.deepEqual(result.knownCompetitors, ["Peer One", "Peer Two - peer-two.com"]);
  assert.throws(() => normalizeClayPayload({ ...payload, company_domain: "wrong.com" }, input), /does not match/);
});
