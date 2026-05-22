#!/usr/bin/env node
// One-off: download remaining logos from Drive + trim transparent padding
// from every dual-variant logo so visible artwork fills the bounding box.

import { writeFile, readFile, readdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGOS_DIR = join(__dirname, "..", "public", "logos");

const TO_DOWNLOAD = [
  ["1XDO05A3SSrfBctGV-T0v2UdoCGAh2p5X", "hubspot-orange.png"],
  ["1-QqcBA10c5My_2BPX3LLnuV5N8X9HAJ7", "hubspot-white.png"],
  ["1f60cnjuK_5oE4WwnJXQlO4vDC2JkDsjl", "leostream-black.png"],
  ["152lUhccNBKbVVJi06Is9v-lIpUrPpqce", "leostream-white.png"],
  ["1wRjBWWy_WzWsbhMFjMbBNgmnErdsEzCf", "scrypt-orange.png"],
  ["1ASXj_or8sFgtc9FItS9SkKBr7Y-ijnzi", "blueprint-black.png"],
  ["1Jd3baMKvSi80wnAUBT1zpNe5tV4JDWT9", "blueprint-white.png"],
  ["1ywRpZ-NMQSTbBEdDPM3LEbkIsUTj-z8f", "trawa-black.png"],
  ["1509Fy_N7sj6PIUChcYmKUUgaoiGziVsm", "trawa-white.png"],
  ["1b-de9yP6uuZ9rM_lH0dmGxNn1QaU0qyl", "sysdyne-black.png"],
  ["1aX0uJ7zIlzJvS8evD8gpqIB9G5J1hFIM", "sysdyne-white.png"],
  ["18qb_04_csEertC2XaLLxts8yojKk8Eyf", "orca-black.png"],
  ["1wDHWfwMNgVE2ofS09WMIv3osze0Y93Sw", "orca-white.png"],
  ["1UWjAnD1fcTo0y8_4_BHAdqPyUR98Hlv8", "ohalo-blue.webp"],
  ["1X8SSwVqrmKyUDuvTAdsNFWbOt3tQfasi", "ohalo-white.png"],
  ["1JmVVjPTGcyn8N-xcOMcQF9XL82rEaf9G", "hyco-black.png"],
  ["1rBsPho5ZXibraBrdNSjLeAJKhb7iuMYC", "hyco-white.png"],
  ["1tX67s2LDdGrIqCTOvOty6u9fr9GAYlVM", "bound-black.avif"],
  ["1WgRrq488lrELsLXSFd0Hofo2oZbZPUIe", "bound-white.avif"],
  ["1SZW4-IHRcSIANlRP1KjC0F5NXWwJCbHv", "lipdub-white.avif"],
  ["1SDVVSeqzgNyD-orQGe7-zhBSjWIPjvmF", "mybites-white.png"],
];

// Every file that should be trimmed (raster variants only).
const TO_TRIM = [
  "adthena-black.png", "adthena-white.png",
  "blueprint-black.png", "blueprint-white.png",
  "bound-black.avif", "bound-white.avif",
  "condenzero-black.png", "condenzero-white.png",
  "dualentry-black.png", "dualentry-white.png",
  "ekipa-black.png", "ekipa-white.png",
  "emlen-black.png", "emlen-white.png",
  "hubspot-orange.png", "hubspot-white.png",
  "hyco-black.png", "hyco-white.png",
  "leostream-black.png", "leostream-white.png",
  "lipdub-black.png", "lipdub-white.avif",
  "mybites-white.png",
  "ohalo-blue.webp", "ohalo-white.png",
  "orca-black.png", "orca-white.png",
  "scrypt-orange.png",
  "skillfit-darkblue.png", "skillfit-white.png",
  "skribble-black.png", "skribble-white.png",
  "slabstack-black.png", "slabstack-white.png",
  "strategyzer-black.png", "strategyzer-white.png",
  "sysdyne-black.png", "sysdyne-white.png",
  "trawa-black.png", "trawa-white.png",
  "workleap-black.png", "workleap-white.png",
];

async function downloadFile(id, name) {
  const url = `https://drive.google.com/uc?export=download&id=${id}`;
  const dest = join(LOGOS_DIR, name);
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Download failed for ${name}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

async function trimImage(filename) {
  const path = join(LOGOS_DIR, filename);
  if (!existsSync(path)) {
    console.log(`SKIP ${filename}: not found`);
    return;
  }
  const original = await readFile(path);
  // Trim transparent edges. threshold=10 keeps anti-aliased edges; background
  // detection picks up alpha=0 automatically when image has alpha channel.
  const trimmed = sharp(original).trim({ threshold: 10 });
  const meta = await sharp(original).metadata();
  const outBuf = await trimmed.toBuffer({ resolveWithObject: true });
  const newMeta = outBuf.info;
  // Overwrite the file. Preserve format based on extension.
  const ext = extname(filename).toLowerCase();
  let finalBuf;
  if (ext === ".png") {
    finalBuf = await sharp(outBuf.data).png().toBuffer();
  } else if (ext === ".webp") {
    finalBuf = await sharp(outBuf.data).webp().toBuffer();
  } else if (ext === ".avif") {
    finalBuf = await sharp(outBuf.data).avif().toBuffer();
  } else {
    finalBuf = outBuf.data;
  }
  await writeFile(path, finalBuf);
  console.log(
    `TRIM ${filename}: ${meta.width}x${meta.height} -> ${newMeta.width}x${newMeta.height} ` +
    `(aspect ${(newMeta.width / newMeta.height).toFixed(2)}:1)`
  );
}

(async () => {
  console.log("=== Downloading missing files ===");
  for (const [id, name] of TO_DOWNLOAD) {
    const path = join(LOGOS_DIR, name);
    if (existsSync(path)) {
      console.log(`SKIP ${name}: already exists`);
      continue;
    }
    try {
      const size = await downloadFile(id, name);
      console.log(`OK   ${name}: ${size} bytes`);
    } catch (e) {
      console.log(`FAIL ${name}: ${e.message}`);
    }
  }

  console.log("\n=== Trimming logos ===");
  for (const filename of TO_TRIM) {
    try {
      await trimImage(filename);
    } catch (e) {
      console.log(`FAIL ${filename}: ${e.message}`);
    }
  }
  console.log("\nDone.");
})();
