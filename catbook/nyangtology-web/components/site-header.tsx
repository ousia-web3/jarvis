import Link from 'next/link';
import { NyangtologyLogo } from '@/components/nyangtology-logo';

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <div className="shell siteHeaderInner">
        <Link href="/" className="brandMark" aria-label="냥톨로지 홈">
          <NyangtologyLogo />
        </Link>
        <nav className="siteNav" aria-label="주요 메뉴">
          <Link href="/">홈</Link>
          <Link href="/ask">질문하기</Link>
          <Link href="/explore">궁금증</Link>
          <Link href="/safety">안전 안내</Link>
          <Link href="/about">소개</Link>
        </nav>
      </div>
    </header>
  );
}
