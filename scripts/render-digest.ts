/**
 * Preview "The Sideline" region digests in your browser.
 *   npx tsx scripts/render-digest.ts
 */
import { writeFileSync } from "node:fs";
import { buildRegionDigest } from "../lib/digestEmail";

async function main() {
  const editions = await Promise.all([
    buildRegionDigest(null), // statewide
    buildRegionDigest("south-florida"),
    buildRegionDigest("tampa-bay"),
    buildRegionDigest("jacksonville-ne"),
  ]);

  const page = `<!doctype html><html><head><meta charset="utf-8"><title>The Sideline — digest previews</title>
<style>body{background:#f1f5f9;margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif}
.lbl{max-width:600px;margin:28px auto 8px;font-weight:700;color:#0a1628;text-transform:uppercase;letter-spacing:1px;font-size:13px}
.sub{max-width:600px;margin:0 auto 6px;font-size:12px;color:#64748b}</style></head><body>
${editions
  .map(
    (e) =>
      `<div class="lbl">${e.label} edition</div><div class="sub">Subject: <strong>${e.subject}</strong></div>${e.html}`
  )
  .join("")}
</body></html>`;

  writeFileSync("/tmp/sideline-digests.html", page);
  console.log(`Wrote /tmp/sideline-digests.html — ${editions.length} editions:`);
  editions.forEach((e) => console.log(`  • ${e.label}: ${e.subject}`));
}

main();
