import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const configPath = path.join(root, 'granite.config.ts');
const config = fs.readFileSync(configPath, 'utf8');

function readString(pattern, label) {
  const match = config.match(pattern);
  if (!match) {
    throw new Error(`Unable to read ${label} from granite.config.ts`);
  }

  return match[1];
}

const expected = {
  appName: readString(/appName:\s*'([^']+)'/, 'appName'),
  displayName: readString(/displayName:\s*'([^']+)'/, 'displayName'),
  primaryColor: readString(/primaryColor:\s*'([^']+)'/, 'primaryColor'),
  icon: readString(/icon:\s*'([^']+)'/, 'icon'),
  permissions: /\bpermissions:\s*\[\]/.test(config) ? '[]' : 'check granite.config.ts',
  outdir: readString(/outdir:\s*'([^']+)'/, 'outdir'),
  defaultWebHost: config.includes("process.env.AIT_WEB_HOST ?? 'localhost'")
    ? 'localhost'
    : readString(/host:\s*'([^']+)'/, 'web.host'),
  port: readString(/port:\s*(\d+)/, 'web.port'),
  overScrollMode: readString(/overScrollMode:\s*'([^']+)'/, 'overScrollMode'),
};

const envChecks = [
  ['APPS_IN_TOSS_APP_NAME', 'appName'],
  ['APPS_IN_TOSS_DISPLAY_NAME', 'displayName'],
  ['APPS_IN_TOSS_PRIMARY_COLOR', 'primaryColor'],
  ['APPS_IN_TOSS_ICON', 'icon'],
];

console.log('# AppsInToss console sync values');
console.log('');
console.log('| Field | Expected value |');
console.log('| --- | --- |');
for (const [field, value] of Object.entries(expected)) {
  console.log(`| ${field} | \`${value}\` |`);
}

const compared = envChecks.filter(([envName]) => process.env[envName]);

if (compared.length === 0) {
  console.log('');
  console.log('No console env values were provided for comparison.');
  console.log('Optional env names: APPS_IN_TOSS_APP_NAME, APPS_IN_TOSS_DISPLAY_NAME, APPS_IN_TOSS_PRIMARY_COLOR, APPS_IN_TOSS_ICON');
  process.exit(0);
}

let hasMismatch = false;
console.log('');
console.log('| Console env | Expected | Actual | Result |');
console.log('| --- | --- | --- | --- |');
for (const [envName, field] of compared) {
  const actual = process.env[envName] ?? '';
  const matches = actual === expected[field];
  hasMismatch ||= !matches;
  console.log(`| ${envName} | \`${expected[field]}\` | \`${actual}\` | ${matches ? 'Pass' : 'Mismatch'} |`);
}

if (hasMismatch) {
  process.exit(1);
}
