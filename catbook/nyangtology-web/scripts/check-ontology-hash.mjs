import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const runtimeRoot = path.join(projectRoot, 'ontology_runtime');
const snapshotPath = path.join(runtimeRoot, 'content', 'ontology-snapshot.json');
const manifestPath = path.join(runtimeRoot, 'server-manifest.json');

const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : null;
const sqlitePath = path.join(runtimeRoot, 'content', snapshot.sqlite);
const sqliteHash = createHash('sha256')
  .update(readFileSync(sqlitePath))
  .digest('hex');

const expected = {
  snapshotDate: '2026-07-06',
  sqliteSha256: '9ba0cb366e720c72aef84b281e60811841f3002c2aab18875ea445c8e41d8c88',
  counts: {
    nodes: 956,
    edges: 4099,
    sources: 1304,
    relation_assertions: 8763,
    safety_sensitive_concepts: 13,
  },
};

const failures = [];

if (snapshot.snapshot_date !== expected.snapshotDate) {
  failures.push(
    `snapshot_date expected ${expected.snapshotDate}, got ${snapshot.snapshot_date}`
  );
}

if (sqliteHash !== expected.sqliteSha256) {
  failures.push(
    `sqlite sha256 expected ${expected.sqliteSha256}, got ${sqliteHash}`
  );
}

for (const [key, value] of Object.entries(expected.counts)) {
  if (snapshot.counts?.[key] !== value) {
    failures.push(`snapshot counts.${key} expected ${value}, got ${snapshot.counts?.[key]}`);
  }

  if (manifest && manifest.content_snapshot?.[key] !== value) {
    failures.push(
      `manifest content_snapshot.${key} expected ${value}, got ${manifest.content_snapshot?.[key]}`
    );
  }
}

if (snapshot.rdf_status !== 'pass') {
  failures.push(`snapshot rdf_status expected pass, got ${snapshot.rdf_status}`);
}

if (manifest && manifest.content_snapshot?.rdf_status !== 'pass') {
  failures.push(
    `manifest content_snapshot.rdf_status expected pass, got ${manifest.content_snapshot?.rdf_status}`
  );
}

if (failures.length) {
  console.error('Ontology snapshot gate failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Ontology snapshot gate passed: ${expected.snapshotDate}, sqlite ${sqliteHash.slice(0, 12)}...`
);
