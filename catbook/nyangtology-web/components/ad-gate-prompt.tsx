'use client';

import { useId } from 'react';
import { getAdGateCopy, type AdGateKind } from '@/lib/ad-gate';

type AdGatePromptProps = {
  busy: boolean;
  kind: AdGateKind;
  onContinue: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'dialog';
};

export function AdGatePrompt({
  busy,
  kind,
  onContinue,
  onDismiss,
  variant = 'inline',
}: AdGatePromptProps) {
  const titleId = useId();
  const copy = getAdGateCopy(kind);
  const prompt = (
    <section
      aria-labelledby={titleId}
      aria-modal={variant === 'dialog' ? true : undefined}
      className={`adGatePrompt${variant === 'dialog' ? ' adGateDialog' : ''}`}
      role={variant === 'dialog' ? 'dialog' : 'status'}
    >
      <p className="eyebrow">광고 안내</p>
      <h2 id={titleId}>{copy.title}</h2>
      <p>{copy.body}</p>
      <div className="adGateActions">
        <button
          className="primaryButton"
          disabled={busy}
          onClick={onContinue}
          type="button"
        >
          {busy ? '광고 준비 중' : copy.actionLabel}
        </button>
        {onDismiss ? (
          <button
            className="secondaryButton"
            disabled={busy}
            onClick={onDismiss}
            type="button"
          >
            나중에 보기
          </button>
        ) : null}
      </div>
      <a className="adGateSafetyLink" href="/safety">
        긴급하거나 건강 이상이 의심되면 안전 안내 먼저 보기
      </a>
    </section>
  );

  if (variant !== 'dialog') {
    return prompt;
  }

  return <div className="adGateBackdrop">{prompt}</div>;
}
