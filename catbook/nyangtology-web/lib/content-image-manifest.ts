export type ContentImageKind = 'home' | 'scenario' | 'concept' | 'chapter';

export type CatId =
  | 'CAT-01'
  | 'CAT-02'
  | 'CAT-03'
  | 'CAT-04'
  | 'CAT-05'
  | 'CAT-06'
  | 'CAT-07'
  | 'CAT-08'
  | 'CAT-09'
  | 'CAT-10'
  | 'CAT-11'
  | 'CAT-12'
  | 'CAT-13'
  | 'CAT-14';

export type ContentImageAsset = {
  id: string;
  slug: string;
  label: string;
  kind: ContentImageKind;
  src: string;
  alt: string;
  catIds: CatId[];
  version: 'cat-first-v5';
  promptRef: 'docs/11-cat-first-v5-image-prompt-guide.md';
};

type AssetDefinition = {
  slug: string;
  label: string;
  catIds: CatId[];
};

export const CAT_CAST: Record<CatId, { name: string; description: string }> = {
  'CAT-01': {
    name: '삼색 아기 고양이',
    description: '흰 가슴과 주황·검정 무늬의 작은 도메스틱 숏헤어',
  },
  'CAT-02': {
    name: '치즈태비 고양이',
    description: '분홍 코와 호박 눈을 가진 통통한 도메스틱 숏헤어',
  },
  'CAT-03': {
    name: '턱시도 노묘',
    description: '흰 가슴과 양말 무늬를 가진 검정·흰색 도메스틱 숏헤어',
  },
  'CAT-04': {
    name: '블루 브리티시 숏헤어',
    description: '곧은 귀와 큰 볼, 호박 눈을 가진 성묘',
  },
  'CAT-05': {
    name: '러시안 블루 노묘',
    description: '은회색 털과 초록 눈을 가진 슬림한 노묘',
  },
  'CAT-06': {
    name: '실 포인트 랙돌',
    description: '파란 눈과 크림색 몸, 풍성한 가슴털을 가진 대형묘',
  },
  'CAT-07': {
    name: '브라운 태비 메인쿤',
    description: '귀 끝 털과 큰 앞발, 풍성한 꼬리를 가진 대형묘',
  },
  'CAT-08': {
    name: '크림 화이트 노르웨이 숲',
    description: '목도리 털과 풍성한 꼬리를 가진 어린 고양이',
  },
  'CAT-09': {
    name: '실 포인트 샴',
    description: '큰 귀와 파란 눈, 긴 짙은 꼬리를 가진 슬림한 성묘',
  },
  'CAT-10': {
    name: '골든 벵갈',
    description: '선명한 로제트 무늬와 녹금색 눈을 가진 활동적인 성묘',
  },
  'CAT-11': {
    name: '루디 아비시니안',
    description: '따뜻한 틱드 코트와 큰 귀, 금색 눈을 가진 성묘',
  },
  'CAT-12': {
    name: '화이트 터키시 앙고라',
    description: '오드아이와 길고 흰 꼬리털을 가진 성묘',
  },
  'CAT-13': {
    name: '그레이 핑크 스핑크스',
    description: '큰 귀와 자연스러운 피부 주름을 가진 슬림한 성묘',
  },
  'CAT-14': {
    name: '실버 스코티시 스트레이트',
    description: '곧은 귀와 둥근 얼굴, 연녹색 눈을 가진 어린 고양이',
  },
};

const homeDefinitions: AssetDefinition[] = [
  { slug: 'litter-cry', label: '화장실 앞에서 울어요', catIds: ['CAT-01'] },
  { slug: 'night-cry', label: '밤마다 울어요', catIds: ['CAT-05'] },
  { slug: 'hiding', label: '계속 숨어요', catIds: ['CAT-08'] },
  { slug: 'hissing', label: '하악질해요', catIds: ['CAT-11'] },
  { slug: 'not-eating', label: '밥을 안 먹어요', catIds: ['CAT-03'] },
  { slug: 'sudden-run', label: '갑자기 뛰어요', catIds: ['CAT-10'] },
];

const scenarioDefinitions: AssetDefinition[] = [
  { slug: 'sudden-run', label: '갑자기 뛰어요', catIds: ['CAT-07'] },
  { slug: 'grooming', label: '빗질을 싫어해요', catIds: ['CAT-12'] },
  { slug: 'second-cat', label: '둘째를 맞이해요', catIds: ['CAT-02', 'CAT-06'] },
  { slug: 'not-eating', label: '밥을 안 먹어요', catIds: ['CAT-03'] },
  { slug: 'hungry', label: '계속 배고파해요', catIds: ['CAT-04'] },
  { slug: 'hiding', label: '계속 숨어요', catIds: ['CAT-08'] },
  { slug: 'food-type', label: '사료 종류가 고민돼요', catIds: ['CAT-01'] },
  { slug: 'danger', label: '집 안 위험요소가 궁금해요', catIds: ['CAT-11'] },
  { slug: 'vomiting', label: '토했어요', catIds: ['CAT-09'] },
  { slug: 'hissing', label: '하악질해요', catIds: ['CAT-10'] },
  { slug: 'litter', label: '화장실 행동이 달라졌어요', catIds: ['CAT-14'] },
];

const conceptDefinitions: AssetDefinition[] = [
  { slug: 'action-consult-expert', label: '전문가 상담 준비', catIds: ['CAT-03'] },
  { slug: 'action-daily-check', label: '매일 30초 확인', catIds: ['CAT-04'] },
  { slug: 'action-play-enrichment', label: '놀이와 풍부화', catIds: ['CAT-10'] },
  { slug: 'action-separate-and-reset', label: '분리하고 다시 안정화하기', catIds: ['CAT-05', 'CAT-12'] },
  { slug: 'context-baby-family', label: '아기가 있는 가족', catIds: ['CAT-14'] },
  { slug: 'context-family-change', label: '가족과 환경의 변화', catIds: ['CAT-06'] },
  { slug: 'context-guardian-absence', label: '보호자의 부재', catIds: ['CAT-02'] },
  { slug: 'context-kitten', label: '아기 고양이의 생활', catIds: ['CAT-01'] },
  { slug: 'environment-carrier-room', label: '이동장을 생활 공간으로', catIds: ['CAT-09'] },
  { slug: 'environment-water-station', label: '물 마시는 동선', catIds: ['CAT-08'] },
  { slug: 'health-senior-change', label: '노묘의 변화 관찰', catIds: ['CAT-05'] },
  { slug: 'health-weight-change', label: '체중 변화 관찰', catIds: ['CAT-04'] },
  { slug: 'knowledge-breed-context', label: '품종은 생활 맥락과 함께', catIds: ['CAT-02', 'CAT-06', 'CAT-13'] },
  { slug: 'knowledge-genetics', label: '유전 정보와 책임 있는 돌봄', catIds: ['CAT-07'] },
  { slug: 'need-predictable-routine', label: '예측 가능한 루틴', catIds: ['CAT-03'] },
  { slug: 'need-rest-recovery', label: '조용한 휴식과 회복', catIds: ['CAT-13'] },
  { slug: 'need-scent-familiarity', label: '익숙한 냄새 만들기', catIds: ['CAT-06', 'CAT-11'] },
  { slug: 'risk-unsafe-rescue', label: '위험한 직접 구조 피하기', catIds: ['CAT-02'] },
  { slug: 'risk-unsafe-touch', label: '불편한 접촉 멈추기', catIds: ['CAT-09'] },
  { slug: 'signal-biting', label: '물기 전 신호', catIds: ['CAT-10'] },
  { slug: 'signal-box-seeking', label: '상자를 찾는 행동', catIds: ['CAT-03'] },
  { slug: 'signal-fight-or-play', label: '싸움과 놀이 구분', catIds: ['CAT-07', 'CAT-11'] },
  { slug: 'signal-purring-kneading', label: '골골송과 꾹꾹이', catIds: ['CAT-04'] },
  { slug: 'signal-relaxed-presence', label: '같은 공간의 편안한 거리', catIds: ['CAT-12'] },
  { slug: 'signal-slow-blink', label: '느린 눈인사', catIds: ['CAT-14'] },
  { slug: 'signal-tail-ear-tension', label: '꼬리와 귀의 긴장', catIds: ['CAT-05'] },
  { slug: 'signal-vocalization', label: '울음의 맥락', catIds: ['CAT-01'] },
];

const chapterDefinitions: AssetDefinition[] = [
  { slug: 'chapter-01', label: '츄르는 왜 갑자기 뛰었을까', catIds: ['CAT-07'] },
  { slug: 'chapter-02', label: '웃긴 장면 뒤에 남은 신호', catIds: ['CAT-01'] },
  { slug: 'chapter-03', label: '집사의 상처받는 속도', catIds: ['CAT-03'] },
  { slug: 'chapter-04', label: '고양이 과시대회의 뒤끝', catIds: ['CAT-11'] },
  { slug: 'chapter-05', label: '이름을 바꾸면 운명도 바뀔까', catIds: ['CAT-02'] },
  { slug: 'chapter-06', label: '귀여움이 관찰을 가릴 때', catIds: ['CAT-12'] },
  { slug: 'chapter-07', label: '소파 밑 38센티미터', catIds: ['CAT-08'] },
  { slug: 'chapter-08', label: '밥그릇보다 먼저 놓아야 할 것', catIds: ['CAT-04'] },
  { slug: 'chapter-09', label: '물그릇 세 개의 정치학', catIds: ['CAT-05'] },
  { slug: 'chapter-10', label: '화장실은 집의 중심이다', catIds: ['CAT-14'] },
  { slug: 'chapter-11', label: '이동장은 감옥이 아니라 방이어야 한다', catIds: ['CAT-09'] },
  { slug: 'chapter-12', label: '출근 전 30초', catIds: ['CAT-03'] },
  { slug: 'chapter-13', label: '이름을 부르지 않는 인사', catIds: ['CAT-12'] },
  { slug: 'chapter-14', label: '하악질의 번역', catIds: ['CAT-11'] },
  { slug: 'chapter-15', label: '우다다는 혼난 뒤가 아니라 비운 뒤에 온다', catIds: ['CAT-10'] },
  { slug: 'chapter-16', label: '꼬리가 먼저 말한 날', catIds: ['CAT-05'] },
  { slug: 'chapter-17', label: '고양이가 나를 좋아한다는 증거', catIds: ['CAT-06'] },
  { slug: 'chapter-18', label: '잠깐 싫어할 권리', catIds: ['CAT-09'] },
  { slug: 'chapter-19', label: '똥을 보고 쓰는 일기', catIds: ['CAT-03'] },
  { slug: 'chapter-20', label: '발톱깎이는 가위가 아니라 약속', catIds: ['CAT-07'] },
  { slug: 'chapter-21', label: '병원에 가져갈 세 줄', catIds: ['CAT-05'] },
  { slug: 'chapter-22', label: '물을 많이 마신 날', catIds: ['CAT-01'] },
  { slug: 'chapter-23', label: '토한 뒤에 해야 할 일', catIds: ['CAT-09'] },
  { slug: 'chapter-24', label: '살이 찐 건 귀여움이 아니다', catIds: ['CAT-04'] },
  { slug: 'chapter-25', label: '합사는 사랑보다 동선이다', catIds: ['CAT-02', 'CAT-06'] },
  { slug: 'chapter-26', label: '둘째를 들이기 전 첫째에게 묻는 법', catIds: ['CAT-06', 'CAT-11'] },
  { slug: 'chapter-27', label: '아기와 고양이 사이의 규칙', catIds: ['CAT-14'] },
  { slug: 'chapter-28', label: '싸움이 끝난 뒤 사람이 해야 할 일', catIds: ['CAT-07', 'CAT-10'] },
  { slug: 'chapter-29', label: '외로움이라는 사람의 오해', catIds: ['CAT-12'] },
  { slug: 'chapter-30', label: '가족이 늘어날 때 고양이가 잃는 것', catIds: ['CAT-08'] },
  { slug: 'chapter-31', label: '실종을 상상하기 전에 할 일', catIds: ['CAT-03'] },
  { slug: 'chapter-32', label: '길고양이를 본 날의 순서', catIds: ['CAT-02'] },
  { slug: 'chapter-33', label: '위험한 물건은 귀엽지 않다', catIds: ['CAT-13'] },
  { slug: 'chapter-34', label: '노묘의 느린 대답', catIds: ['CAT-05'] },
  { slug: 'chapter-35', label: '마지막을 준비한다는 말', catIds: ['CAT-03'] },
  { slug: 'chapter-36', label: '모르면 묻는 용기', catIds: ['CAT-09'] },
  { slug: 'chapter-37', label: '묘종백과를 읽는 법', catIds: ['CAT-06', 'CAT-13'] },
  { slug: 'chapter-38', label: '예쁜 외모 뒤의 유전 이야기', catIds: ['CAT-07'] },
  { slug: 'chapter-39', label: '털과 피부가 보내는 힌트', catIds: ['CAT-12'] },
  { slug: 'chapter-40', label: '작은 고양이와 작은 오해', catIds: ['CAT-01'] },
  { slug: 'chapter-41', label: '품종보다 먼저 보는 생활', catIds: ['CAT-11'] },
  { slug: 'chapter-42', label: '오늘도 츄르는 나를 훈련시킨다', catIds: ['CAT-02'] },
];

const definitionsByKind: Record<ContentImageKind, AssetDefinition[]> = {
  home: homeDefinitions,
  scenario: scenarioDefinitions,
  concept: conceptDefinitions,
  chapter: chapterDefinitions,
};

function makeAsset(kind: ContentImageKind, definition: AssetDefinition): ContentImageAsset {
  const subject =
    definition.catIds.length > 1 ? `${definition.catIds.length}마리 고양이` : '고양이';

  return {
    id: `${kind}:${definition.slug}`,
    slug: definition.slug,
    label: definition.label,
    kind,
    src: `/images/v2/${kind === 'home' ? 'home' : `${kind}s`}/${definition.slug}.webp`,
    alt: `${subject}가 등장하는 ‘${definition.label}’ 행동 관찰 일러스트`,
    catIds: definition.catIds,
    version: 'cat-first-v5',
    promptRef: 'docs/11-cat-first-v5-image-prompt-guide.md',
  };
}

export const contentImageManifest: Record<string, ContentImageAsset> = Object.fromEntries(
  (Object.entries(definitionsByKind) as [ContentImageKind, AssetDefinition[]][]).flatMap(
    ([kind, definitions]) =>
      definitions.map((definition) => {
        const asset = makeAsset(kind, definition);
        return [asset.id, asset];
      })
  )
);

export const contentImageAssets = Object.values(contentImageManifest);

export function getContentImage(slug: string, kind?: ContentImageKind) {
  if (kind) {
    return contentImageManifest[`${kind}:${slug}`] ?? null;
  }

  for (const candidate of ['scenario', 'concept', 'chapter', 'home'] as const) {
    const asset = contentImageManifest[`${candidate}:${slug}`];
    if (asset) {
      return asset;
    }
  }

  return null;
}

export function getHomeQuestionImage(slug: string) {
  return getContentImage(slug, 'home');
}
