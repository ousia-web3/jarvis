import { defineConfig } from '@apps-in-toss/web-framework/config';

/**
 * AppsInToss Granite Web 설정.
 * 콘솔에 등록한 appName·displayName·icon과 반드시 일치시켜 주세요.
 * @see docs/apps-in-toss-setup.md
 */
export default defineConfig({
  appName: 'nyangtology',
  brand: {
    displayName: '냥톨로지 고집사',
    primaryColor: '#3182f6',
    icon: 'https://nyangtology.vercel.app/gojipsa-icon-512.png',
  },
  web: {
    host: process.env.AIT_WEB_HOST ?? 'localhost',
    port: 3000,
    commands: {
      dev: 'next dev --hostname 0.0.0.0 --port 3000',
      build: 'next build',
    },
  },
  permissions: [],
  outdir: 'out',
  webViewProps: {
    bounces: true,
    pullToRefreshEnabled: true,
    allowsInlineMediaPlayback: false,
    overScrollMode: 'never',
  },
});
