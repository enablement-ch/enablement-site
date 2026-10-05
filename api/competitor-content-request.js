import { randomBytes } from "node:crypto";
import { createJob, saveJob } from "../src/server/linkedin-jobs.js";

function send(response, status, body) {
  response.status(status).json(body);
}

function domainFromInput(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw || raw.length > 255 || /[\s@]/.test(raw)) return null;
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const domain = url.hostname.replace(/^www\./, "");
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain) || domain.includes("..")) return null;
    return domain;
  } catch { return null; }
}

function linkedinProfile(value) {
  try {
    const url = new URL(String(value || "").trim());
    if (url.protocol !== "https:" || !["linkedin.com", "www.linkedin.com"].includes(url.hostname)) return null;
    if (!/^\/in\/[a-z0-9_-]+\/?$/i.test(url.pathname)) return null;
    return `https://www.linkedin.com${url.pathname.replace(/\/$/, "")}/`;
  } catch { return null; }
}

function safeText(value, max = 150) {
  return String(value || "").trim().slice(0, max);
}

export default async function handler(request, response) {
  if (request.method !== "POST") return send(response, 405, { error: "Method not allowed" });
  const raw = JSON.stringify(request.body || "");
  if (raw.length > 8000) return send(response, 413, { error: "Request is too large" });
  let body;
  try { body = typeof request.body === "string" ? JSON.parse(request.body) : request.body || {}; }
  catch { return send(response, 400, { error: "Invalid request" }); }
  if (body.website) return send(response, 200, { ok: true }); // Honeypot.

  const companyDomain = domainFromInput(body.companyDomain);
  const linkedinUrl = linkedinProfile(body.linkedinUrl);
  if (!companyDomain) return send(response, 400, { error: "Enter a valid company domain." });
  if (!linkedinUrl) return send(response, 400, { error: "Enter your personal LinkedIn profile URL." });

  const webhookUrl = "https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-00ea8418-d321-481a-bf50-c3e3d30e7bbe";
  const jobId = randomBytes(20).toString("hex");
  const callbackToken = randomBytes(24).toString("hex");
  const callbackOrigin = process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}` : "https://www.enablement.ch";
  const callbackUrl = `${callbackOrigin}/api/linkedin-analysis-callback?jobId=${jobId}&token=${callbackToken}`;
  try {
    await createJob(jobId, callbackToken, { companyDomain, linkedinUrl });
  } catch (error) {
    console.error("Could not create analysis job", error);
    return send(response, 503, { error: "The analysis is temporarily unavailable. Please try again." });
  }

  const payload = {
    source: "website_linkedin_analysis",
    requestType: "linkedin_analysis",
    analysisType: "competitor_content_pull",
    companyDomain,
    linkedinUrl,
    jobId,
    callbackUrl,
    pageUrl: safeText(body.pageUrl, 500),
    referrer: safeText(body.referrer, 500),
    utmSource: safeText(body.utmSource, 120),
    utmMedium: safeText(body.utmMedium, 120),
    utmCampaign: safeText(body.utmCampaign, 120),
    utmTerm: safeText(body.utmTerm, 120),
    utmContent: safeText(body.utmContent, 120),
    submittedAt: new Date().toISOString(),
  };

  try {
    const result = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    });
    if (!result.ok) throw new Error(`Webhook returned ${result.status}`);
    return send(response, 200, { ok: true, jobId });
  } catch (error) {
    console.error("Competitor content request failed", error);
    try {
      await saveJob({ id: jobId, input: { companyDomain, linkedinUrl }, status: "failed", createdAt: new Date().toISOString() });
    } catch (storeError) { console.error("Could not mark failed analysis job", storeError); }
    return send(response, 502, { error: "We could not receive your request. Please try again." });
  }
}
