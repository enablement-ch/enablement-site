import { timingSafeEqual } from "node:crypto";

const ttlSeconds = 24 * 60 * 60;
const key = (id) => `linkedin-analysis:${id}`;

function credentials() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("LinkedIn analysis job store is not configured");
  return { url, token };
}

async function command(...args) {
  const { url, token } = credentials();
  const response = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Job store returned ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(`Job store: ${data.error}`);
  return data.result;
}

export async function createJob(id, callbackToken, input) {
  const job = { id, callbackToken, input, status: "waiting_for_clay", createdAt: new Date().toISOString() };
  const result = await command("SET", key(id), JSON.stringify(job), "EX", ttlSeconds, "NX");
  if (result !== "OK") throw new Error("Could not create analysis job");
  return job;
}

export async function getJob(id) {
  const value = await command("GET", key(id));
  return value ? JSON.parse(value) : null;
}

export async function saveJob(job) {
  job.updatedAt = new Date().toISOString();
  await command("SET", key(job.id), JSON.stringify(job), "EX", ttlSeconds);
}

export function validToken(actual, expected) {
  if (typeof actual !== "string" || typeof expected !== "string") return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function publicJob(job) {
  return {
    id: job.id,
    status: job.status,
    stage: job.status === "researching" ? job.stage : undefined,
    companyDomain: job.input.companyDomain,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    report: job.status === "complete" ? job.report : undefined,
    message: job.status === "failed" ? (job.failureReason === "data_capacity"
      ? "The analysis service is temporarily unavailable. Please try again later or book a free audit below."
      : "The analysis could not be completed. Please try again later.") : undefined,
  };
}
