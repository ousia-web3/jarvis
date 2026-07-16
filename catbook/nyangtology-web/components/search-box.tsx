import { SEARCH_QUERY_MAX_LENGTH } from '@/lib/search-policy';

export function SearchBox({
  defaultValue = '',
  label = '반려묘 행동 검색',
}: {
  defaultValue?: string;
  label?: string;
}) {
  return (
    <form className="searchForm" action="/search" role="search">
      <label className="srOnly" htmlFor="global-search">
        {label}
      </label>
      <input
        id="global-search"
        name="q"
        defaultValue={defaultValue}
        placeholder="예: 화장실 앞에서 울어요"
        autoComplete="off"
        maxLength={SEARCH_QUERY_MAX_LENGTH}
      />
      <button type="submit">살펴보기</button>
    </form>
  );
}
