import { Suspense } from 'react';
import { FitTitle } from '@/components/fit-title';
import { SearchResults } from '@/components/search-results';

export const metadata = {
  title: '검색',
};

export default function SearchPage() {
  return (
    <div className="narrowShell">
      <section className="detailHero">
        <p className="eyebrow">Search</p>
        <FitTitle>궁금한 행동을 그대로 적어보세요</FitTitle>
        <p className="lead">
          결과는 진단이 아니라 관찰을 시작할 수 있는 관련 항목입니다. 행동,
          시간대, 식욕, 활력, 화장실 변화를 함께 살펴보세요.
        </p>
      </section>

      <Suspense fallback={<div className="pageLoadingWrap" />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
