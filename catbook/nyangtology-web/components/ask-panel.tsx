'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from './badge';
import { AdGatePrompt } from './ad-gate-prompt';
import { InstantTransitionLink } from './instant-transition-link';
import { ObservationLoading } from './observation-loading';
import {
  recordAdGateResultAccess,
  shouldGateResultAccess,
} from '@/lib/ad-gate';
import {
  preloadNyangtologyIntegratedAd,
  showNyangtologyIntegratedAd,
} from '@/lib/apps-in-toss-integrated-ad';
import { askQuestion } from '@/lib/ontology';
import type { AskData, Envelope, OntologyNode } from '@/lib/types';

const isAppsInTossStaticExport =
  process.env.NEXT_PUBLIC_AIT_STATIC_EXPORT === '1';

const examples = [
  '화장실 앞에서 울어요',
  '밤마다 울어요',
  '계속 숨어요',
  '하악질해요',
];

function searchHref(query: string) {
  return `/search?q=${encodeURIComponent(query)}`;
}

function NodeMiniCard({ node }: { node: OntologyNode }) {
  return (
    <InstantTransitionLink
      className="nodeMiniCard"
      href={node.href}
    >
      <div className="badgeRow">
        <Badge className={node.className} />
      </div>
      <strong>{node.label}</strong>
      <span>{node.summary || node.beginner || '관련 관찰 항목'}</span>
    </InstantTransitionLink>
  );
}

function AskResult({ result }: { result: Envelope<AskData> }) {
  const { answer, matchedNodes, question, scenario } = result.data;

  return (
    <section className="askResult" aria-live="polite">
      <div className="askResultHeader">
        <p className="eyebrow">질문 결과</p>
        <h2>{question}</h2>
        <p>{answer.summary}</p>
      </div>

      <div className="answerGrid">
        <section className="answerBlock">
          <h3>먼저 관찰할 것</h3>
          <ol className="answerList">
            {answer.observe.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="answerBlock">
          <h3>집에서 해볼 일</h3>
          <ul className="answerList">
            {answer.careActions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="answerBlock recordBlock">
        <h3>상담 전 세 줄 메모</h3>
        <ul className="recordGuide">
          {answer.recordGuide.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {matchedNodes.length > 0 ? (
        <section className="matchedSection">
          <div className="sectionHeader compactHeader">
            <div>
              <h2>연결된 관찰 항목</h2>
              <p>질문과 가장 가까운 행동 신호를 먼저 보여드립니다.</p>
            </div>
          </div>
          <div className="nodeMiniGrid">
            {matchedNodes.slice(0, 4).map((node) => (
              <NodeMiniCard node={node} key={node.id} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="inlineNotice">
        <strong>안전 메모</strong>
        <p>{answer.safetyNote}</p>
        <InstantTransitionLink href="/safety">안전 안내 보기</InstantTransitionLink>
      </div>

      <div className="resultActions">
        <InstantTransitionLink className="primaryButton" href={searchHref(question)}>
          관련 항목 더 보기
        </InstantTransitionLink>
        {scenario ? (
          <InstantTransitionLink className="textLink" href={scenario.href}>
            상황 페이지 보기
          </InstantTransitionLink>
        ) : null}
      </div>
    </section>
  );
}

export function AskPanel({ initialQuestion = '' }: { initialQuestion?: string }) {
  const searchParams = useSearchParams();
  const queryQuestion = searchParams.get('question')?.trim().slice(0, 160) ?? '';
  const startQuestion = initialQuestion || queryQuestion;
  const [question, setQuestion] = useState(startQuestion);
  const [result, setResult] = useState<Envelope<AskData> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAdQuestion, setPendingAdQuestion] = useState('');
  const [adLoading, setAdLoading] = useState(false);
  const autoAskedRef = useRef(false);
  const isBusy = loading || adLoading;

  const loadQuestionResult = useCallback(async (trimmed: string) => {
    setLoading(true);
    setError('');

    try {
      if (isAppsInTossStaticExport) {
        const payload = await askQuestion(trimmed, null);
        setResult(payload);
        recordAdGateResultAccess('ask');
        return;
      }

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload &&
          typeof payload.error === 'string'
            ? payload.error
            : '질문을 처리하지 못했습니다.';
        throw new Error(message);
      }

      setResult(payload as Envelope<AskData>);
      recordAdGateResultAccess('ask');
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitQuestion = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setError('궁금한 행동을 한 문장으로 적어주세요.');
        return;
      }

      if (shouldGateResultAccess('ask')) {
        setResult(null);
        setError('');
        setPendingAdQuestion(trimmed);
        void preloadNyangtologyIntegratedAd();
        return;
      }

      setPendingAdQuestion('');
      await loadQuestionResult(trimmed);
    },
    [loadQuestionResult]
  );

  const continuePendingQuestion = useCallback(async () => {
    const trimmed = pendingAdQuestion.trim();
    if (!trimmed) {
      return;
    }

    setAdLoading(true);
    await showNyangtologyIntegratedAd();
    setAdLoading(false);
    setPendingAdQuestion('');
    await loadQuestionResult(trimmed);
  }, [loadQuestionResult, pendingAdQuestion]);

  useEffect(() => {
    void preloadNyangtologyIntegratedAd();
  }, []);

  useEffect(() => {
    if (!startQuestion.trim() || autoAskedRef.current) {
      return;
    }
    autoAskedRef.current = true;
    setQuestion(startQuestion);
    void submitQuestion(startQuestion);
  }, [startQuestion, submitQuestion]);

  return (
    <div className="askStack">
      <section className="askPanel" aria-labelledby="ask-form-title">
        <form
          className="askForm"
          onSubmit={(event) => {
            event.preventDefault();
            void submitQuestion(question);
          }}
        >
          <label id="ask-form-title" htmlFor="ask-question">
            지금 궁금한 행동
          </label>
          <textarea
            id="ask-question"
            maxLength={160}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="예: 화장실 앞에서 울어요"
            rows={4}
            value={question}
          />
          <div className="askFormFooter">
            <span>{question.length}/160</span>
            <button disabled={isBusy} type="submit">
              {loading ? '정리 중' : '질문하기'}
            </button>
          </div>
        </form>

        <div className="askExamples" aria-label="빠른 질문 예시">
          {examples.map((example) => (
            <button
              disabled={isBusy}
              key={example}
              onClick={() => {
                setQuestion(example);
                void submitQuestion(example);
              }}
              type="button"
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {pendingAdQuestion ? (
        <AdGatePrompt
          busy={adLoading}
          kind="ask"
          onContinue={() => {
            void continuePendingQuestion();
          }}
          onDismiss={() => setPendingAdQuestion('')}
        />
      ) : null}

      {loading ? <ObservationLoading /> : null}
      {error ? <div className="errorBox">{error}</div> : null}
      {result ? <AskResult result={result} /> : null}
    </div>
  );
}
