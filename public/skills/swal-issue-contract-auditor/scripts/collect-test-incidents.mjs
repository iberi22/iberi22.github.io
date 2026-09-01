#!/usr/bin/env node
// collect-test-incidents.mjs — ejemplo colector tests → incidents.json agrupado por isla
// Uso: vitest run --reporter=json --outputFile=/tmp/vitest.json && node scripts/collect-test-incidents.mjs --input /tmp/vitest.json --out incidents.json
import { readFileSync, writeFileSync } from "node:fs";

const args = Object.fromEntries(process.argv.slice(2).map((a,i,arr)=> a.startsWith("--") ? [a.slice(2), arr[i+1]?.startsWith("--") ? "true" : arr[i+1]] : []).filter(Boolean));
const input = args.input || "/tmp/vitest.json";
const out = args.out || "incidents.json";

let data;
try { data = JSON.parse(readFileSync(input, "utf8")); } catch(e){
  console.error(`No se pudo leer ${input}: ${e.message}`);
  console.log(JSON.stringify({ hint: "Ejecuta: vitest run --reporter=json --outputFile=/tmp/vitest.json antes de este script.", incidents: [] }, null, 2));
  process.exit(0);
}

const files = new Map();
const push = (file, kind, detail) => {
  const island = file.split("/").slice(0,3).join("/");
  const key = `${island}::${kind}`;
  if(!files.has(key)) files.set(key, { file, island, kind, count: 0, examples: [] });
  const r = files.get(key); r.count++; if(r.examples.length<3) r.examples.push(detail);
};

for(const suite of (data.testResults || data.testSuites || [])){
  for(const t of (suite.assertionResults || suite.tests || [])){
    if(t.status==="failed" || t.status==="FAILED"){
      push(t.location || t.title || suite.name || "unknown", "test-failure", t.failureMessage?.slice(0,120) || t.title);
    }
  }
}
// fallback: si el JSON no tiene esa forma, intenta heurística
if(files.size===0){
  const txt = JSON.stringify(data).slice(0,50000);
  const matches = [...txt.matchAll(/"file"\s*:\s*"([^"]+)"/g)].slice(0,20);
  for(const m of matches) push(m[1], "signal", m[1]);
}

const incidents = [...files.values()].map(v=> ({
  source: "vitest",
  file: v.file,
  island: v.island,
  kind: v.kind,
  count: v.count,
  suggested_island: v.island,
  examples: v.examples,
}));

writeFileSync(out, JSON.stringify({ generated_at: new Date().toISOString(), total: incidents.length, incidents }, null, 2));
console.log(`✓ ${incidents.length} grupos → ${out}`);
for(const inc of incidents.slice(0,10)){
  console.log(`  - ${inc.island} :: ${inc.kind} ×${inc.count}  e.g. ${inc.examples[0]?.slice(0,60) || ""}`);
}
