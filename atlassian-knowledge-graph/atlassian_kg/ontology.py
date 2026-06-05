from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SemanticRule:
    kind: str
    name: str
    edge_type: str
    label: str
    terms: tuple[str, ...]
    score: float
    risk_level: str = "Low"


SEMANTIC_RULES: tuple[SemanticRule, ...] = (
    SemanticRule(
        kind="Risk",
        name="보안/권한 리스크",
        edge_type="HAS_RISK",
        label="리스크",
        terms=("보안", "권한", "개인정보", "토큰", "외부 llm", "외부 전송", "승인", "금지"),
        score=0.9,
        risk_level="High",
    ),
    SemanticRule(
        kind="Metric",
        name="품질/성과 지표",
        edge_type="HAS_METRIC",
        label="지표",
        terms=("지표", "kpi", "품질", "성공률", "누락률", "중복률", "정합성", "검증"),
        score=0.82,
    ),
    SemanticRule(
        kind="DataAsset",
        name="검색/로그 데이터",
        edge_type="USES_DATA",
        label="데이터",
        terms=("데이터", "로그", "테이블", "api", "원문", "청크", "검색"),
        score=0.78,
    ),
    SemanticRule(
        kind="Process",
        name="운영/점검 절차",
        edge_type="DEFINES",
        label="업무 절차",
        terms=("운영", "점검", "절차", "런북", "배치", "장애", "회고", "알림"),
        score=0.76,
    ),
    SemanticRule(
        kind="TrainingModule",
        name="AI/신규 담당자 교육",
        edge_type="DEFINES",
        label="교육",
        terms=("교육", "가이드", "매뉴얼", "온보딩", "학습", "faq", "질문"),
        score=0.74,
    ),
    SemanticRule(
        kind="System",
        name="자동화/AI 도구",
        edge_type="SUPPORTED_BY_SYSTEM",
        label="시스템",
        terms=("자동화", "ai", "rag", "대시보드", "파이프라인", "시스템", "도구"),
        score=0.8,
    ),
    SemanticRule(
        kind="WorkIdea",
        name="업무 개선 아이디어",
        edge_type="SUGGESTS_IDEA",
        label="업무 아이디어",
        terms=("아이디어", "개선", "자동화", "반복", "템플릿", "후보", "백로그"),
        score=0.84,
    ),
)


SEMANTIC_KINDS = {
    "Risk",
    "Metric",
    "DataAsset",
    "Process",
    "TrainingModule",
    "System",
    "WorkIdea",
    "ExternalDomain",
}


def matching_rules(text: str) -> list[SemanticRule]:
    normalized = text.lower()
    return [rule for rule in SEMANTIC_RULES if any(term in normalized for term in rule.terms)]
