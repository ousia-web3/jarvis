'use client';

import { useEffect, useRef, useState } from 'react';
import { TossAds, type TossAdsAttachBannerResult } from '@apps-in-toss/web-framework';

const BANNER_AD_GROUP_ID =
  process.env.NEXT_PUBLIC_AIT_BANNER_AD_GROUP_ID?.trim() ?? '';
const BANNER_AD_ENABLED =
  process.env.NEXT_PUBLIC_NYANGTOLOGY_BANNER_AD_ENABLED === '1';

let initializationPromise: Promise<boolean> | null = null;

type BannerPlacement =
  | 'home-questions'
  | 'concept-detail'
  | 'scenario-detail';

type SupportedCallable = {
  isSupported?: () => boolean;
};

function isSupportedSafely(callable: SupportedCallable) {
  try {
    return callable.isSupported?.() === true;
  } catch {
    return false;
  }
}

function initializeTossAds() {
  if (!isSupportedSafely(TossAds.initialize)) {
    return Promise.resolve(false);
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise<boolean>((resolve) => {
    let settled = false;

    const finish = (initialized: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      resolve(initialized);
    };

    try {
      TossAds.initialize({
        callbacks: {
          onInitialized: () => finish(true),
          onInitializationFailed: () => finish(false),
        },
      });
    } catch {
      finish(false);
    }
  }).then((initialized) => {
    if (!initialized) {
      initializationPromise = null;
    }

    return initialized;
  });

  return initializationPromise;
}

function isBannerAdConfigured() {
  return BANNER_AD_ENABLED && BANNER_AD_GROUP_ID.length > 0;
}

export function TossBannerAd({ placement }: { placement: BannerPlacement }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'visible' | 'unavailable'>(
    'loading'
  );
  const configured = isBannerAdConfigured();

  useEffect(() => {
    if (!configured || !isSupportedSafely(TossAds.attachBanner)) {
      setStatus('unavailable');
      return;
    }

    let cancelled = false;
    let banner: TossAdsAttachBannerResult | undefined;

    const markVisible = () => {
      if (!cancelled) {
        setStatus('visible');
      }
    };

    const markUnavailable = () => {
      if (!cancelled) {
        setStatus('unavailable');
      }
    };

    void initializeTossAds().then((initialized) => {
      if (!initialized || cancelled || !targetRef.current) {
        markUnavailable();
        return;
      }

      try {
        banner = TossAds.attachBanner(BANNER_AD_GROUP_ID, targetRef.current, {
          theme: 'light',
          tone: 'blackAndWhite',
          variant: 'expanded',
          callbacks: {
            onAdRendered: markVisible,
            onAdViewable: markVisible,
            onNoFill: markUnavailable,
            onAdFailedToRender: markUnavailable,
          },
        });
      } catch {
        markUnavailable();
      }
    });

    return () => {
      cancelled = true;
      banner?.destroy();
    };
  }, [configured]);

  if (!configured || status === 'unavailable') {
    return null;
  }

  return (
    <aside
      aria-label="광고"
      className="tossBannerAd"
      data-placement={placement}
      data-status={status}
    >
      <div className="tossBannerTarget" ref={targetRef} />
    </aside>
  );
}
