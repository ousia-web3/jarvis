const screenButtons = document.querySelectorAll("[data-screen-link]");
const screens = {
  home: document.querySelector("#screen-home"),
  explore: document.querySelector("#screen-explore"),
  detail: document.querySelector("#screen-detail"),
};
const mobileActionBar = document.querySelector(".mobile-action-bar");
const seedDb = window.TRIP_ATLAS_DB || { meta: {}, contentItems: [], sourceVideos: [] };
const contentItems = Array.isArray(seedDb.contentItems) ? seedDb.contentItems : [];
const sourceVideos = Array.isArray(seedDb.sourceVideos) ? seedDb.sourceVideos : [];
const queryObservations = Array.isArray(seedDb.queryObservations) ? seedDb.queryObservations : [];
const sourceVideoMap = new Map(sourceVideos.map((video) => [video.sourceVideoId, video]));
let visibleItems = [...contentItems];
let selectedItem = contentItems[0] || null;
let currentSortMode = "recommend";
let currentSearchTokens = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function tagsMarkup(tags, limit = 4) {
  return (tags || [])
    .slice(0, limit)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");
}

function visualMarkup(item, extraClass = "") {
  const tone = item?.tone || "tone-sea";
  const label = `${item?.title || "콘텐츠"} 이미지 준비중`;
  return `
    <div class="visual-slot ${extraClass} ${tone}" role="img" aria-label="${escapeHtml(label)}">
      <span>이미지 준비중</span>
    </div>
  `;
}

function normalizeScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function qualityStatusLabel(value) {
  const score = normalizeScore(value);
  return score >= 100 ? "완료" : `${score}%`;
}

function qualityMetaLabel(value) {
  const score = normalizeScore(value);
  return score >= 100 ? "품질 완료" : `품질 ${score}%`;
}

function qualityBadgeMarkup(value) {
  const score = normalizeScore(value);
  const toneClass = score >= 100 ? " is-complete" : score >= 90 ? " is-strong" : "";

  return `
    <span class="quality-meter${toneClass}" style="--score: ${score}" aria-label="품질 상태 ${score}%">
      <span class="quality-meter-ring" aria-hidden="true"></span>
      <span class="quality-meter-text">${escapeHtml(qualityStatusLabel(score))}</span>
    </span>
  `;
}

function sourceVideoFor(item) {
  return sourceVideoMap.get(item?.sourceVideoId) || null;
}

function sourceRank(item) {
  const rank = Number(item?.sourceRank ?? sourceVideoFor(item)?.playlistIndex);
  return Number.isFinite(rank) ? rank : 9999;
}

function latestRankLabel(item) {
  const rank = sourceRank(item);
  if (rank === 9999) return "원천 영상";
  return rank <= 3 ? `최신 TOP${rank}` : `채널 최신 ${rank}번째`;
}

function sourceEvidenceMarkup(item) {
  const video = sourceVideoFor(item);
  const sourceTitle = video?.title || item.fullTitle || item.title;
  const channel = video?.channel || "YouTube";
  const sourceUrl = item.sourceUrl || video?.sourceUrl || "#";
  const evidenceMeta = [latestRankLabel(item), item.episode, item.durationString, item.rightsPolicy === "link-only" ? "링크 전용" : item.rightsPolicy]
    .filter(Boolean)
    .join(" · ");

  return `
    <div class="source-evidence" aria-label="최신 영상 근거">
      <div>
        <span class="evidence-kicker">최신 영상 근거</span>
        <strong>${escapeHtml(sourceTitle)}</strong>
        <p>${escapeHtml(channel)} · ${escapeHtml(evidenceMeta)}</p>
      </div>
      <a class="source-evidence-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">원본 영상</a>
    </div>
  `;
}

function observationMatches(observation, tokens = currentSearchTokens) {
  if (!tokens.length) return false;
  const haystack = [
    observation.query,
    observation.source,
    observation.status,
    observation.reviewState,
    observation.reason,
    observation.freshnessNote,
    observation.searchUrl,
    ...(observation.entries || []).flatMap((entry) => [entry.title, entry.channel, entry.sourceUrl, entry.durationString]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function matchingObservations(tokens = currentSearchTokens) {
  return queryObservations.filter((observation) => observationMatches(observation, tokens));
}

function currentSearchLabel(tokens = currentSearchTokens) {
  return tokens.join(" ").trim();
}

function youtubeSearchUrlForQuery(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAI%253D`;
}

function observationMarkup(observation, contentCount) {
  const entries = (observation.entries || []).slice(0, 4);
  const statusText = contentCount > 0 ? "콘텐츠 후보와 함께 관측됨" : "콘텐츠 후보 없음";

  return `
    <article class="observation-entry" aria-label="${escapeHtml(observation.query)} 관측 입구">
      <div class="observation-heading">
        <div>
          <span class="type-badge observation-badge">관측 입구</span>
          <h3>${escapeHtml(observation.query)}</h3>
          <p>${escapeHtml(observation.reason || "최신 검색에서 원천 영상이 관측되었고 콘텐츠화 검토가 필요합니다.")}</p>
        </div>
        <a class="source-evidence-link" href="${escapeHtml(observation.searchUrl)}" target="_blank" rel="noreferrer">검색 원본</a>
      </div>
      <div class="meta-row">
        <span>${escapeHtml(statusText)}</span>
        <span>${escapeHtml(observation.reviewState || "needs-review")}</span>
        <span>${escapeHtml(observation.freshnessNote || "업로드일 검수 필요")}</span>
      </div>
      <div class="observation-list">
        ${entries
          .map(
            (entry) => `
              <div class="observed-video">
                <strong>${escapeHtml(entry.title)}</strong>
                <p>${escapeHtml(entry.channel || "YouTube")} · ${escapeHtml(entry.durationString || "길이 미상")} · ${escapeHtml(entry.rightsPolicy || "link-only")}</p>
                <a href="${escapeHtml(entry.sourceUrl)}" target="_blank" rel="noreferrer">원본 영상</a>
              </div>
            `,
          )
          .join("")}
      </div>
      <button class="ghost-button observation-action" type="button">콘텐츠화 검토</button>
    </article>
  `;
}

function observationRequestMarkup(tokens = currentSearchTokens) {
  const query = currentSearchLabel(tokens);
  const searchUrl = youtubeSearchUrlForQuery(query);

  return `
    <article class="observation-entry observation-request" aria-label="${escapeHtml(query)} 관측 요청">
      <div class="observation-heading">
        <div>
          <span class="type-badge observation-badge">관측 요청</span>
          <h3>${escapeHtml(query)}</h3>
          <p>현재 seed DB에는 콘텐츠 후보와 관측 영상이 없습니다. 최신 YouTube 검색 원본을 열어 운영 검수 후 queryObservations에 추가할 수 있습니다.</p>
        </div>
        <a class="source-evidence-link" href="${escapeHtml(searchUrl)}" target="_blank" rel="noreferrer">검색 원본</a>
      </div>
      <div class="meta-row">
        <span>관측 대기</span>
        <span>needs-source-refresh</span>
        <span>실시간 반영은 refresh/API 연동 필요</span>
      </div>
      <button class="ghost-button observation-action" type="button">관측 요청 등록</button>
    </article>
  `;
}

function itemMeta(item) {
  const meta = [];
  if (item.episode) meta.push(item.episode);
  if (item.durationString) meta.push(item.durationString);
  meta.push(latestRankLabel(item));
  meta.push(qualityMetaLabel(item.qualityScore));
  meta.push(item.rightsPolicy === "link-only" ? "링크 전용" : item.rightsPolicy);
  return meta;
}

function sortItems(items, mode = currentSortMode) {
  const sorted = [...items];
  sorted.sort((a, b) => {
    if (mode === "latest") {
      return sourceRank(a) - sourceRank(b) || normalizeScore(b.qualityScore) - normalizeScore(a.qualityScore);
    }
    if (mode === "easy") {
      return Number(a.sourceRank ?? 9999) - Number(b.sourceRank ?? 9999);
    }
    return normalizeScore(b.qualityScore) - normalizeScore(a.qualityScore) || sourceRank(a) - sourceRank(b);
  });
  return sorted;
}

function renderMetrics() {
  const sourceCount = document.querySelector("#source-count");
  const contentCount = document.querySelector("#content-count");
  if (sourceCount) sourceCount.textContent = seedDb.meta?.rawVideoCount || seedDb.sourceVideos?.length || 0;
  if (contentCount) contentCount.textContent = seedDb.meta?.contentItemCount || contentItems.length;

  const routeList = document.querySelector("#route-list");
  if (routeList && contentItems.length) {
    const top = contentItems.slice(0, 3);
    routeList.innerHTML = top
      .map((item) => `<li><strong>${escapeHtml(item.episode || item.contentType)}</strong><span>${escapeHtml(item.title)}</span></li>`)
      .join("");
  }
}

function renderHomeCards() {
  const grid = document.querySelector("#home-card-grid");
  if (!grid || !contentItems.length) return;
  grid.innerHTML = contentItems
    .slice(0, 6)
    .map(
      (item) => `
        <article class="content-card">
          ${visualMarkup(item)}
          <div class="card-body">
            <div class="card-topline">
              <span class="type-badge">${escapeHtml(item.contentType)}</span>
              ${qualityBadgeMarkup(item.qualityScore)}
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.recommendationReason)}</p>
            <div class="meta-row">${itemMeta(item)
              .slice(0, 3)
              .map((meta) => `<span>${escapeHtml(meta)}</span>`)
              .join("")}</div>
            <button class="ghost-button" type="button" data-detail-id="${escapeHtml(item.id)}">상세 보기</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderResults(items = visibleItems) {
  const grid = document.querySelector("#result-grid");
  const count = document.querySelector("#results-count");
  const observations = matchingObservations();
  const hasPendingObservationRequest = currentSearchTokens.length > 0 && !items.length && !observations.length;
  const observationEntryCount = observations.reduce((sum, observation) => sum + (observation.entries?.length || 0), 0);
  if (count) {
    const pendingText = hasPendingObservationRequest ? " / 관측 요청 1개" : "";
    count.textContent = `메타 기반 콘텐츠 후보 ${items.length}개 / 관측 영상 ${observationEntryCount}개${pendingText} / 원천 영상 ${seedDb.meta?.rawVideoCount || 0}개`;
  }
  if (!grid) return;
  if (!items.length && !observations.length && !hasPendingObservationRequest) {
    grid.innerHTML = `<p class="empty-state">검색 결과가 없습니다. 다른 지역, 음식, 최신 영상 키워드로 다시 검색해 주세요.</p>`;
    return;
  }

  const itemMarkup = items
    .map(
      (item) => `
        <article class="result-card ${selectedItem?.id === item.id ? "is-selected" : ""}" data-detail-id="${escapeHtml(item.id)}">
          ${visualMarkup(item, "compact")}
          <div>
            <div class="card-topline">
              <span class="type-badge">${escapeHtml(item.contentType)}</span>
              ${qualityBadgeMarkup(item.qualityScore)}
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.recommendationReason)}</p>
            <div class="meta-row">${itemMeta(item)
              .map((meta) => `<span>${escapeHtml(meta)}</span>`)
              .join("")}</div>
            <div class="tag-row compact-tags">${tagsMarkup(item.tags, 5)}</div>
            ${sourceEvidenceMarkup(item)}
            <button class="text-button inline-detail" type="button" data-detail-id="${escapeHtml(item.id)}">상세 보기</button>
          </div>
        </article>
      `,
    )
    .join("");
  const observationEntriesMarkup = observations.map((observation) => observationMarkup(observation, items.length)).join("");
  const pendingObservationMarkup = hasPendingObservationRequest ? observationRequestMarkup() : "";
  grid.innerHTML = itemMarkup + observationEntriesMarkup + pendingObservationMarkup;
}

function renderDetail(item = selectedItem) {
  if (!item) return;
  selectedItem = item;
  const detailTitle = document.querySelector("#detail-title");
  const detailSummary = document.querySelector("#detail-summary");
  const detailReason = document.querySelector("#detail-reason");
  const detailTags = document.querySelector("#detail-tags");
  const linkedList = document.querySelector("#linked-list");
  const facts = document.querySelector("#detail-facts");
  const sourceLink = document.querySelector("#detail-source-link");
  const hero = document.querySelector(".visual-slot.hero");

  if (detailTitle) detailTitle.textContent = item.title;
  if (detailSummary) detailSummary.textContent = item.fullTitle || item.title;
  if (detailReason) detailReason.textContent = item.recommendationReason;
  if (detailTags) detailTags.innerHTML = tagsMarkup(item.tags, 8);
  if (hero) {
    hero.className = `visual-slot hero ${item.tone || "tone-sea"}`;
    hero.setAttribute("aria-label", `${item.title} 이미지 준비중`);
  }
  if (linkedList) {
    linkedList.innerHTML = [
      item.episode || "에피소드 미상",
      ...(item.regions || []).slice(0, 2),
      ...(item.foods || []).slice(0, 2),
      ...(item.styles || []).slice(0, 2),
    ]
      .filter(Boolean)
      .slice(0, 5)
      .map((label) => `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`)
      .join("");
  }
  if (facts) {
    const rows = [
      { key: "콘텐츠 유형", value: item.contentType },
      { key: "에피소드", value: item.episode || "-" },
      { key: "재생 시간", value: item.durationString || "-" },
      { key: "품질 상태", valueMarkup: qualityBadgeMarkup(item.qualityScore) },
      { key: "이미지 상태", value: item.imageStatus },
      { key: "권리 상태", value: item.rightsPolicy },
    ];
    facts.innerHTML = rows
      .map((row) => {
        const value = row.valueMarkup || escapeHtml(row.value);
        return `<div><dt>${escapeHtml(row.key)}</dt><dd>${value}</dd></div>`;
      })
      .join("");
  }
  if (sourceLink) {
    sourceLink.href = item.sourceUrl || "#";
  }
  renderResults(visibleItems);
}

function applySearch() {
  const query = document.querySelector("#home-search")?.value.trim().toLowerCase() || "";
  const tokens = query.split(/\s+/).filter(Boolean);
  currentSearchTokens = tokens;
  const genericSourceTerms = "유튜브 youtube 영상 동영상 원천 근거 콘텐츠 최신 정보 업데이트";
  const shouldPrioritizeLatest = tokens.some((token) => ["최신", "업데이트", "동영상"].some((term) => token.includes(term)));
  if (shouldPrioritizeLatest && currentSortMode === "recommend") {
    currentSortMode = "latest";
    const sortSelect = document.querySelector("#result-sort");
    if (sortSelect) sortSelect.value = "latest";
  }
  visibleItems = sortItems(
    contentItems.filter((item) => {
      if (!tokens.length) return true;
      const video = sourceVideoFor(item);
      const haystack = [
        item.title,
        item.fullTitle,
        item.episode,
        item.contentType,
        item.sourceUrl,
        item.rightsPolicy,
        latestRankLabel(item),
        genericSourceTerms,
        ...(item.tags || []),
        video?.title,
        video?.rawTitle,
        video?.channel,
        video?.sourceUrl,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    }),
  );
  renderResults(visibleItems);
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.toggle("is-active", key === name);
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.screenLink === name);
  });

  if (mobileActionBar) {
    mobileActionBar.hidden = name !== "explore";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

screenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const screenName = event.currentTarget.dataset.screenLink;
    if (screenName && screens[screenName]) {
      event.preventDefault();
      showScreen(screenName);
    }
  });
});

document.addEventListener("click", (event) => {
  if (event.target.closest("a")) return;
  const detailButton = event.target.closest("[data-detail-id]");
  if (!detailButton) return;
  const item = contentItems.find((candidate) => candidate.id === detailButton.dataset.detailId);
  if (item) {
    renderDetail(item);
    showScreen("detail");
  }
});

document.querySelector(".search-box")?.addEventListener("submit", (event) => {
  event.preventDefault();
  applySearch();
  showScreen("explore");
});

document.querySelector("#home-search")?.addEventListener("input", applySearch);
document.querySelector("#result-sort")?.addEventListener("change", (event) => {
  currentSortMode = event.target.value;
  visibleItems = sortItems(visibleItems);
  renderResults(visibleItems);
});

const filterPanel = document.querySelector("[data-filter-panel]");
const scrim = document.querySelector("[data-scrim]");
const openFilter = document.querySelector("[data-filter-open]");
const closeFilter = document.querySelector("[data-filter-close]");

function setFilter(open) {
  filterPanel.classList.toggle("is-open", open);
  scrim.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
}

openFilter.addEventListener("click", () => setFilter(true));
closeFilter.addEventListener("click", () => setFilter(false));
scrim.addEventListener("click", () => setFilter(false));

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setFilter(false);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    setFilter(false);
  }
});

renderMetrics();
renderHomeCards();
renderResults();
renderDetail(selectedItem);
