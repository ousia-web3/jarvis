import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function check(condition, message) {
  if (condition) {
    console.log(`ok - ${message}`);
    return;
  }

  failures.push(message);
  console.error(`fail - ${message}`);
}

function walk(relativeDir, results = []) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    return results;
  }

  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      walk(relativePath, results);
      continue;
    }

    if (/\.(?:ts|tsx|js|jsx)$/.test(entry.name)) {
      results.push(relativePath);
    }
  }

  return results;
}

const packageJson = JSON.parse(readText('package.json'));
check(packageJson.name === 'nyangtology-web', 'package name stays nyangtology-web');
check(
  Boolean(packageJson.dependencies?.['@apps-in-toss/web-framework']),
  '@apps-in-toss/web-framework is installed'
);

const layout = readText('app/layout.tsx');
check(/export const viewport/.test(layout), 'Next viewport metadata is declared');
check(/initialScale:\s*1/.test(layout), 'viewport initialScale is 1');
check(/maximumScale:\s*1/.test(layout), 'viewport maximumScale is 1 for WebView review');
check(/userScalable:\s*false/.test(layout), 'viewport userScalable is disabled for WebView review');

const granite = readText('granite.config.ts');
check(/defineConfig/.test(granite), 'granite.config.ts uses defineConfig');
check(/appName:\s*'nyangtology'/.test(granite), 'granite appName is nyangtology');
check(/icon:\s*'https:\/\/nyangtology\.vercel\.app\/gojipsa-icon-512\.png'/.test(granite), 'granite brand icon is configured');
check(/permissions:\s*\[\]/.test(granite), 'Phase 1 permissions stay empty');
check(/outdir:\s*'out'/.test(granite), 'AIT output directory is static export out');
check(/build:\s*'next build'/.test(granite), 'AIT build delegates to Next build');
check(/webViewProps/.test(granite), 'WebView props are configured');
check(/overScrollMode:\s*'never'/.test(granite), 'Android overscroll is disabled');

const nextConfig = readText('next.config.ts');
check(/AIT_STATIC_EXPORT/.test(nextConfig), 'Next config enables the AppsInToss static export mode');
check(/output:\s*'export'/.test(nextConfig), 'Next config writes a static export for AIT builds');

const globalTypes = readText('global.d.ts');
check(/declare module ['"]\*\.css['"]/.test(globalTypes), 'global CSS side-effect imports are typed');

const scenarioAssets = readText('lib/scenario-assets.ts');
check(
  !/\/images\/(?:chapters|concepts|scenarios)\/[^'"]+\.png/.test(scenarioAssets),
  'chapter, concept, and scenario assets use WebP'
);

const setupDocPath = 'docs/apps-in-toss-setup.md';
check(fs.existsSync(path.join(root, setupDocPath)), 'AppsInToss setup document exists');

if (fs.existsSync(path.join(root, setupDocPath))) {
  const setupDoc = readText(setupDocPath);
  check(
    setupDoc.includes('https://developers-apps-in-toss.toss.im/tutorials/ai-vibe-coding.html'),
    'AI vibe coding guide is linked'
  );
  check(
    setupDoc.includes('https://developers-apps-in-toss.toss.im/tutorials/webview.html'),
    'WebView migration guide is linked'
  );
  check(
    setupDoc.includes('https://developers-apps-in-toss.toss.im/release-note.html'),
    'release notes are linked'
  );
  check(
    setupDoc.includes('IntegratedAd.html'),
    'IntegratedAd guide is linked for the result ad gate'
  );
  check(
    setupDoc.includes('BannerAd.html'),
    'WebView BannerAd guide is linked for inline ads'
  );
  check(
    setupDoc.includes('RN-BannerAd.html'),
    'React Native banner guide is documented as not applicable'
  );
}

const envExample = readText('.env.example');
check(
  /NEXT_PUBLIC_NYANGTOLOGY_AD_GATE_ENABLED=0/.test(envExample),
  'ad gate is disabled by default'
);
check(
  /NEXT_PUBLIC_AIT_INTEGRATED_AD_GROUP_ID=/.test(envExample),
  'integrated ad group ID env placeholder exists'
);
check(
  /NEXT_PUBLIC_NYANGTOLOGY_BANNER_AD_ENABLED=0/.test(envExample),
  'banner ad is disabled by default'
);
check(
  /NEXT_PUBLIC_AIT_BANNER_AD_GROUP_ID=/.test(envExample),
  'banner ad group ID env placeholder exists'
);

const bannerAd = readText('components/toss-banner-ad.tsx');
check(/TossAds\.initialize/.test(bannerAd), 'banner ads initialize TossAds');
check(/TossAds\.attachBanner/.test(bannerAd), 'banner ads use attachBanner');
check(/banner\?\.destroy\(\)/.test(bannerAd), 'banner ads are destroyed on unmount');
check(/onNoFill/.test(bannerAd), 'banner ads handle no-fill responses');
check(/onAdFailedToRender/.test(bannerAd), 'banner ads handle render failures');

const codeFiles = ['app', 'components', 'lib'].flatMap((dir) => walk(dir));
const iframeMatches = codeFiles.filter((filePath) => /\biframe\b|<iframe\b/i.test(readText(filePath)));
check(iframeMatches.length === 0, `no iframe usage in runtime code (${iframeMatches.join(', ') || 'none'})`);

if (failures.length > 0) {
  console.error('\nAppsInToss compliance check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('\nAppsInToss compliance check passed.');
