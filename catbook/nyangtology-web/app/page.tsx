import Image from 'next/image';
import { HeroFitTitle } from '@/components/fit-title';
import { GojipsaNote } from '@/components/gojipsa-note';
import { InstantTransitionLink } from '@/components/instant-transition-link';
import { SearchBox } from '@/components/search-box';
import { TossBannerAd } from '@/components/toss-banner-ad';

const quickQuestions = [
  {
    query: '화장실 앞에서 울어요',
    label: '화장실 앞에서 울어요',
    kind: '건강 관찰',
    description:
      '울음과 배변·배뇨 변화가 함께 보일 때 무엇을 기록할지 살펴봅니다.',
  },
  {
    query: '밤마다 울어요',
    label: '밤마다 울어요',
    kind: '시간대 관찰',
    description:
      '밤이나 새벽에 반복되는 울음의 맥락과 동반 변화를 정리합니다.',
  },
  {
    query: '숨어요',
    label: '계속 숨어요',
    kind: '불안·환경',
    description:
      '억지로 꺼내기 전에 숨을 곳, 냄새, 동선, 시간을 먼저 봅니다.',
  },
  {
    query: '하악',
    label: '하악질해요',
    kind: '거리 요청',
    description:
      '혼내기보다 멈춤 신호로 보고, 접촉을 줄일 순서를 확인합니다.',
  },
  {
    query: '밥을 안 먹어요',
    label: '밥을 안 먹어요',
    kind: '식욕 변화',
    description:
      '기호 문제인지, 활력·통증·구토 변화가 함께 있는지 나눠 봅니다.',
  },
  {
    query: '갑자기 뛰어요',
    label: '갑자기 뛰어요',
    kind: '에너지·루틴',
    description:
      '놀이 부족, 시간대, 화장실 전후 행동을 함께 살펴봅니다.',
  },
];

function askHref(query: string) {
  return `/ask?question=${encodeURIComponent(query)}`;
}

export default function HomePage() {
  return (
    <>
      <section className="hero b2cHero">
        <div className="shell heroGrid">
          <div>
            <p className="eyebrow">반려묘 행동 안내</p>
            <HeroFitTitle>우리 고양이, 왜 이럴까?</HeroFitTitle>
            <p className="heroLead">
              낯선 행동을 병명처럼 단정하지 않고, 집사가 바로 확인할 수
              있는 관찰 순서로 풀어드립니다. 궁금한 문장을 그대로 적어보세요.
            </p>
            <SearchBox />
          </div>
          <aside className="heroPanel homeGuidePanel" aria-label="고집사 안내">
            <div className="gojipsaImage">
              <Image
                src="/gojipsa-icon-256.png"
                width={132}
                height={132}
                alt="고집사 안내 캐릭터"
                priority
              />
            </div>
            <GojipsaNote>
              고집사는 보호자를 겁주지 않고, 놓치기 쉬운 관찰 포인트와 상담
              준비 메모를 차분히 정리합니다.
            </GojipsaNote>
            <ul className="miniCheckList">
              <li>진단 대신 관찰 순서</li>
              <li>기록하면 좋은 변화</li>
              <li>병원 상담 전 정리할 말</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="sectionHeader">
            <div>
              <h2>많이 묻는 궁금증</h2>
              <p>
                검색어를 몰라도 괜찮습니다. 실제 보호자가 말하는 문장으로
                바로 시작할 수 있습니다.
              </p>
            </div>
            <InstantTransitionLink className="textLink" href="/explore">
              상황별 전체보기
            </InstantTransitionLink>
          </div>
          <div className="questionGrid">
            {quickQuestions.map((item) => (
              <InstantTransitionLink
                className="questionCard"
                href={askHref(item.query)}
                key={item.query}
              >
                <span>{item.kind}</span>
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </InstantTransitionLink>
            ))}
          </div>
        </div>
      </section>

      <section className="section tossBannerSection">
        <div className="shell">
          <TossBannerAd placement="home-questions" />
        </div>
      </section>

      <section className="section softBand">
        <div className="shell homeSplit">
          <div>
            <p className="eyebrow">How it helps</p>
            <h2>검색 결과는 답보다 관찰 순서에 가깝습니다</h2>
            <p>
              반려묘 행동은 한 단어로 끝나지 않습니다. 냥톨로지는 행동,
              시간대, 식욕, 활력, 화장실 변화를 함께 보며 다음 확인 순서를
              제안합니다.
            </p>
          </div>
          <ol className="routineSteps">
            <li>
              <span>1</span>
              <div>
                <h3>상황을 적습니다</h3>
                <p>“밤마다 울어요”처럼 평소 말투 그대로 입력합니다.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <h3>동반 변화를 봅니다</h3>
                <p>식욕, 활력, 구토, 화장실 변화가 있는지 나눠 봅니다.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <h3>상담 메모를 남깁니다</h3>
                <p>언제부터, 얼마나 자주, 무엇이 달라졌는지 정리합니다.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="homeSafetyNote">
            <strong>건강 변화가 함께 보이나요?</strong>
            <p>
              식욕 저하, 무기력, 반복 구토, 배변·배뇨 변화가 함께 있으면
              검색 결과만으로 판단하지 말고 병원 상담을 준비하세요.
            </p>
            <InstantTransitionLink href="/safety">안전 안내 보기</InstantTransitionLink>
          </div>
        </div>
      </section>
    </>
  );
}
