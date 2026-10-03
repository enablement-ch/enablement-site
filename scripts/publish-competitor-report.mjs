import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: npm run publish:competitor-report -- path/to/report.json");
  process.exit(1);
}

const source = JSON.parse(readFileSync(resolve(inputPath), "utf8"));
const required = ["companyName", "companyDomain", "category", "window", "headline", "summary", "consequence", "handoff"];
for (const field of required) {
  if (typeof source[field] !== "string" || !source[field].trim()) throw new Error(`Missing ${field}`);
}
if (!Number.isInteger(source.screenedCompanies) || source.screenedCompanies < 1) throw new Error("screenedCompanies must be a positive integer");
for (const field of ["voices", "themes", "openings"]) {
  if (!Array.isArray(source[field])) throw new Error(`${field} must be an array`);
}
if (source.openings.length < 2 || source.openings.length > 5) throw new Error("Provide 2 to 5 credible content openings");
for (const voice of source.voices) {
  for (const field of ["name", "title", "company"]) if (!voice[field]) throw new Error(`Voice is missing ${field}`);
  if (!Number.isInteger(voice.posts) || voice.posts < 0) throw new Error("Each voice needs a valid post count");
  for (const field of ["linkedinUrl", "representativePostUrl"]) {
    if (voice[field] && !/^https:\/\/(www\.)?linkedin\.com\//.test(voice[field])) throw new Error(`${field} must be a LinkedIn URL`);
  }
}
for (const theme of source.themes) for (const field of ["title", "explanation", "owner"]) if (!theme[field]) throw new Error(`Theme is missing ${field}`);
for (const opening of source.openings) for (const field of ["title", "whyItFits", "buyerProblem", "firstMove"]) if (!opening[field]) throw new Error(`Opening is missing ${field}`);

const slug = source.reportSlug || `${source.companyDomain.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}-${randomBytes(9).toString("hex")}`;
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) throw new Error("Invalid reportSlug");
const report = { ...source, slug, generatedAt: new Date().toISOString() };
const folder = resolve("src/data/competitor-reports");
mkdirSync(folder, { recursive: true });
const output = join(folder, `${slug}.json`);
writeFileSync(output, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
console.log(`Report file: ${output}`);
console.log(`After deployment: https://www.enablement.ch/resources/linkedin-analysis/${slug}`);
