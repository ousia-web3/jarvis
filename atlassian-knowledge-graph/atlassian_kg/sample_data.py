from __future__ import annotations

from .atlassian import utc_now
from .models import PageRecord


def sample_pages() -> list[PageRecord]:
    root_body = """
    <h1>검색 데이터 지식 베이스</h1>
    <p>검색 데이터 운영 문서는 데이터 품질, 로그 검증, 검색 실험, AI 교육을 연결한다.</p>
    <h2>운영 목표</h2>
    <p>반복되는 분석 요청을 자동화하고 신규 담당자가 빠르게 온보딩하도록 돕는다.</p>
    <p><a href="https://example.com/runbook">운영 런북</a></p>
    """
    poc_body = """
    <h1>26년 2차 POC</h1>
    <p>POC는 Confluence 문서를 기반으로 업무 자동화 후보와 데이터 품질 지표를 발굴한다.</p>
    <h2>검증 항목</h2>
    <p>권한, 보안, 토큰 관리, 외부 LLM 전송 리스크를 체크한다.</p>
    """
    training_body = """
    <h1>AI 교육자료 구성</h1>
    <p>교육 카드는 핵심 개념, 실무 예시, 금지 사항, 질문 예시를 포함한다.</p>
    <h2>실무 활용</h2>
    <p>팀원이 질문하면 근거 페이지와 함께 답변한다.</p>
    """
    quality_body = """
    <h1>데이터 품질 운영</h1>
    <p>검색 데이터 품질은 수집 성공률, 누락률, 중복률, 클릭 로그 정합성으로 검증한다.</p>
    <h2>일일 점검</h2>
    <p>배치 실패와 권한 오류를 자동 알림으로 연결한다.</p>
    """
    rag_body = """
    <h1>RAG 업무 적용</h1>
    <p>위키 원문을 청크로 분리하고 근거 링크를 유지해 AI 답변의 신뢰도를 높인다.</p>
    <h2>금지 사항</h2>
    <p>승인 없는 외부 LLM 전송은 금지한다.</p>
    """
    idea_body = """
    <h1>업무 아이디어 백로그</h1>
    <p>반복 질의, 리포트 작성, 장애 회고, 교육자료 생성을 자동화 후보로 관리한다.</p>
    <h2>우선순위</h2>
    <p>효과, 난이도, 보안 리스크를 점수화한다.</p>
    """
    security_body = """
    <h1>토큰과 권한 관리</h1>
    <p>API 토큰은 .env에만 보관하고 로그와 대시보드에는 기록하지 않는다.</p>
    <h2>리스크</h2>
    <p>내부 위키 원문과 개인정보는 외부 전송 전에 승인 게이트를 거친다.</p>
    """
    return [
        PageRecord(
            id="3635315029",
            title="검색 데이터 지식 베이스",
            url="https://wiki-hanatour.atlassian.net/wiki/spaces/searchdata/pages/3635315029",
            parent_id=None,
            depth=0,
            fetched_at=utc_now(),
            body_text="검색 데이터 운영 문서는 데이터 품질, 로그 검증, 검색 실험, AI 교육을 연결한다. 반복되는 분석 요청을 자동화하고 신규 담당자가 빠르게 온보딩하도록 돕는다.",
            body_storage=root_body,
            headings=("검색 데이터 지식 베이스", "운영 목표"),
            links=(("https://example.com/runbook", "운영 런북"),),
        ),
        PageRecord(
            id="3501490259",
            title="26년 2차 POC",
            url="https://wiki-hanatour.atlassian.net/wiki/spaces/searchdata/pages/3501490259/26+2+POC",
            parent_id="3635315029",
            depth=1,
            fetched_at=utc_now(),
            body_text="POC는 Confluence 문서를 기반으로 업무 자동화 후보와 데이터 품질 지표를 발굴한다. 권한, 보안, 토큰 관리, 외부 LLM 전송 리스크를 체크한다.",
            body_storage=poc_body,
            headings=("26년 2차 POC", "검증 항목"),
            links=(),
        ),
        PageRecord(
            id="folder-ai-training",
            title="AI 교육 카테고리",
            url="https://wiki-hanatour.atlassian.net/wiki",
            type="folder",
            parent_id="3635315029",
            depth=1,
            fetched_at=utc_now(),
            body_text="folder container: AI 교육 카테고리",
            body_storage="",
            headings=("AI 교육 카테고리",),
            links=(),
        ),
        PageRecord(
            id="folder-data-quality",
            title="데이터 품질 카테고리",
            url="https://wiki-hanatour.atlassian.net/wiki",
            type="folder",
            parent_id="3635315029",
            depth=1,
            fetched_at=utc_now(),
            body_text="folder container: 데이터 품질 카테고리",
            body_storage="",
            headings=("데이터 품질 카테고리",),
            links=(),
        ),
        PageRecord(
            id="sample-training",
            title="AI 교육자료 구성",
            url="https://wiki-hanatour.atlassian.net/wiki/spaces/searchdata/pages/sample-training",
            parent_id="folder-ai-training",
            depth=2,
            fetched_at=utc_now(),
            body_text="교육 카드는 핵심 개념, 실무 예시, 금지 사항, 질문 예시를 포함한다. 팀원이 질문하면 근거 페이지와 함께 답변한다.",
            body_storage=training_body,
            headings=("AI 교육자료 구성", "실무 활용"),
            links=(),
        ),
        PageRecord(
            id="sample-rag",
            title="RAG 업무 적용",
            url="https://wiki-hanatour.atlassian.net/wiki/spaces/searchdata/pages/sample-rag",
            parent_id="folder-ai-training",
            depth=2,
            fetched_at=utc_now(),
            body_text="위키 원문을 청크로 분리하고 근거 링크를 유지해 AI 답변의 신뢰도를 높인다. 승인 없는 외부 LLM 전송은 금지한다.",
            body_storage=rag_body,
            headings=("RAG 업무 적용", "금지 사항"),
            links=(),
        ),
        PageRecord(
            id="sample-quality",
            title="데이터 품질 운영",
            url="https://wiki-hanatour.atlassian.net/wiki/spaces/searchdata/pages/sample-quality",
            parent_id="folder-data-quality",
            depth=2,
            fetched_at=utc_now(),
            body_text="검색 데이터 품질은 수집 성공률, 누락률, 중복률, 클릭 로그 정합성으로 검증한다. 배치 실패와 권한 오류를 자동 알림으로 연결한다.",
            body_storage=quality_body,
            headings=("데이터 품질 운영", "일일 점검"),
            links=(),
        ),
        PageRecord(
            id="db-ideas",
            title="업무 아이디어 데이터베이스",
            url="https://wiki-hanatour.atlassian.net/wiki",
            type="database",
            parent_id="3501490259",
            depth=2,
            fetched_at=utc_now(),
            body_text="database container: 업무 아이디어 데이터베이스",
            body_storage="",
            headings=("업무 아이디어 데이터베이스",),
            links=(),
        ),
        PageRecord(
            id="sample-ideas",
            title="업무 아이디어 백로그",
            url="https://wiki-hanatour.atlassian.net/wiki/spaces/searchdata/pages/sample-ideas",
            parent_id="db-ideas",
            depth=3,
            fetched_at=utc_now(),
            body_text="반복 질의, 리포트 작성, 장애 회고, 교육자료 생성을 자동화 후보로 관리한다. 효과, 난이도, 보안 리스크를 점수화한다.",
            body_storage=idea_body,
            headings=("업무 아이디어 백로그", "우선순위"),
            links=(),
        ),
        PageRecord(
            id="sample-security",
            title="토큰과 권한 관리",
            url="https://wiki-hanatour.atlassian.net/wiki/spaces/searchdata/pages/sample-security",
            parent_id="3501490259",
            depth=2,
            fetched_at=utc_now(),
            body_text="API 토큰은 .env에만 보관하고 로그와 대시보드에는 기록하지 않는다. 내부 위키 원문과 개인정보는 외부 전송 전에 승인 게이트를 거친다.",
            body_storage=security_body,
            headings=("토큰과 권한 관리", "리스크"),
            links=(),
        ),
    ]
