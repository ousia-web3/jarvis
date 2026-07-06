from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "research" / "youtube-metadata-raw.jsonl"
DATA_DIR = ROOT / "data"
WEB_DATA_DIR = ROOT / "web" / "responsive-prototype" / "data"
SUMMARY_PATH = ROOT / "research" / "youtube-metadata-summary.md"


SEARCH_OBSERVATIONS = [
    {
        "id": "obs-youtube-aejeong-gyeolpib",
        "query": "애정결핍",
        "observedAt": "2026-07-01T12:05:00+09:00",
        "source": "YouTube keyword search",
        "searchUrl": "https://www.youtube.com/results?search_query=%EC%95%A0%EC%A0%95%EA%B2%B0%ED%95%8D&sp=CAI%253D",
        "status": "source-observed",
        "reviewState": "needs-domain-fit-review",
        "freshnessNote": "사용자 관측상 최신 영상이 존재하며, 업로드일은 운영 검수 단계에서 확정 필요",
        "reason": "여행 콘텐츠 후보 DB에는 아직 매칭되지 않았지만, 최신 YouTube 검색에서는 관련 원천 영상이 관측됨",
        "entries": [
            {
                "rank": 1,
                "sourceVideoId": "AEbnilrEy7M",
                "title": "애정결핍의 근본적인 원인을 파헤쳐봅니다! | 사랑받고 싶은 마음 | 내면의 목소리",
                "sourceUrl": "https://www.youtube.com/watch?v=AEbnilrEy7M",
                "durationString": "11:33",
                "channel": "내면의 목소리 : 마음분석",
                "rightsPolicy": "link-only",
            },
            {
                "rank": 2,
                "sourceVideoId": "Ek41VNKghBE",
                "title": "애정결핍이 있으면 충동, 정서조절이 어렵다, 건강한 관계 맺는 법",
                "sourceUrl": "https://www.youtube.com/watch?v=Ek41VNKghBE",
                "durationString": "12:20",
                "channel": "상담심리사웃따",
                "rightsPolicy": "link-only",
            },
            {
                "rank": 3,
                "sourceVideoId": "SfqCkKxYvmM",
                "title": "[마음우체국]애정결핍 치유하는 법 알려드립니다(by. 정신과의사)",
                "sourceUrl": "https://www.youtube.com/watch?v=SfqCkKxYvmM",
                "durationString": "5:51",
                "channel": "정신의학신문",
                "rightsPolicy": "link-only",
            },
        ],
    }
]


REGION_KEYWORDS = {
    "강릉": ["강릉", "바다", "해안", "초당"],
    "하동": ["하동", "화개장터", "녹차", "지리산", "최참판댁"],
    "포항": ["포항", "게장"],
    "여수": ["여수", "낙지"],
    "서울": ["서울", "홍대", "이태원", "성수", "명동", "한강"],
    "부산": ["부산"],
    "용인": ["민속촌"],
}

FOOD_KEYWORDS = {
    "한우": ["한우", "소고기", "마블링"],
    "치킨": ["통닭", "치킨"],
    "막걸리": ["막걸리"],
    "보쌈": ["보쌈", "김치"],
    "고기": ["돼지", "제육", "갈비", "불고기", "삼겹살", "소고기", "한우", "고기"],
    "해산물": ["게장", "낙지", "벚굴", "재첩", "해산물"],
    "면": ["냉면", "국수", "짜장면"],
    "시장 음식": ["시장", "화개장터", "안주", "먹방"],
    "매운 음식": ["매운", "닭발", "고추"],
}

STYLE_KEYWORDS = {
    "미식": ["먹방", "음식", "고기", "한우", "통닭", "막걸리", "보쌈", "냉면", "짜장면"],
    "자연": ["바다", "녹차", "지리산", "풍경"],
    "지역문화": ["시장", "화개장터", "민속촌", "역사", "문학", "초상화"],
    "한류": ["K-", "케데헌", "드라마", "페이커", "E-스포츠", "T1", "PC방"],
    "교육": ["한국학", "교수", "썸머스쿨", "역사 강의"],
    "가족": ["부녀", "아들", "5살", "효도", "가족"],
}

SEGMENT_RULES = {
    "미식가": ["먹방", "한우", "막걸리", "보쌈", "게장", "냉면", "짜장면", "닭발"],
    "한류 팬": ["K-", "페이커", "E-스포츠", "T1", "PC방", "케데헌", "드라마"],
    "가족 여행자": ["가족", "부녀", "아들", "5살", "효도"],
    "문화 탐방자": ["한국학", "역사", "민속촌", "문학", "초상화"],
    "친구 여행자": ["덕후", "소원", "도전", "먹방", "회식"],
}


def load_raw() -> list[dict]:
    return [json.loads(line) for line in RAW_PATH.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def strip_symbols(value: str) -> str:
    kept: list[str] = []
    for char in value:
        category = unicodedata.category(char)
        if category in {"So", "Sk"}:
            continue
        kept.append(char)
    return "".join(kept)


def clean_title(title: str) -> str:
    title = strip_symbols(title)
    title = re.sub(r"\s*\|\s*EP\.\d+\s*$", "", title)
    title = re.sub(r"\s*\|\s*#어[^\|]+", "", title)
    title = re.sub(r"\s*\|\s*$", "", title)
    title = re.sub(r"^\[하이라이트\]\s*", "", title)
    title = re.sub(r"\s+", " ", title).strip()
    return title


def extract_episode(title: str) -> str:
    match = re.search(r"EP\.(\d+)", title)
    return f"EP.{match.group(1)}" if match else ""


def contains_any(text: str, terms: list[str]) -> bool:
    return any(term.lower() in text.lower() for term in terms)


def infer_tags(title: str) -> tuple[list[str], list[str], list[str], list[str]]:
    regions = [name for name, terms in REGION_KEYWORDS.items() if contains_any(title, terms)]
    foods = [name for name, terms in FOOD_KEYWORDS.items() if contains_any(title, terms)]
    styles = [name for name, terms in STYLE_KEYWORDS.items() if contains_any(title, terms)]
    segments = [name for name, terms in SEGMENT_RULES.items() if contains_any(title, terms)]
    if not segments:
      segments = ["첫 방문 여행자"]
    return regions, foods, styles, segments


def content_type(regions: list[str], foods: list[str], styles: list[str]) -> str:
    if foods and len(foods) >= len(regions):
        return "음식"
    if regions:
        return "지역"
    if "한류" in styles:
        return "영상 영감"
    if "지역문화" in styles or "교육" in styles:
        return "관광지"
    return "영상 영감"


def tone_for(item_type: str, styles: list[str]) -> str:
    if "자연" in styles:
        return "tone-nature"
    if item_type == "음식" or "미식" in styles:
        return "tone-food"
    if "한류" in styles or "지역문화" in styles:
        return "tone-culture"
    return "tone-sea"


def short_reason(item_type: str, regions: list[str], foods: list[str], styles: list[str], segments: list[str]) -> str:
    segment = segments[0]
    if item_type == "음식":
        food = foods[0] if foods else "한국 음식"
        return f"{segment}에게 {food}의 맛, 먹는 상황, 주문 난이도를 설명할 수 있는 영상 기반 후보입니다."
    if item_type == "지역":
        region = regions[0] if regions else "지역"
        return f"{segment}가 {region}의 이동 동선과 주변 경험을 함께 파악하기 좋은 후보입니다."
    if "한류" in styles:
        return f"{segment}가 K-콘텐츠 관심을 실제 방문 맥락으로 연결할 수 있는 영상 영감입니다."
    if "교육" in styles:
        return f"{segment}가 한국 문화와 배경지식을 여행 전후로 이해하기 좋은 콘텐츠입니다."
    return f"{segment}가 영상에서 생긴 관심을 여행정보로 전환하기 좋은 콘텐츠입니다."


def quality_score(regions: list[str], foods: list[str], styles: list[str], duration: float | None, episode: str) -> int:
    score = 52
    score += min(len(regions) * 8, 16)
    score += min(len(foods) * 7, 21)
    score += min(len(styles) * 6, 18)
    if duration and duration >= 480:
        score += 6
    if episode:
        score += 5
    return min(score, 100)


def sql_literal(value: object) -> str:
    if value is None:
        return "null"
    text = json.dumps(value, ensure_ascii=False) if isinstance(value, (dict, list)) else str(value)
    return "'" + text.replace("'", "''") + "'"


def build() -> dict:
    raw = load_raw()
    source_videos: list[dict] = []
    content_items: list[dict] = []
    rejected: list[dict] = []

    seen_ids: set[str] = set()
    for entry in raw:
        video_id = entry.get("id")
        if not video_id or video_id in seen_ids:
            continue
        seen_ids.add(video_id)

        title = entry.get("title", "")
        clean = clean_title(title)
        episode = extract_episode(title)
        regions, foods, styles, segments = infer_tags(clean)
        item_type = content_type(regions, foods, styles)
        duration = entry.get("duration")
        score = quality_score(regions, foods, styles, duration, episode)
        source_url = entry.get("webpage_url") or entry.get("url")
        thumbnail_refs = [thumb.get("url") for thumb in entry.get("thumbnails", []) if thumb.get("url")]

        source_videos.append(
            {
                "sourceVideoId": video_id,
                "episode": episode,
                "playlistIndex": entry.get("playlist_index"),
                "title": clean,
                "rawTitle": title,
                "sourceUrl": source_url,
                "durationSeconds": duration,
                "durationString": entry.get("duration_string"),
                "channel": entry.get("playlist_channel"),
                "channelId": entry.get("playlist_channel_id"),
                "thumbnailPolicy": "reference-only",
                "thumbnailRefs": thumbnail_refs[:2],
                "rightsPolicy": "link-only",
                "extractedAtEpoch": entry.get("epoch"),
            }
        )

        if score < 62:
            rejected.append({"sourceVideoId": video_id, "title": clean, "reason": "insufficient travel tags", "score": score})

        tags = list(dict.fromkeys(regions + foods + styles + segments))
        display_title = clean
        if len(display_title) > 52:
            display_title = display_title[:51].rstrip() + "…"

        content_items.append(
            {
                "id": f"yt-{video_id}",
                "sourceVideoId": video_id,
                "episode": episode,
                "contentType": item_type,
                "title": display_title,
                "fullTitle": clean,
                "sourceUrl": source_url,
                "durationString": entry.get("duration_string"),
                "regions": regions,
                "foods": foods,
                "styles": styles,
                "travelerSegments": segments,
                "tags": tags,
                "recommendationReason": short_reason(item_type, regions, foods, styles, segments),
                "imageStatus": "placeholder",
                "rightsPolicy": "link-only",
                "tone": tone_for(item_type, styles),
                "qualityScore": score,
                "sourceRank": entry.get("playlist_index"),
            }
        )

    content_items = sorted(content_items, key=lambda item: (-item["qualityScore"], item["sourceRank"] or 999))
    seed = {
        "meta": {
            "requestId": "2026-06-19-korea-travel-content-service-planning",
            "source": "https://www.youtube.com/@hello1stkorea/videos",
            "extractor": "python -m yt_dlp --flat-playlist --playlist-end 80 --dump-json",
            "rawVideoCount": len(source_videos),
            "contentItemCount": len(content_items),
            "queryObservationCount": len(SEARCH_OBSERVATIONS),
            "thumbnailPolicy": "reference-only; UI uses placeholder only",
        },
        "sourceVideos": source_videos,
        "contentItems": content_items,
        "queryObservations": SEARCH_OBSERVATIONS,
        "rejectedCandidates": rejected,
    }
    return seed


def write_outputs(seed: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    WEB_DATA_DIR.mkdir(parents=True, exist_ok=True)

    json_path = DATA_DIR / "youtube-content-seed.json"
    json_path.write_text(json.dumps(seed, ensure_ascii=False, indent=2), encoding="utf-8")

    js_path = WEB_DATA_DIR / "content-seed.js"
    js_path.write_text("window.TRIP_ATLAS_DB = " + json.dumps(seed, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")

    sql_lines = [
        "-- Generated seed from YouTube flat metadata.",
        "-- Intended schema: korea_travel_content",
        "-- Thumbnail refs are stored as source metadata only; UI must not render them without rights review.",
        "create table if not exists korea_travel_content.youtube_source_videos (",
        "  source_video_id text primary key,",
        "  episode text,",
        "  title text not null,",
        "  source_url text not null,",
        "  duration_seconds integer,",
        "  metadata jsonb not null,",
        "  rights_policy text not null default 'link-only'",
        ");",
        "create table if not exists korea_travel_content.content_items_seed (",
        "  id text primary key,",
        "  source_video_id text references korea_travel_content.youtube_source_videos(source_video_id),",
        "  content_type text not null,",
        "  title text not null,",
        "  tags jsonb not null,",
        "  recommendation_reason text not null,",
        "  image_status text not null default 'placeholder',",
        "  quality_score integer not null,",
        "  metadata jsonb not null",
        ");",
        "create table if not exists korea_travel_content.youtube_query_observations (",
        "  id text primary key,",
        "  query text not null,",
        "  source text not null,",
        "  search_url text not null,",
        "  status text not null,",
        "  review_state text not null,",
        "  observed_at text not null,",
        "  metadata jsonb not null",
        ");",
        "",
    ]
    for video in seed["sourceVideos"]:
        sql_lines.append(
            "insert into korea_travel_content.youtube_source_videos "
            "(source_video_id, episode, title, source_url, duration_seconds, metadata, rights_policy) values "
            f"({sql_literal(video['sourceVideoId'])}, {sql_literal(video['episode'])}, {sql_literal(video['title'])}, "
            f"{sql_literal(video['sourceUrl'])}, {int(video['durationSeconds'] or 0)}, {sql_literal(video)}, 'link-only') "
            "on conflict (source_video_id) do update set title = excluded.title, metadata = excluded.metadata;"
        )
    sql_lines.append("")
    for item in seed["contentItems"]:
        sql_lines.append(
            "insert into korea_travel_content.content_items_seed "
            "(id, source_video_id, content_type, title, tags, recommendation_reason, image_status, quality_score, metadata) values "
            f"({sql_literal(item['id'])}, {sql_literal(item['sourceVideoId'])}, {sql_literal(item['contentType'])}, "
            f"{sql_literal(item['title'])}, {sql_literal(item['tags'])}, {sql_literal(item['recommendationReason'])}, "
            f"'placeholder', {item['qualityScore']}, {sql_literal(item)}) "
            "on conflict (id) do update set title = excluded.title, tags = excluded.tags, metadata = excluded.metadata;"
        )
    sql_lines.append("")
    for observation in seed["queryObservations"]:
        sql_lines.append(
            "insert into korea_travel_content.youtube_query_observations "
            "(id, query, source, search_url, status, review_state, observed_at, metadata) values "
            f"({sql_literal(observation['id'])}, {sql_literal(observation['query'])}, {sql_literal(observation['source'])}, "
            f"{sql_literal(observation['searchUrl'])}, {sql_literal(observation['status'])}, "
            f"{sql_literal(observation['reviewState'])}, {sql_literal(observation['observedAt'])}, {sql_literal(observation)}) "
            "on conflict (id) do update set status = excluded.status, review_state = excluded.review_state, metadata = excluded.metadata;"
        )
    (DATA_DIR / "youtube-content-seed.sql").write_text("\n".join(sql_lines) + "\n", encoding="utf-8")

    by_type: dict[str, int] = {}
    for item in seed["contentItems"]:
        by_type[item["contentType"]] = by_type.get(item["contentType"], 0) + 1

    summary_lines = [
        "# YouTube Metadata Extraction Summary",
        "",
        "- Source: https://www.youtube.com/@hello1stkorea/videos",
        "- Raw video metadata: 80",
        f"- Normalized content items: {len(seed['contentItems'])}",
        f"- Query observations: {len(seed['queryObservations'])}",
        "- Thumbnail policy: reference-only, UI placeholder only",
        "",
        "## Content Type Counts",
        "",
        "| Type | Count |",
        "| --- | --- |",
    ]
    for key, count in sorted(by_type.items()):
        summary_lines.append(f"| {key} | {count} |")
    summary_lines += [
        "",
        "## Top 20 Normalized Items",
        "",
        "| Rank | Episode | Type | Title | Score | Tags |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for idx, item in enumerate(seed["contentItems"][:20], start=1):
        tags = ", ".join(item["tags"][:5])
        summary_lines.append(
            f"| {idx} | {item['episode']} | {item['contentType']} | {item['title']} | {item['qualityScore']} | {tags} |"
        )
    summary_lines += [
        "",
        "## Query Observations",
        "",
        "| Query | Status | Review State | Observed Entries |",
        "| --- | --- | --- | --- |",
    ]
    for observation in seed["queryObservations"]:
        summary_lines.append(
            f"| {observation['query']} | {observation['status']} | {observation['reviewState']} | {len(observation['entries'])} |"
        )
    SUMMARY_PATH.write_text("\n".join(summary_lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    seed_db = build()
    write_outputs(seed_db)
    print(json.dumps(seed_db["meta"], ensure_ascii=False, indent=2))
