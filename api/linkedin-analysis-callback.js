import { waitUntil } from "@vercel/functions";
import { getJob, saveJob, validToken } from "../src/server/linkedin-jobs.js";
import { researchLinkedinAnalysis } from "../src/server/linkedin-research.js";

async function finishResearch(job, enrichment) {
  try {
    const report = await researchLinkedinAnalysis(job.input, enrichment);
    await saveJob({ ...job, status: "complete", report });
  } catch (error) {
    console.error("LinkedIn research failed", error);
    await saveJob({ ...job, status: "failed" });
  }
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  const id = String(request.query?.jobId || "");
  const token = String(request.query?.token || "");
  if (!/^[a-f0-9]{40}$/.test(id) || !/^[a-f0-9]{48}$/.test(token)) return response.status(401).json({ error: "Unauthorized" });
  const raw = JSON.stringify(request.body || {});
  if (raw.length > 100000) return response.status(413).json({ error: "Payload too large" });
  let enrichment;
  try { enrichment = typeof request.body === "string" ? JSON.parse(request.body) : request.body; }
  catch { return response.status(400).json({ error: "Invalid JSON" }); }
  if (!enrichment || typeof enrichment !== "object" || Array.isArray(enrichment)) return response.status(400).json({ error: "Expected a JSON object" });
  try {
    const job = await getJob(id);
    if (!job || !validToken(token, job.callbackToken)) return response.status(401).json({ error: "Unauthorized" });
    if (job.status === "complete" || job.status === "researching") return response.status(200).json({ ok: true, status: job.status });
    await saveJob({ ...job, status: "researching" });
    waitUntil(finishResearch(job, enrichment));
    return response.status(202).json({ ok: true, status: "researching" });
  } catch (error) {
    console.error("Could not accept analysis callback", error);
    return response.status(503).json({ error: "Could not accept the analysis" });
  }
}
