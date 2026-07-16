'use client';

import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
import { INTEGRATED_AD_GROUP_ID, isAdGateConfigured } from '@/lib/ad-gate';

const LOAD_TIMEOUT_MS = 4500;
const SHOW_TIMEOUT_MS = 90000;

let preloadPromise: Promise<boolean> | null = null;

type SupportedCallable = {
  isSupported?: () => boolean;
};

type IntegratedAdResult = {
  ok: boolean;
  reason: 'shown' | 'unavailable' | 'failed';
};

function isSupportedSafely(callable: SupportedCallable) {
  try {
    return callable.isSupported?.() === true;
  } catch {
    return false;
  }
}

export function preloadNyangtologyIntegratedAd() {
  if (
    !isAdGateConfigured() ||
    typeof window === 'undefined' ||
    !isSupportedSafely(loadFullScreenAd)
  ) {
    return Promise.resolve(false);
  }

  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = new Promise<boolean>((resolve) => {
    let settled = false;
    let cleanup: (() => void) | undefined;

    const finish = (loaded: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timer);
      cleanup?.();
      preloadPromise = null;
      resolve(loaded);
    };

    const timer = window.setTimeout(() => finish(false), LOAD_TIMEOUT_MS);

    try {
      cleanup = loadFullScreenAd({
        options: { adGroupId: INTEGRATED_AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            finish(true);
          }
        },
        onError: () => finish(false),
      });
    } catch {
      finish(false);
    }
  });

  return preloadPromise;
}

export async function showNyangtologyIntegratedAd(): Promise<IntegratedAdResult> {
  if (
    !isAdGateConfigured() ||
    typeof window === 'undefined' ||
    !isSupportedSafely(showFullScreenAd)
  ) {
    return { ok: false, reason: 'unavailable' };
  }

  const loaded = await preloadNyangtologyIntegratedAd();
  if (!loaded) {
    return { ok: false, reason: 'unavailable' };
  }

  return new Promise<IntegratedAdResult>((resolve) => {
    let settled = false;
    let cleanup: (() => void) | undefined;

    const finish = (result: IntegratedAdResult) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timer);
      cleanup?.();
      void preloadNyangtologyIntegratedAd();
      resolve(result);
    };

    const timer = window.setTimeout(
      () => finish({ ok: false, reason: 'failed' }),
      SHOW_TIMEOUT_MS
    );

    try {
      cleanup = showFullScreenAd({
        options: { adGroupId: INTEGRATED_AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'dismissed' || event.type === 'userEarnedReward') {
            finish({ ok: true, reason: 'shown' });
            return;
          }

          if (event.type === 'failedToShow') {
            finish({ ok: false, reason: 'failed' });
          }
        },
        onError: () => finish({ ok: false, reason: 'failed' }),
      });
    } catch {
      finish({ ok: false, reason: 'failed' });
    }
  });
}
