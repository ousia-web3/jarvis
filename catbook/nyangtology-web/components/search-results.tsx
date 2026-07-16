'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/badge';
import { InstantTransitionLink } from '@/components/instant-transition-link';
import { SearchBox } from '@/components/search-box';
import { searchNodes } from '@/lib/ontology';
import {
  clampSearchQueryForDisplay,
  normalizeSearchQuery,
  validateSearchQuery,
} from '@/lib/search-policy';
import type { Envelope, SearchData } from '@/lib/types';

export function SearchResults() {
  const searchParams = useSearchParams();
  const rawQuery = normalizeSearchQuery(searchParams.get('q'));
  const validation = useMemo(
    () => (rawQuery ? validateSearchQuery(rawQuery) : null),
    [rawQuery]
  );
  const displayQuery = validation?.ok
    ? validation.query
    : clampSearchQueryForDisplay(rawQuery);
  const [results, setResults] = useState<Envelope<SearchData> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!validation?.ok) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    void searchNodes(validation.query)
      .then((nextResults) => {
        if (!cancelled) {
          setResults(nextResults);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [validation]);

  return (
    <>
      <SearchBox defaultValue={displayQuery} key={displayQuery} />

      <section className="section">
        {validation && !validation.ok ? (
          <div className="emptyState">{validation.message}</div>
        ) : loading ? (
          <div className="emptyState">검색 중입니다.</div>
        ) : results ? (
          <>
            <div className="sectionHeader">
              <div>
                <h2>관련 관찰 항목</h2>
                <p>
                  &ldquo;{results.data.query}&rdquo;와 연결된 항목{' '}
                  {results.data.count}개
                </p>
              </div>
            </div>
            <div className="stack">
              {results.data.results.length ? (
                results.data.results.map((node) => (
                  <InstantTransitionLink
                    className="card"
                    href={node.href}
                    key={node.id}
                  >
                    <div className="badgeRow">
                      <Badge className={node.className} />
                    </div>
                    <h2>{node.label}</h2>
                    <p>{node.summary || node.beginner}</p>
                  </InstantTransitionLink>
                ))
              ) : (
                <div className="emptyState">
                  아직 연결된 항목을 찾지 못했습니다. “울음”, “화장실”,
                  “숨기”, “하악”처럼 행동이나 장소를 조금 짧게 적어보세요.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="emptyState">
            예: 하악, 숨어요, 밤마다 울어요, 화장실 앞에서 울어요
          </div>
        )}
      </section>
    </>
  );
}
