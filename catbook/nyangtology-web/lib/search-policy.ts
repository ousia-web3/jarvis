export const SEARCH_QUERY_MIN_LENGTH = 2;
export const SEARCH_QUERY_MAX_LENGTH = 160;

export type SearchQueryValidation =
  | {
      ok: true;
      query: string;
    }
  | {
      ok: false;
      query: string;
      error: string;
      message: string;
    };

export function normalizeSearchQuery(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function searchQueryLength(value: string): number {
  return Array.from(value).length;
}

export function validateSearchQuery(
  value: string | null | undefined
): SearchQueryValidation {
  const query = normalizeSearchQuery(value);
  const length = searchQueryLength(query);

  if (length < SEARCH_QUERY_MIN_LENGTH) {
    return {
      ok: false,
      query,
      error: 'search_query_too_short',
      message: `검색어를 ${SEARCH_QUERY_MIN_LENGTH}자 이상 입력해주세요.`,
    };
  }

  if (length > SEARCH_QUERY_MAX_LENGTH) {
    return {
      ok: false,
      query,
      error: 'search_query_too_long',
      message: `검색어는 ${SEARCH_QUERY_MAX_LENGTH}자 이하로 입력해주세요.`,
    };
  }

  return { ok: true, query };
}

export function clampSearchQueryForDisplay(value: string): string {
  return Array.from(normalizeSearchQuery(value))
    .slice(0, SEARCH_QUERY_MAX_LENGTH)
    .join('');
}
