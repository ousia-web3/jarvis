import Link from 'next/link';

export function SafetyBanner({
  message = '이 안내는 관찰과 상담 준비를 돕기 위한 것입니다. 진단이나 치료를 대신하지 않습니다.',
}: {
  message?: string;
}) {
  return (
    <aside className="safetyBanner" role="alert">
      <strong>안전 안내</strong>
      <p>
        {message} <Link href="/safety">안전·이용 안내 보기</Link>
      </p>
    </aside>
  );
}
