import Link from 'next/link';

const fallbackMemoItems = [
  '언제부터 달라졌는지',
  '얼마나 자주 반복되는지',
  '식욕, 활력, 화장실 변화가 함께 있는지',
];

export function ConsultWhenCta({
  memoItems,
}: {
  memoItems?: string[];
}) {
  const items = (memoItems && memoItems.length ? memoItems : fallbackMemoItems)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <aside className="consultCta" aria-labelledby="consult-when-title">
      <div>
        <span className="consultCtaKicker">상담 준비</span>
        <h2 id="consult-when-title">전문가에게 물어볼 메모를 먼저 정리하세요</h2>
        <p>
          예약이나 진단 안내가 아니라, 상담 전에 놓치기 쉬운 변화를 차분히
          모아두는 카드입니다.
        </p>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="consultCtaActions">
        <Link className="primaryButton" href="/ask">
          상담 메모 정리하기
        </Link>
        <Link className="secondaryButton" href="/safety">
          안전 안내 보기
        </Link>
      </div>
    </aside>
  );
}
