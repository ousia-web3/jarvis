import { Suspense } from 'react';
import { AskPanel } from '@/components/ask-panel';
import { FitTitle } from '@/components/fit-title';

export const metadata = {
  title: '질문하기',
};

export default function AskPage() {
  return (
    <div className="narrowShell">
      <section className="detailHero askHero">
        <p className="eyebrow">Ask</p>
        <FitTitle>궁금한 행동을 문장으로 물어보세요</FitTitle>
        <p className="lead">
          냥톨로지가 관련 신호를 찾아 진단 대신 관찰 순서, 집에서 해볼 일,
          상담 전 메모를 정리합니다.
        </p>
      </section>
      <Suspense fallback={<div className="pageLoadingWrap" />}>
        <AskPanel />
      </Suspense>
    </div>
  );
}
