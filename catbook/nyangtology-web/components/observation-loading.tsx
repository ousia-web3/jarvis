'use client';

import { useEffect, useId, useState } from 'react';

const answerSteps = ['질문 읽기', '신호 찾기', '관찰 순서'];
const pageSteps = ['자료 찾기', '카드 펼치기', '순서 맞추기'];

const loadingNotes = [
  '울음, 숨는 자리, 식욕 변화를 함께 떠올려보세요.',
  '갑자기 시작됐는지, 반복되는 시간대가 있는지 살펴봐요.',
  '평소와 다른 몸짓은 짧게 메모해두면 상담에 도움이 됩니다.',
];

type ObservationLoadingProps = {
  mode?: 'answer' | 'page';
};

export function ObservationLoading({
  mode = 'answer',
}: ObservationLoadingProps) {
  const [activeNote, setActiveNote] = useState(0);
  const titleId = useId();
  const isPage = mode === 'page';
  const steps = isPage ? pageSteps : answerSteps;
  const title = isPage
    ? '관찰 카드를 펼치는 중이에요'
    : '고집사가 답변 카드를 정리하고 있어요';
  const detail = isPage
    ? '필요한 신호를 가지런히 꺼내고 있어요.'
    : '질문 속 단서를 발자국 순서로 맞춰볼게요.';

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveNote((current) => (current + 1) % loadingNotes.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="observationLoader" aria-labelledby={titleId}>
      <span className="srOnly" role="status" aria-live="polite">
        {title}
      </span>

      <div className="loaderMascot" aria-hidden="true">
        <span className="loaderEar leftEar" />
        <span className="loaderEar rightEar" />
        <span className="loaderFace">
          <span className="loaderEye leftEye" />
          <span className="loaderEye rightEye" />
          <span className="loaderNose" />
          <span className="loaderWhisker leftWhisker" />
          <span className="loaderWhisker rightWhisker" />
        </span>
        <span className="loaderPaw leftPaw" />
        <span className="loaderPaw rightPaw" />
      </div>

      <div className="loaderCopy">
        <p className="eyebrow">고집사 대기실</p>
        <h2 id={titleId}>{title}</h2>
        <p>{detail}</p>

        <div className="loaderSteps" aria-hidden="true">
          {steps.map((step, index) => (
            <span className={index === activeNote ? 'isActive' : ''} key={step}>
              {step}
            </span>
          ))}
        </div>

        <button
          className="loaderNoteButton"
          onClick={() =>
            setActiveNote((current) => (current + 1) % loadingNotes.length)
          }
          type="button"
        >
          <span>관찰 쪽지 {activeNote + 1}/3</span>
          <strong>{loadingNotes[activeNote]}</strong>
        </button>
      </div>
    </section>
  );
}
