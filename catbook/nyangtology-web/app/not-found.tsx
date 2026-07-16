import Link from 'next/link';
import { FitTitle } from '@/components/fit-title';

export default function NotFound() {
  return (
    <div className="narrowShell">
      <section className="detailHero">
        <p className="eyebrow">Not found</p>
        <FitTitle>연결된 관찰 항목을 찾지 못했습니다</FitTitle>
        <p className="lead">
          홈이나 탐색에서 다시 시작해 주세요. 검색어를 바꾸면 더 가까운
          신호를 찾을 수 있습니다.
        </p>
        <div className="utilityLinks">
          <Link href="/">홈으로</Link>
          <Link href="/explore">탐색으로</Link>
        </div>
      </section>
    </div>
  );
}
