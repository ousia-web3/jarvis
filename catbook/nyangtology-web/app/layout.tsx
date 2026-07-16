import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { BottomTab } from '@/components/bottom-tab';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: {
    default: '냥톨로지',
    template: '%s | 냥톨로지',
  },
  description:
    '반려묘의 낯선 행동을 보호자가 차분히 관찰하고 기록할 수 있도록 돕는 모바일 안내 서비스입니다.',
  applicationName: '냥톨로지',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/gojipsa-icon-256.png',
    apple: '/gojipsa-icon-256.png',
  },
  openGraph: {
    title: '냥톨로지',
    description:
      '고양이 행동이 궁금할 때, 진단 대신 관찰 순서와 상담 준비 메모를 안내합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f7f9fb',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <footer className="siteFooter" aria-label="서비스 정보">
          <div>
            <Link href="/about">냥톨로지 소개</Link>
            <span aria-hidden="true">/</span>
            <Link href="/safety">안전·이용 안내</Link>
          </div>
          <p>
            냥톨로지는 진단을 대신하지 않습니다. 보호자가 변화를 놓치지 않고
            관찰하며, 필요할 때 병원 상담을 준비하도록 돕습니다.
          </p>
        </footer>
        <BottomTab />
      </body>
    </html>
  );
}
