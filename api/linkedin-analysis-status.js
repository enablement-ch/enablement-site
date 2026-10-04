import { getJob, publicJob } from "../src/server/linkedin-jobs.js";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });
  const id = String(request.query?.jobId || "");
  if (!/^[a-f0-9]{40}$/.test(id)) return response.status(400).json({ error: "Invalid job ID" });
  try {
    const job = await getJob(id);
    if (!job) return response.status(404).json({ error: "Analysis expired or not found" });
    return response.status(200).json(publicJob(job));
  } catch (error) {
    console.error("Could not read analysis status", error);
    return response.status(503).json({ error: "Status is temporarily unavailable" });
  }
}
