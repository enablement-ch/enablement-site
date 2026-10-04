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

test("research requires linked evidence and omits private Clay fields", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  const originalFetch = globalThis.fetch;
  let prompt;
  globalThis.fetch = async (_url, options) => {
    prompt = JSON.parse(options.body).input;
    return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify({
      companyName: "Example", headline: "A specific opening", summary: "Evidence based summary", categoryFinding: "Peers publish about a shared buyer problem.",
      evidence: [{ company: "Peer A", finding: "A documented topic", url: "https://example.com/a" }, { company: "Peer B", finding: "Another documented topic", url: "https://example.com/b" }],
      openings: [{ title: "Explain the tradeoff", buyerProblem: "A buying decision", whyItFits: "The company solves it", firstMove: "Publish a case example", sourceUrl: "https://example.com/c" }],
      limitations: "Public post metrics were unavailable.",
    }) }] }] });
  };
  try {
    const report = await researchLinkedinAnalysis({ companyDomain: "example.com", linkedinUrl: "https://www.linkedin.com/in/example/" }, { companyName: "Example", email: "private@example.com" });
    assert.equal(report.openings.length, 1);
    assert.equal(prompt.includes("private@example.com"), false);
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
