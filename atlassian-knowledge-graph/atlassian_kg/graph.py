from __future__ import annotations

import hashlib
import re
from collections import defaultdict

from .content import extract_external_domain, keywords, short_summary
from .models import ConceptRecord, EdgeRecord, IdeaRecord, PageRecord
from .ontology import matching_rules


def stable_id(prefix: str, *parts: str) -> str:
    raw = "::".join(parts).encode("utf-8")
    return f"{prefix}:{hashlib.sha1(raw).hexdigest()[:16]}"


def build_derived_data(pages: list[PageRecord]) -> tuple[list[EdgeRecord], list[ConceptRecord], list[IdeaRecord]]:
    page_ids = {page.id for page in pages}
    title_to_id = {page.title.lower(): page.id for page in pages}
    edges: list[EdgeRecord] = []
    concepts: dict[str, ConceptRecord] = {}
    ideas: dict[str, IdeaRecord] = {}

    for page in pages:
        page_text = " ".join([page.title, " ".join(page.headings), page.body_text])
        if page.parent_id:
            edges.append(
                EdgeRecord(
                    source_id=page.parent_id,
                    target_id=page.id,
                    edge_type="PARENT_OF",
                    label="하위 콘텐츠",
                    weight=1.0,
                    evidence=page.title,
                )
            )

        for heading in page.headings[:12]:
            if not heading or heading == page.title:
                continue
            section_id = stable_id("section", page.id, heading)
            concepts.setdefault(
                section_id,
                ConceptRecord(
                    id=section_id,
                    name=heading,
                    kind="Section",
                    score=0.68,
                    source_page_id=page.id,
                    evidence=heading,
                ),
            )
            edges.append(
                EdgeRecord(
                    source_id=page.id,
                    target_id=section_id,
                    edge_type="HAS_SECTION",
                    label="섹션",
                    weight=0.72,
                    evidence=heading,
                )
            )

        for href, label in page.links:
            if not href and label.lower() in title_to_id:
                edges.append(
                    EdgeRecord(
                        source_id=page.id,
                        target_id=title_to_id[label.lower()],
                        edge_type="LINKS_TO",
                        label="위키 링크",
                        weight=0.8,
                        evidence=label,
                    )
                )
                continue
            if "/pages/" in href:
                target = href.rstrip("/").split("/pages/")[-1].split("/")[0]
                if target in page_ids:
                    edges.append(
                        EdgeRecord(
                            source_id=page.id,
                            target_id=target,
                            edge_type="LINKS_TO",
                            label="페이지 링크",
                            weight=0.8,
                            evidence=label or href,
                        )
                    )
            elif href:
                domain = extract_external_domain(href)
                if domain:
                    concept_id = stable_id("external", domain)
                    concepts.setdefault(
                        concept_id,
                        ConceptRecord(
                            id=concept_id,
                            name=domain,
                            kind="ExternalDomain",
                            score=0.45,
                            source_page_id=page.id,
                            evidence=label or href,
                        ),
                    )
                    edges.append(
                        EdgeRecord(
                            source_id=page.id,
                            target_id=concept_id,
                            edge_type="LINKS_TO",
                            label="외부 링크",
                            weight=0.4,
                            evidence=href,
                        )
                    )

        for rule in matching_rules(page_text):
            concept_id = stable_id(rule.kind.lower(), rule.name)
            concepts.setdefault(
                concept_id,
                ConceptRecord(
                    id=concept_id,
                    name=rule.name,
                    kind=rule.kind,
                    score=rule.score,
                    source_page_id=page.id,
                    evidence=semantic_evidence(page, rule.terms),
                ),
            )
            edges.append(
                EdgeRecord(
                    source_id=page.id,
                    target_id=concept_id,
                    edge_type=rule.edge_type,
                    label=rule.label,
                    weight=rule.score,
                    evidence=semantic_evidence(page, rule.terms),
                    status="candidate",
                )
            )
            if rule.kind == "Risk" and ("승인" in page_text or "금지" in page_text or "외부" in page_text):
                edges.append(
                    EdgeRecord(
                        source_id=page.id,
                        target_id=concept_id,
                        edge_type="REQUIRES_APPROVAL",
                        label="승인 필요",
                        weight=0.9,
                        evidence=semantic_evidence(page, rule.terms),
                        status="candidate",
                    )
                )

        for word, count in keywords(page_text, limit=8):
            concept_id = stable_id("concept", word)
            score = min(1.0, 0.2 + count / 10)
            concepts.setdefault(
                concept_id,
                ConceptRecord(
                    id=concept_id,
                    name=word,
                    kind="Keyword",
                    score=score,
                    source_page_id=page.id,
                    evidence=short_summary(page.body_text, 120),
                ),
            )
            edges.append(
                EdgeRecord(
                    source_id=page.id,
                    target_id=concept_id,
                    edge_type="MENTIONS",
                    label="키워드",
                    weight=score,
                    evidence=word,
                )
            )

        for idea in ideas_for_page(page):
            ideas.setdefault(idea.id, idea)
            idea_node_id = stable_id("workidea", idea.title)
            concepts.setdefault(
                idea_node_id,
                ConceptRecord(
                    id=idea_node_id,
                    name=idea.title,
                    kind="WorkIdea",
                    score=idea.score,
                    source_page_id=page.id,
                    evidence=idea.evidence,
                ),
            )
            edges.append(
                EdgeRecord(
                    source_id=page.id,
                    target_id=idea_node_id,
                    edge_type="SUGGESTS_IDEA",
                    label="업무 아이디어",
                    weight=idea.score,
                    evidence=idea.evidence,
                    status="candidate",
                )
            )

    return compact_edges(edges), list(concepts.values()), list(ideas.values())


def compact_edges(edges: list[EdgeRecord]) -> list[EdgeRecord]:
    grouped: dict[tuple[str, str, str], list[EdgeRecord]] = defaultdict(list)
    for edge in edges:
        grouped[(edge.source_id, edge.target_id, edge.edge_type)].append(edge)
    compacted: list[EdgeRecord] = []
    for group in grouped.values():
        first = group[0]
        weight = min(1.0, sum(edge.weight for edge in group) / len(group))
        evidence = "; ".join(dict.fromkeys(edge.evidence for edge in group if edge.evidence))[:300]
        compacted.append(
            EdgeRecord(
                source_id=first.source_id,
                target_id=first.target_id,
                edge_type=first.edge_type,
                label=first.label,
                weight=weight,
                evidence=evidence,
                status=first.status,
            )
        )
    return compacted


def semantic_evidence(page: PageRecord, terms: tuple[str, ...]) -> str:
    text = short_summary(page.body_text, 220)
    if not text:
        return page.title
    sentences = [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?。])\s+|\n+", page.body_text)
        if sentence.strip()
    ]
    for sentence in sentences:
        lowered_sentence = sentence.lower()
        if any(term in lowered_sentence for term in terms):
            return short_summary(sentence, 180)
    lowered = page.body_text.lower()
    for term in terms:
        index = lowered.find(term)
        if index >= 0:
            start = max(0, index - 45)
            end = min(len(page.body_text), index + 120)
            return short_summary(page.body_text[start:end], 180)
    return text


def ideas_for_page(page: PageRecord) -> list[IdeaRecord]:
    text = " ".join([page.title, " ".join(page.headings), page.body_text]).lower()
    summary = short_summary(page.body_text, 180)
    ideas: list[IdeaRecord] = []

    idea_rules = [
        ("교육 카드", ("교육", "가이드", "매뉴얼", "방법", "onboarding"), 0.72, "Low"),
        ("업무 자동화 후보", ("자동", "자동화", "반복", "배치", "pipeline", "poc"), 0.82, "Medium"),
        ("데이터 품질 점검", ("데이터", "품질", "검증", "로그", "metric", "kpi"), 0.78, "Medium"),
        ("리스크 체크리스트", ("보안", "권한", "개인정보", "토큰", "risk"), 0.86, "High"),
    ]
    for label, triggers, score, risk in idea_rules:
        if any(trigger in text for trigger in triggers):
            ideas.append(
                IdeaRecord(
                    id=stable_id("idea", page.id, label),
                    title=f"{page.title} 기반 {label}",
                    summary=f"근거 페이지의 핵심 내용을 업무 템플릿으로 바꿔 반복 활용한다. {summary}",
                    source_page_id=page.id,
                    score=score,
                    risk_level=risk,
                    evidence=summary,
                )
            )

    if not ideas and page.headings:
        ideas.append(
            IdeaRecord(
                id=stable_id("idea", page.id, "heading-checklist"),
                title=f"{page.title} 핵심 헤딩 기반 실무 체크리스트",
                summary="문서 헤딩을 순서형 체크리스트로 변환해 신규 담당자 교육과 업무 점검에 사용한다.",
                source_page_id=page.id,
                score=0.55,
                risk_level="Low",
                evidence=", ".join(page.headings[:5]),
            )
        )
    return ideas


def training_cards(pages: list[dict]) -> list[dict]:
    cards = []
    meeting_pages = sorted(
        [page for page in pages if "회의록" in (page.get("title") or "")],
        key=lambda page: page.get("title") or "",
    )
    if meeting_pages:
        source_prefix = (meeting_pages[0].get("url") or "").split("/pages/")[0]
        source_url = f"{source_prefix}/pages/{meeting_pages[0]['id']}" if source_prefix else meeting_pages[0].get("url", "")
        cards.append(
            {
                "id": "training:kg-poc-onboarding-manual",
                "title": "지식그래프 학습 매뉴얼",
                "sourcePageId": ",".join(page["id"] for page in meeting_pages[:7]),
                "sourceUrl": source_url,
                "localUrl": "/training/kg-poc-manual.html",
                "summary": "검색 데이터 지식그래프 POC의 목적, 처리 흐름, 기술 결정, 검증 리스크를 신규 담당자가 30분 안에 이해할 수 있도록 재구성한 로컬 HTML 교육 매뉴얼입니다.",
                "keyQuestions": [
                    "확정된 기술 결정과 미해결 쟁점은 무엇인가?",
                    "RDF/OWL, SPARQL, Neptune, Retrieval은 어떤 흐름으로 연결되는가?",
                    "신규 담당자가 실무 투입 전에 확인해야 할 리스크는 무엇인가?",
                ],
                "headings": ["학습 매뉴얼", "온보딩", "지식그래프 POC", "기술 결정", "리스크 체크"],
            }
        )
    for page in pages:
        headings = page.get("headings") or []
        body_text = page.get("body_text") or ""
        title = page.get("title") or page.get("id")
        cards.append(
            {
                "id": f"training:{page['id']}",
                "title": f"{title} 학습 카드",
                "sourcePageId": page["id"],
                "sourceUrl": page.get("url", ""),
                "summary": short_summary(body_text, 260) or "본문 요약을 생성하려면 Confluence 동기화가 필요합니다.",
                "keyQuestions": [
                    f"{title}의 핵심 목적은 무엇인가?",
                    "실무자가 바로 따라야 할 절차는 무엇인가?",
                    "주의해야 할 권한/보안/데이터 품질 리스크는 무엇인가?",
                ],
                "headings": headings[:6],
            }
        )
    return cards
