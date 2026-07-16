export type AdGateKind = 'ask' | 'scenario';

export const AD_GATE_FREE_RESULT_LIMIT = 2;

export const INTEGRATED_AD_GROUP_ID =
  process.env.NEXT_PUBLIC_AIT_INTEGRATED_AD_GROUP_ID?.trim() ?? '';

const storageKeyByKind: Record<AdGateKind, string> = {
  ask: 'nyangtology:ad-gate:ask',
  scenario: 'nyangtology:ad-gate:scenario',
};

const copyByKind: Record<
  AdGateKind,
  { title: string; body: string; actionLabel: string }
> = {
  ask: {
    title: '질문 결과를 계속 보려면 광고 확인이 필요해요',
    body: '오늘 무료 질문 결과 2회를 사용했어요. 짧은 광고를 확인한 뒤 결과를 이어서 볼 수 있어요.',
    actionLabel: '광고 보고 결과 보기',
  },
  scenario: {
    title: '상황별 궁금증을 계속 보려면 광고 확인이 필요해요',
    body: '오늘 상황별 궁금증 2개를 살펴봤어요. 짧은 광고를 확인한 뒤 다음 상황 페이지로 이동할 수 있어요.',
    actionLabel: '광고 보고 바로 보기',
  },
};

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readState(kind: AdGateKind): { date: string; count: number } {
  const fallback = { date: todayKey(), count: 0 };

  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(storageKeyByKind[kind]);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<{ date: string; count: number }>;
    if (parsed.date !== fallback.date || typeof parsed.count !== 'number') {
      return fallback;
    }

    return {
      date: parsed.date,
      count: Math.max(0, parsed.count),
    };
  } catch {
    return fallback;
  }
}

function writeState(kind: AdGateKind, count: number) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      storageKeyByKind[kind],
      JSON.stringify({ date: todayKey(), count })
    );
  } catch {
    // Storage failures should never block care guidance.
  }
}

export function isAdGateConfigured() {
  return (
    process.env.NEXT_PUBLIC_NYANGTOLOGY_AD_GATE_ENABLED === '1' &&
    INTEGRATED_AD_GROUP_ID.length > 0
  );
}

export function getAdGateCopy(kind: AdGateKind) {
  return copyByKind[kind];
}

export function shouldGateResultAccess(kind: AdGateKind) {
  if (!isAdGateConfigured()) {
    return false;
  }

  return readState(kind).count >= AD_GATE_FREE_RESULT_LIMIT;
}

export function recordAdGateResultAccess(kind: AdGateKind) {
  const current = readState(kind);
  writeState(kind, current.count + 1);
}

export function getAdGateState(kind: AdGateKind) {
  return readState(kind);
}
