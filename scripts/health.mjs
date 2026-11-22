// Smoke check of the live demo after a deploy: the page, the model index and the smallest model with its
// vocabulary. Read-only, no dependencies.
// Usage: SITE_URL=https://<owner>.github.io/next-word-prediction/ pnpm health   (the deploy workflow runs it)
const raw = process.env.SITE_URL?.trim();
if (!raw) {
  console.error("health: SITE_URL is not set");
  process.exit(1);
}
const base = raw.endsWith("/") ? raw : `${raw}/`;

const checks = [
  { path: "", contains: "Next-word Prediction" },
  { path: "models/sentences/meta.json", contains: '"window": 5' },
  { path: "models/sentences/vocab.json", contains: '"Embrace"' },
  { path: "models/sentences/forms.json", contains: '"dreams":["dream"]' },
  { path: "models/sentences/model.onnx", minBytes: 3_000_000 },
];

let failed = false;
for (const { path, contains, minBytes } of checks) {
  const url = `${base}${path}`;
  try {
    const response = await fetch(url, { headers: { "cache-control": "no-cache" } });
    const body = Buffer.from(await response.arrayBuffer());
    const ok =
      response.status === 200 &&
      (!contains || body.toString("utf8").includes(contains)) &&
      (!minBytes || body.length >= minBytes);
    console.log(`${ok ? "ok  " : "FAIL"} ${response.status} ${url} (${body.length} bytes)`);
    if (!ok) failed = true;
  } catch (error) {
    console.log(`FAIL ${url} (${error instanceof Error ? error.message : error})`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
