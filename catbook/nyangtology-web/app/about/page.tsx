import Image from 'next/image';
import { FitTitle } from '@/components/fit-title';
import { GojipsaNote } from '@/components/gojipsa-note';

export const metadata = {
  title: '소개',
};

export default function AboutPage() {
  return (
    <div className="narrowShell">
      <section className="detailHero">
        <p className="eyebrow">About</p>
        <FitTitle>냥톨로지는 집사의 관찰을 돕는 안내자입니다</FitTitle>
        <p className="lead">
          반려묘의 행동을 단정하거나 겁주지 않고, 보호자가 오늘 확인할 수
          있는 변화와 기록하면 좋은 내용을 차분히 정리합니다.
        </p>
      </section>

      <section className="section stack">
        <article className="card">
          <div className="gojipsaImage">
            <Image
              src="/gojipsa-icon-256.png"
              width={120}
              height={120}
              alt="고집사 안내 캐릭터"
            />
          </div>
          <h2>고집사는 무엇을 하나요?</h2>
          <GojipsaNote>
            고집사는 보호자를 재촉하지 않습니다. 행동이 언제, 어디서, 무엇과
            함께 나타나는지 볼 수 있도록 질문을 정리합니다.
          </GojipsaNote>
        </article>

        <article className="card">
          <h2>냥톨로지가 도와주는 일</h2>
          <ul>
            <li>생활 속 표현으로 행동을 검색합니다.</li>
            <li>관련 행동 신호와 환경 변화를 함께 봅니다.</li>
            <li>병원 상담 전에 정리할 메모를 안내합니다.</li>
          </ul>
        </article>

        <article className="card">
          <h2>중요한 원칙</h2>
          <p>
            이 서비스는 건강 진단이나 치료 결정을 대신하지 않습니다. 반복
            구토, 식욕 저하, 무기력, 배변·배뇨 변화처럼 건강 변화가 함께
            보이면 전문가 상담을 우선하세요.
          </p>
        </article>
      </section>
    </div>
  );
}
