import { FitTitle } from '@/components/fit-title';

export const metadata = {
  title: '안전·이용 안내',
};

export default function SafetyPage() {
  return (
    <div className="narrowShell">
      <section className="detailHero">
        <p className="eyebrow">Safety</p>
        <FitTitle>진단이 아니라 관찰과 상담 준비입니다</FitTitle>
        <p className="lead">
          냥톨로지는 보호자가 변화를 차분히 관찰하고 기록하도록 돕습니다.
          질병 판단이나 치료 결정은 반드시 전문가 상담을 기준으로 해야 합니다.
        </p>
      </section>

      <section className="section stack">
        <article className="card">
          <h2>하지 않는 것</h2>
          <ul>
            <li>질병을 확정하지 않습니다.</li>
            <li>치료나 처방을 지시하지 않습니다.</li>
            <li>응급 여부를 단정하지 않습니다.</li>
          </ul>
        </article>
        <article className="card">
          <h2>도와주는 것</h2>
          <ul>
            <li>무엇을 먼저 관찰할지 정리합니다.</li>
            <li>기록하면 좋은 항목을 안내합니다.</li>
            <li>전문가 상담 때 말할 내용을 묶어줍니다.</li>
          </ul>
        </article>
        <article className="card">
          <h2>상담 전 메모</h2>
          <ol className="checkList">
            <li>언제부터 달라졌는지 적습니다.</li>
            <li>무엇이 얼마나 반복되는지 적습니다.</li>
            <li>식욕, 활력, 구토, 화장실 변화가 함께 있는지 적습니다.</li>
          </ol>
        </article>
      </section>
    </div>
  );
}
