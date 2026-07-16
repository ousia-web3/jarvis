import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/badge';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ConsultWhenCta } from '@/components/consult-when-cta';
import { ConceptCard } from '@/components/concept-card';
import { FitTitle } from '@/components/fit-title';
import { SafetyBanner } from '@/components/safety-banner';
import { TossBannerAd } from '@/components/toss-banner-ad';
import { getConcept, getStaticConceptSlugs } from '@/lib/ontology';
import { getConceptIllustration } from '@/lib/scenario-assets';

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getStaticConceptSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let detail;
  try {
    detail = await getConcept(slug);
  } catch {
    notFound();
  }
  const { root, related, edges } = detail.data;
  const conceptIllustration = getConceptIllustration({
    edges,
    label: root.label,
    relatedSlugs: related.map((node) => node.slug),
    slug: root.slug,
  });
  const hasConsultWhen =
    root.className === 'SafetyRisk' ||
    edges.some((edge) => edge.relationId === 'CONSULT_WHEN');

  return (
    <div className="shell">
      <section className="detailHero">
        <Breadcrumbs
          items={[
            { href: '/', label: '홈' },
            { href: '/explore', label: '궁금증' },
            { label: root.label },
          ]}
        />
        <div className="detailMeta">
          <Badge className={root.className} />
        </div>
        <FitTitle>{root.label}</FitTitle>
        <p className="lead">{root.summary || root.beginner}</p>
      </section>

      {root.medical || detail.meta.safety.length ? <SafetyBanner /> : null}

      {hasConsultWhen ? (
        <ConsultWhenCta memoItems={[...root.observe, ...root.checks, root.summary]} />
      ) : null}

      <section className="section detailLayout">
        <div className="stack">
          {conceptIllustration ? (
            <article className="scenarioVisualCard">
              <div className="scenarioVisualImage">
                <Image
                  src={conceptIllustration.src}
                  alt={conceptIllustration.alt}
                  fill
                  priority
                  sizes="(max-width: 860px) calc(100vw - 32px), 640px"
                />
                <span className="aiGeneratedBadge">AI 생성</span>
              </div>
            </article>
          ) : null}

          <article className="card">
            <h2>처음 보는 집사를 위한 설명</h2>
            <p>{root.beginner || root.summary}</p>
            {root.observe.length ? (
              <>
                <h2>관찰 포인트</h2>
                <div className="chipList">
                  {root.observe.map((item) => (
                    <span className="chip" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </article>
        </div>

        <aside className="stack">
          <article className="card">
            <h2>함께 보면 좋은 항목</h2>
            <p>같은 상황에서 이어서 확인하기 좋은 신호와 행동입니다.</p>
          </article>
          {related.slice(0, 8).map((node) => (
            <ConceptCard node={node} key={node.id} />
          ))}
        </aside>
      </section>

      <section className="section tossBannerSection">
        <TossBannerAd placement="concept-detail" />
      </section>
    </div>
  );
}
