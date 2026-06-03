import { writeFileSync } from "node:fs";
import { buildWelcomeEmail } from "../lib/welcomeEmail";
const withRegion = buildWelcomeEmail({ email: "dad@example.com", region: "tampa-bay" });
const statewide = buildWelcomeEmail({ email: "dad@example.com" });
const page = `<!doctype html><html><head><meta charset="utf-8"><title>${withRegion.subject}</title>
<style>body{background:#f1f5f9;margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif}
.meta{max-width:560px;margin:0 auto 8px;font-size:12px;color:#64748b}
.lbl{max-width:560px;margin:24px auto 6px;font-weight:700;color:#0a1628;text-transform:uppercase;letter-spacing:1px;font-size:13px}</style>
</head><body>
<div class="meta">Subject: <strong>${withRegion.subject}</strong></div>
<div class="lbl">Region-tailored (Tampa Bay)</div>${withRegion.html}
<div class="lbl">Statewide (no region selected)</div>${statewide.html}
</body></html>`;
writeFileSync("/tmp/welcome-email.html", page);
console.log("Subject:", withRegion.subject);
console.log("\n--- PLAIN TEXT (region-tailored) ---\n");
console.log(withRegion.text);
