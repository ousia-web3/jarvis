'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { AdGatePrompt } from '@/components/ad-gate-prompt';
import { ObservationLoading } from '@/components/observation-loading';
import {
  recordAdGateResultAccess,
  shouldGateResultAccess,
} from '@/lib/ad-gate';
import {
  preloadNyangtologyIntegratedAd,
  showNyangtologyIntegratedAd,
} from '@/lib/apps-in-toss-integrated-ad';

type AdGatedScenarioLinkProps = {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  href: string;
};

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.button !== 0 ||
    event.currentTarget.target === '_blank'
  );
}

function isLocalNavigableHref(href: string) {
  return href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/#');
}

export function AdGatedScenarioLink({
  ariaLabel,
  children,
  className,
  href,
}: AdGatedScenarioLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adPromptOpen, setAdPromptOpen] = useState(false);
  const [adBusy, setAdBusy] = useState(false);
  const [pending, setPending] = useState(false);

  const shouldShowTransition = useMemo(() => {
    if (!isLocalNavigableHref(href)) {
      return false;
    }

    const [targetPath] = href.split('?');
    return targetPath !== pathname;
  }, [href, pathname]);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    void preloadNyangtologyIntegratedAd();
  }, []);

  useEffect(() => {
    if (!pending) {
      return;
    }

    const timer = window.setTimeout(() => setPending(false), 9000);
    return () => window.clearTimeout(timer);
  }, [pending]);

  const warmRoute = () => {
    if (shouldShowTransition) {
      router.prefetch(href);
    }
  };

  const continueToScenario = () => {
    recordAdGateResultAccess('scenario');
    if (shouldShowTransition) {
      setPending(true);
    }
    router.push(href);
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isLocalNavigableHref(href) || isModifiedClick(event)) {
      return;
    }

    if (!shouldGateResultAccess('scenario')) {
      recordAdGateResultAccess('scenario');
      if (shouldShowTransition) {
        setPending(true);
      }
      return;
    }

    event.preventDefault();
    setAdPromptOpen(true);
    void preloadNyangtologyIntegratedAd();
  };

  const handleContinueAfterAd = async () => {
    setAdBusy(true);
    await showNyangtologyIntegratedAd();
    setAdBusy(false);
    setAdPromptOpen(false);
    continueToScenario();
  };

  return (
    <>
      <Link
        aria-label={ariaLabel}
        className={className}
        href={href}
        onClick={handleClick}
        onFocus={warmRoute}
        onMouseEnter={warmRoute}
        prefetch
      >
        {children}
      </Link>

      {adPromptOpen ? (
        <AdGatePrompt
          busy={adBusy}
          kind="scenario"
          onContinue={() => {
            void handleContinueAfterAd();
          }}
          onDismiss={() => setAdPromptOpen(false)}
          variant="dialog"
        />
      ) : null}

      {pending ? (
        <div
          aria-live="polite"
          className="instantTransitionOverlay"
          data-testid="instant-transition-overlay"
          role="status"
        >
          <ObservationLoading mode="page" />
        </div>
      ) : null}
    </>
  );
}
