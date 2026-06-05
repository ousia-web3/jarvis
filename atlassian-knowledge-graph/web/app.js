const state = {
  health: null,
  hub: null,
  pages: [],
  graph: { nodes: [], edges: [] },
  training: [],
  ideas: [],
  coverage: null,
  scheduler: null,
  searchResult: null,
  searchLoading: false,
  latestRunId: null,
  pollTimer: null,
  graphMode: "semantic",
  edgeFilter: "all",
  search: "",
  density: 120,
};

const employeeGuides = [
  {
    role: "처음 온 담당자",
    summary: "학습 매뉴얼로 전체 흐름을 잡고, 추천 질문으로 핵심 용어를 확인합니다.",
    query: "신규 담당자 학습 매뉴얼을 보여줘",
    action: "매뉴얼 먼저 보기",
  },
  {
    role: "기획/업무 담당자",
    summary: "업무 아이디어와 리스크 카드를 함께 보며 적용 가능성과 승인 필요 여부를 확인합니다.",
    query: "업무 아이디어를 알려줘",
    action: "아이디어 찾기",
  },
  {
    role: "데이터/검색 담당자",
    summary: "근거 문서, 의미 노드, 지표/품질 후보를 연결해 데이터 흐름을 점검합니다.",
    query: "검색 데이터 품질 지표를 알려줘",
    action: "품질 근거 보기",
  },
  {
    role: "개발/운영 담당자",
    summary: "Neptune, Fallback, 자동화 관련 문서를 확인하고 원본 위키로 세부 설정을 추적합니다.",
    query: "Neptune은 어디에 쓰였어?",
    action: "기술 근거 보기",
  },
];

const graphView = {
  nodes: [],
  edges: [],
  nodeMap: new Map(),
  transform: { x: 0, y: 0, k: 1 },
  draggingNode: null,
  panning: false,
  lastPointer: { x: 0, y: 0 },
  hovered: null,
  selected: null,
  alpha: 0,
  animationId: null,
  fitted: false,
};

const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.message || payload.error || JSON.stringify(payload));
  }
  return payload;
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

async function loadAll() {
  const [health, hub, pages, graph, training, ideas, coverage, scheduler, searchResult] = await Promise.all([
    api("/api/health"),
    api("/api/hub"),
    api("/api/pages"),
    api(`/api/graph?mode=${encodeURIComponent(state.graphMode)}`),
    api("/api/training"),
    api("/api/ideas"),
    api("/api/coverage"),
    api("/api/scheduler"),
    api("/api/search"),
  ]);
  state.health = health;
  state.hub = hub;
  state.pages = pages.pages || [];
  state.graph = graph;
  state.training = training.cards || [];
  state.ideas = ideas.ideas || [];
  state.coverage = coverage;
  state.scheduler = scheduler;
  state.searchResult = searchResult;
  state.latestRunId = latestRunId(health) || state.latestRunId;
  initGraphData(false);
  render();
}

function render() {
  $("pageCount").textContent = String(state.pages.length);
  $("nodeCount").textContent = String(graphView.nodes.length);
  $("edgeCount").textContent = String(graphView.edges.length);
  $("tokenState").textContent = state.health?.tokenConfigured ? "설정됨" : "미설정";
  const latest = state.health?.latestRuns?.[0];
  $("runState").textContent = latest ? `${latest.status} · ${latest.page_count}p` : "대기";
  $("hubRunState").textContent = latest ? `${latest.status} · ${latest.page_count}p` : "대기";
  renderActions();
  renderSyncWarning(latest);
  renderUserSearch();
  renderEmployeeGuide();
  renderCoverage();
  renderHub();
  renderCategoryTree();
  renderPages();
  renderCards();
  renderNodeDetail(graphView.selected);
  drawGraph();
}

async function reloadGraph() {
  state.graph = await api(`/api/graph?mode=${encodeURIComponent(state.graphMode)}`);
  initGraphData(false);
  render();
}

function renderActions() {
  const sampleButton = $("sampleBtn");
  const syncButton = $("syncBtn");
  if (sampleButton) sampleButton.hidden = state.health?.sampleLoadEnabled === false;
  if (syncButton) {
    const syncEnabled = state.health?.manualSyncEnabled !== false;
    const syncAllowed = state.health?.manualSyncAllowed !== false;
    syncButton.hidden = !syncEnabled || !syncAllowed;
    syncButton.disabled = false;
    syncButton.title = syncAllowed ? "위키 컨텐츠를 다시 불러옵니다." : "위키 업데이트는 로컬 관리자 접속에서만 사용할 수 있습니다.";
  }
}

function renderSyncWarning(latest) {
  const target = $("syncWarning");
  const sampleOnly = latest?.message?.includes("샘플");
  if (state.health?.tokenConfigured && state.health?.emailConfigured && !sampleOnly) {
    target.innerHTML = "";
    target.hidden = true;
    return;
  }
  target.hidden = false;
  target.innerHTML = state.health?.tokenConfigured && state.health?.emailConfigured
    ? `<strong>샘플 데이터 상태</strong><span>실제 Atlassian 동기화를 실행해야 임직원용 지식 지도가 완성됩니다.</span>`
    : `<strong>실제 위키 미연동</strong><span>.env에 재발급한 Atlassian 이메일/토큰을 입력한 뒤 동기화하세요. 현재 화면은 샘플 기반입니다.</span>`;
}

function renderDynamicGraphStatus() {
  const scheduler = state.scheduler || state.health?.scheduler || {};
  const latest = state.health?.latestRuns?.[0] || {};
  const status = scheduler.status || (state.health?.autoSyncEnabled ? "waiting" : "disabled");
  const interval = scheduler.intervalMinutes || state.health?.autoSyncIntervalMinutes || 0;
  const title = dynamicStatusTitle(scheduler, latest);
  const lastRunTime = scheduler.lastEndedAt || latest.ended_at || latest.started_at || "";
  const nextRunTime = scheduler.nextRunAt || "";
  setText("dynamicGraphStatus", interval ? `${title} · ${interval}분 주기` : title);
  setText("dynamicLastSync", formatDateTime(lastRunTime));
  setText("dynamicNextSync", scheduler.enabled ? formatDateTime(nextRunTime) : "자동 갱신 꺼짐");
  setText("dynamicRefresh", scheduler.enabled ? "30초마다 자동 확인" : "설정 확인 필요");
  const pulse = $("dynamicPulse");
  if (pulse) {
    pulse.className = `pulse-dot ${dynamicPulseClass(scheduler, status)}`;
  }
}

function dynamicStatusTitle(scheduler, latest) {
  if (!scheduler.enabled) {
    return scheduler.status === "blocked" ? "자동 갱신 준비 필요" : "자동 갱신 비활성화";
  }
  if (scheduler.running || scheduler.status === "running") {
    return "위키 변경사항을 지식그래프로 반영 중";
  }
  if (scheduler.status === "success" || latest.status === "success") {
    return "최신 위키 컨텐츠 기준으로 반영 완료";
  }
  if (scheduler.status === "failed") {
    return "마지막 자동 갱신 확인 필요";
  }
  return "지식그래프 자동 갱신 대기 중";
}

function dynamicPulseClass(scheduler, status) {
  if (!scheduler.enabled) return status === "blocked" ? "is-blocked" : "is-disabled";
  if (scheduler.running || status === "running") return "is-running";
  if (status === "failed") return "is-failed";
  return "is-waiting";
}

function setText(id, value) {
  const target = $(id);
  if (target) target.textContent = value;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function latestRunId(health) {
  return health?.latestRuns?.[0]?.id ?? null;
}

async function pollDynamicGraph() {
  try {
    const [health, scheduler] = await Promise.all([
      api("/api/health"),
      api("/api/scheduler"),
    ]);
    const previousRunId = state.latestRunId;
    const nextRunId = latestRunId(health);
    state.health = health;
    state.scheduler = scheduler;
    state.latestRunId = nextRunId || previousRunId;
    if (nextRunId && previousRunId && nextRunId !== previousRunId) {
      await loadAll();
      showToast("위키 변경사항을 지식그래프에 자동 반영했습니다.");
      return;
    }
    renderDynamicGraphStatus();
    renderCoverage();
  } catch (error) {
    setText("dynamicGraphStatus", "동적 지식그래프 상태 확인 지연");
  }
}

function startDynamicPolling() {
  if (state.pollTimer) return;
  state.pollTimer = window.setInterval(pollDynamicGraph, 30000);
}

async function runUserSearch(query) {
  state.searchLoading = true;
  renderUserSearch();
  try {
    state.searchResult = await api(`/api/search?q=${encodeURIComponent(query)}`);
  } finally {
    state.searchLoading = false;
    renderUserSearch();
  }
}

function renderUserSearch() {
  const result = state.searchResult || {};
  const suggested = result.suggestedQueries || [];
  const suggestedTarget = $("suggestedQueries");
  const answerTarget = $("searchAnswer");
  const searchButton = $("userSearchBtn");
  if (searchButton) searchButton.disabled = state.searchLoading;
  if (suggestedTarget) {
    suggestedTarget.innerHTML = suggested.map((query) => (
      `<button type="button" class="query-chip" data-query="${escapeHtml(query)}">${escapeHtml(query)}</button>`
    )).join("");
  }
  if (!answerTarget) return;
  if (state.searchLoading) {
    answerTarget.innerHTML = `<div class="answer-summary"><strong>검색 중입니다</strong><p>위키 지식 그래프에서 관련 문서와 개념을 찾고 있습니다.</p></div>`;
    return;
  }
  const answer = result.answer;
  if (!answer) {
    answerTarget.innerHTML = "";
    return;
  }
  const sources = result.sources || [];
  const terms = result.relatedTerms || [];
  const ideas = result.ideas || [];
  const manuals = result.manuals || [];
  answerTarget.innerHTML = `
    <article class="answer-summary">
      <div>
        <span>${escapeHtml(result.query ? "검색 결과" : "시작")}</span>
        <h3>${escapeHtml(answer.title)}</h3>
        <p>${escapeHtml(answer.summary)}</p>
      </div>
      ${answer.confidence ? `<div class="confidence-banner">
        <strong>답변 신뢰도 ${escapeHtml(answer.confidence.labelKo)} · ${Math.round(Number(answer.confidence.score || 0) * 100)}%</strong>
        <span>${escapeHtml(answer.confidence.basis || "")}</span>
      </div>` : ""}
      ${terms.length ? `<div class="term-row">${terms.slice(0, 6).map(termChip).join("")}</div>` : ""}
      ${answer.nextActions?.length ? `<ol>${answer.nextActions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>` : ""}
    </article>
    ${manuals.length ? `<section class="answer-section"><h3>관련 학습 매뉴얼</h3><div class="answer-grid manual-grid">${manuals.map(manualCard).join("")}</div></section>` : ""}
    ${sources.length ? `<section class="answer-section"><h3>근거 문서</h3><div class="answer-grid source-grid">${sources.map(sourceCard).join("")}</div></section>` : ""}
    ${ideas.length ? `<section class="answer-section"><h3>업무 아이디어</h3><div class="answer-grid idea-grid">${ideas.map(searchIdeaCard).join("")}</div></section>` : ""}
  `;
}

function termChip(term) {
  return `<span class="chip">${escapeHtml(term.name)} · ${escapeHtml(term.kind)}</span>`;
}

function manualCard(manual) {
  return `<article class="answer-card">
    <strong>${escapeHtml(manual.title)}</strong>
    <p>${escapeHtml(manual.summary)}</p>
    <small>${escapeHtml(manual.matchReason || "")}</small>
    <a class="card-link primary" href="${escapeHtml(manual.url)}" target="_blank" rel="noreferrer">학습 매뉴얼 열기</a>
  </article>`;
}

function sourceCard(source, index) {
  const headings = (source.headings || []).slice(0, 3).map((item) => `<span class="mini-chip">${escapeHtml(item)}</span>`).join("");
  const reasons = (source.matchReasons || []).map((item) => `<span class="mini-chip">${escapeHtml(item)}</span>`).join("");
  return `<article class="answer-card">
    <div class="source-rank">${index + 1}</div>
    <strong>${escapeHtml(source.title)}</strong>
    <small>${escapeHtml(source.type)} · 신뢰도 ${escapeHtml(source.confidenceLabelKo || "")} ${Math.round(Number(source.confidenceScore || 0) * 100)}% · score ${Number(source.score || 0).toFixed(1)}</small>
    <p>${escapeHtml(source.summary)}</p>
    ${reasons ? `<div class="mini-chip-row reason-row">${reasons}</div>` : ""}
    ${headings ? `<div class="mini-chip-row">${headings}</div>` : ""}
    <a class="card-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">원본 위키 열기</a>
  </article>`;
}

function searchIdeaCard(idea) {
  return `<article class="answer-card">
    <strong>${escapeHtml(idea.title)}</strong>
    <small>Risk ${escapeHtml(idea.riskLevel)} · Score ${Number(idea.score || 0).toFixed(2)}</small>
    <p>${escapeHtml(idea.summary)}</p>
  </article>`;
}

function renderEmployeeGuide() {
  const target = $("employeeGuide");
  if (!target) return;
  target.innerHTML = employeeGuides.map((guide) => `<article class="guide-card">
    <strong>${escapeHtml(guide.role)}</strong>
    <p>${escapeHtml(guide.summary)}</p>
    <button type="button" class="guide-query" data-query="${escapeHtml(guide.query)}">${escapeHtml(guide.action)}</button>
  </article>`).join("");
}

function renderCoverage() {
  const coverage = state.coverage || {};
  const scheduler = state.scheduler || state.health?.scheduler || {};
  const summary = coverage.summary || {};
  const summaryTarget = $("coverageSummary");
  const checksTarget = $("coverageChecks");
  const schedulerTarget = $("schedulerState");
  if (schedulerTarget) {
    const status = scheduler.status || "disabled";
    const interval = scheduler.intervalMinutes ? `${scheduler.intervalMinutes}분 주기` : "주기 미설정";
    schedulerTarget.textContent = scheduler.enabled
      ? `자동 갱신 ${displaySchedulerStatus(status)} · ${interval}`
      : "수동 업데이트 방식";
  }
  if (summaryTarget) {
    summaryTarget.innerHTML = [
      coverageMetric("루트 반영", `${summary.foundRootCount || 0}/${summary.rootCount || 0}`, "지정 루트 페이지"),
      coverageMetric("수집 콘텐츠", summary.pageCount || 0, `최대 depth ${summary.maxDepth || 0}`),
      coverageMetric("본문 커버리지", `${Math.round(Number(summary.bodyCoverageRatio || 0) * 100)}%`, `${summary.bodyPageCount || 0}개 본문`),
      coverageMetric("관계 무결성", summary.missingEndpointCount || 0, "누락 엔드포인트"),
      coverageMetric("의미 그래프", summary.semanticNodeCount || 0, `${summary.semanticEdgeCount || 0} relations`),
      coverageMetric("업무 아이디어", summary.ideaCount || 0, "파생 후보"),
    ].join("");
  }
  if (checksTarget) {
    const roots = (coverage.rootPages || []).map((root) => `<div class="coverage-root ${root.found ? "pass" : "fail"}">
      <strong>${escapeHtml(root.title || root.id)}</strong>
      <span>${root.found ? `${root.descendantCount}개 하위 콘텐츠` : "미수집"}</span>
    </div>`).join("");
    const checks = (coverage.qualityChecks || []).map((check) => `<div class="coverage-check ${escapeHtml(check.status)}">
      <strong>${escapeHtml(check.name)}</strong>
      <span>${escapeHtml(displayCheckStatus(check.status))} · ${escapeHtml(check.passed)}/${escapeHtml(check.total)}</span>
      <p>${escapeHtml(check.description)}</p>
    </div>`).join("");
    checksTarget.innerHTML = `${roots ? `<div class="coverage-roots">${roots}</div>` : ""}${checks}`;
  }
}

function coverageMetric(label, value, meta) {
  return `<article class="coverage-metric">
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(value)}</strong>
    <small>${escapeHtml(meta)}</small>
  </article>`;
}

function displaySchedulerStatus(status) {
  const mapping = {
    waiting: "대기",
    running: "실행 중",
    success: "성공",
    failed: "실패",
    blocked: "차단",
    disabled: "비활성화",
  };
  return mapping[status] || status;
}

function displayCheckStatus(status) {
  const mapping = {
    pass: "정상",
    warn: "주의",
    fail: "확인 필요",
  };
  return mapping[status] || status;
}

function renderHub() {
  const hub = state.hub || {};
  renderHubList("quickStart", hub.starterPages || [], (page) => ({
    title: page.title,
    meta: `${displayType(page.type)} · 먼저 읽기`,
    summary: page.body_text || "원문 구조를 확인하세요.",
    url: page.url,
  }), "교육/온보딩 문서가 아직 없습니다.");
  renderHubList("hubConcepts", hub.topConcepts || [], (node) => ({
    title: node.label,
    meta: `${node.kind || "Concept"} · 그래프 핵심어`,
    summary: node.summary,
    url: "",
  }), "핵심 개념 후보가 아직 없습니다.");
  renderHubList("hubRisks", hub.riskNodes || [], (node) => ({
    title: node.label,
    meta: "승인/보안 검토 후보",
    summary: node.summary,
    url: "",
  }), "리스크 후보가 아직 없습니다.");
  renderHubList("hubMetrics", hub.metricNodes || [], (node) => ({
    title: node.label,
    meta: "품질/성과 지표 후보",
    summary: node.summary,
    url: "",
  }), "지표 후보가 아직 없습니다.");
}

function renderHubList(id, items, mapper, empty) {
  const target = $(id);
  if (!items.length) {
    target.innerHTML = `<div class="hub-item muted">${escapeHtml(empty)}</div>`;
    return;
  }
  target.innerHTML = items.slice(0, 6).map((item) => {
    const view = mapper(item);
    const title = view.url
      ? `<a href="${escapeHtml(view.url)}" target="_blank" rel="noreferrer">${escapeHtml(view.title)}</a>`
      : `<strong>${escapeHtml(view.title)}</strong>`;
    return `<div class="hub-item">
      ${title}
      <small>${escapeHtml(view.meta || "")}</small>
      <p>${escapeHtml(trimLabel(view.summary || "", 130))}</p>
    </div>`;
  }).join("");
}

function renderCategoryTree() {
  const tree = state.hub?.categoryTree || [];
  const target = $("categoryTree");
  if (!tree.length) {
    target.innerHTML = `<p class="muted-text">카테고리 트리가 없습니다.</p>`;
    return;
  }
  target.innerHTML = renderTreeNodes(tree);
}

function renderTreeNodes(nodes) {
  return `<ul>${nodes.map((node) => `<li>
    <a href="${escapeHtml(node.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(node.title)}</a>
    <span>${escapeHtml(displayType(node.type))}</span>
    ${node.children?.length ? renderTreeNodes(node.children) : ""}
  </li>`).join("")}</ul>`;
}

function initGraphData(preservePositions) {
  const rawNodes = state.graph.nodes || [];
  const rawEdges = state.graph.edges || [];
  const degree = new Map();
  rawEdges.forEach((edge) => {
    degree.set(edge.source_id, (degree.get(edge.source_id) || 0) + 1);
    degree.set(edge.target_id, (degree.get(edge.target_id) || 0) + 1);
  });

  const contentNodes = rawNodes.filter((node) => node.type !== "Concept");
  const conceptNodes = rawNodes
    .filter((node) => node.type === "Concept")
    .sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0))
    .slice(0, Number(state.density));
  const visibleIds = new Set([...contentNodes, ...conceptNodes].map((node) => node.id));

  const previous = preservePositions ? graphView.nodeMap : new Map();
  graphView.nodes = [...contentNodes, ...conceptNodes].map((node, index) => {
    const old = previous.get(node.id);
    const depth = Number(node.depth || 0);
    const band = typeBand(node);
    const seed = seededPoint(node.id, index);
    return {
      ...node,
      degree: degree.get(node.id) || 0,
      radius: radiusForNode(node, degree.get(node.id) || 0),
      x: old?.x ?? 120 + depth * 165 + seed.x * 80,
      y: old?.y ?? 90 + band * 110 + seed.y * 520,
      vx: old?.vx ?? 0,
      vy: old?.vy ?? 0,
    };
  });
  graphView.nodeMap = new Map(graphView.nodes.map((node) => [node.id, node]));
  graphView.edges = rawEdges
    .filter((edge) => state.edgeFilter === "all" || edge.edge_type === state.edgeFilter)
    .filter((edge) => visibleIds.has(edge.source_id) && visibleIds.has(edge.target_id))
    .map((edge) => ({
      ...edge,
      source: graphView.nodeMap.get(edge.source_id),
      target: graphView.nodeMap.get(edge.target_id),
    }))
    .filter((edge) => edge.source && edge.target);
  graphView.alpha = 1;
  if (!preservePositions) graphView.fitted = false;
  startSimulation();
}

function startSimulation() {
  if (graphView.animationId) cancelAnimationFrame(graphView.animationId);
  const step = () => {
    if (graphView.alpha > 0.01) {
      tickSimulation();
      graphView.alpha *= 0.965;
      if (!graphView.fitted && graphView.alpha < 0.58) {
        fitGraph(false);
        graphView.fitted = true;
      }
      drawGraph();
      graphView.animationId = requestAnimationFrame(step);
    } else {
      drawGraph();
      graphView.animationId = null;
    }
  };
  graphView.animationId = requestAnimationFrame(step);
}

function tickSimulation() {
  const nodes = graphView.nodes;
  const alpha = graphView.alpha;
  const bounds = graphBounds();
  const centerX = (bounds.minX + bounds.maxX) / 2 || 500;
  const centerY = (bounds.minY + bounds.maxY) / 2 || 350;

  graphView.edges.forEach((edge) => {
    const source = edge.source;
    const target = edge.target;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const desired = edgeDistance(edge);
    const force = ((distance - desired) / distance) * 0.045 * alpha;
    const fx = dx * force;
    const fy = dy * force;
    if (!source.locked) {
      source.vx += fx;
      source.vy += fy;
    }
    if (!target.locked) {
      target.vx -= fx;
      target.vy -= fy;
    }
  });

  if (nodes.length <= 360) {
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x || 0.01;
        const dy = b.y - a.y || 0.01;
        const distanceSq = Math.max(60, dx * dx + dy * dy);
        const force = ((a.radius + b.radius + 18) * 8 * alpha) / distanceSq;
        const fx = dx * force;
        const fy = dy * force;
        if (!a.locked) {
          a.vx -= fx;
          a.vy -= fy;
        }
        if (!b.locked) {
          b.vx += fx;
          b.vy += fy;
        }
      }
    }
  }

  nodes.forEach((node) => {
    const depth = Number(node.depth || 0);
    const clusterX = node.type === "Concept" ? centerX + 260 : 120 + depth * 170;
    const clusterY = node.type === "Concept" ? centerY : 130 + typeBand(node) * 120;
    if (!node.locked) {
      node.vx += (clusterX - node.x) * 0.004 * alpha;
      node.vy += (clusterY - node.y) * 0.004 * alpha;
      node.vx *= 0.82;
      node.vy *= 0.82;
      node.x += node.vx;
      node.y += node.vy;
    }
  });
}

function renderPages() {
  const target = $("pages");
  if (!state.pages.length) {
    target.innerHTML = `<div class="page-item"><strong>수집된 페이지가 없습니다.</strong><small>샘플 로드 또는 Atlassian 동기화를 실행하세요.</small></div>`;
    return;
  }
  target.innerHTML = state.pages
    .map((page) => {
      const pad = Math.min(Number(page.depth || 0) * 14, 64);
      const type = displayType(page.type);
      return `<div class="page-item" style="margin-left:${pad}px">
        <a href="${escapeHtml(page.url)}" target="_blank" rel="noreferrer">${escapeHtml(page.title)}</a>
        <small>${escapeHtml(type)} · ID ${escapeHtml(page.id)} · depth ${page.depth}</small>
      </div>`;
    })
    .join("");
}

function renderCards() {
  $("training").innerHTML = state.training.length
    ? state.training.map(trainingCard).join("")
    : emptyCard("교육 카드를 생성하려면 데이터를 동기화하세요.");
  $("ideas").innerHTML = state.ideas.length
    ? state.ideas.map(ideaCard).join("")
    : emptyCard("업무 아이디어를 생성하려면 데이터를 동기화하세요.");
}

function trainingCard(card) {
  const chips = (card.headings || []).map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("");
  const links = [
    card.localUrl
      ? `<a class="card-link primary" href="${escapeHtml(card.localUrl)}" target="_blank" rel="noreferrer">학습 페이지 열기</a>`
      : "",
    card.sourceUrl
      ? `<a class="card-link" href="${escapeHtml(card.sourceUrl)}" target="_blank" rel="noreferrer">원본 위키</a>`
      : "",
  ].filter(Boolean).join("");
  return `<section class="card">
    <h3>${escapeHtml(card.title)}</h3>
    <p>${escapeHtml(card.summary)}</p>
    ${chips}
    ${links ? `<div class="card-actions">${links}</div>` : ""}
  </section>`;
}

function ideaCard(idea) {
  return `<section class="card">
    <h3>${escapeHtml(idea.title)}</h3>
    <p>${escapeHtml(idea.summary)}</p>
    <span class="chip">Risk ${escapeHtml(idea.risk_level)}</span>
    <span class="chip">Score ${Number(idea.score).toFixed(2)}</span>
  </section>`;
}

function emptyCard(message) {
  return `<section class="card"><p>${escapeHtml(message)}</p></section>`;
}

function drawGraph() {
  const canvas = $("graph");
  const ctx = canvas.getContext("2d");
  resizeCanvas(canvas, ctx);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  if (!graphView.nodes.length) {
    ctx.fillStyle = "#697386";
    ctx.font = "20px Arial";
    ctx.fillText("그래프 데이터가 없습니다.", 36, 56);
    return;
  }

  ctx.save();
  ctx.translate(graphView.transform.x, graphView.transform.y);
  ctx.scale(graphView.transform.k, graphView.transform.k);

  const searchIds = searchMatches();
  graphView.edges.forEach((edge) => drawEdge(ctx, edge, searchIds));
  graphView.nodes.forEach((node) => drawNode(ctx, node, searchIds));

  ctx.restore();
}

function drawEdge(ctx, edge, searchIds) {
  const source = edge.source;
  const target = edge.target;
  const alpha = searchIds.size && !searchIds.has(source.id) && !searchIds.has(target.id) ? 0.12 : 0.46;
  ctx.strokeStyle = colorForEdge(edge.edge_type, alpha);
  ctx.lineWidth = Math.max(0.7, Math.min(3, Number(edge.weight || 0.5) * 2.5));
  const mx = (source.x + target.x) / 2;
  const my = (source.y + target.y) / 2;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const curve = edge.edge_type === "PARENT_OF" ? 0 : 0.16;
  const cx = mx - dy * curve;
  const cy = my + dx * curve;
  ctx.beginPath();
  ctx.moveTo(source.x, source.y);
  ctx.quadraticCurveTo(cx, cy, target.x, target.y);
  ctx.stroke();
}

function drawNode(ctx, node, searchIds) {
  const selected = graphView.selected?.id === node.id;
  const hovered = graphView.hovered?.id === node.id;
  const matched = !searchIds.size || searchIds.has(node.id);
  ctx.globalAlpha = matched ? 1 : 0.22;
  ctx.fillStyle = colorForNode(node);
  ctx.strokeStyle = selected ? "#172033" : hovered ? "#b38600" : strokeForNode(node);
  ctx.lineWidth = selected ? 3.5 : hovered ? 3 : 1.7;
  ctx.beginPath();
  ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (shouldDrawLabel(node, selected, hovered, matched)) {
    ctx.font = labelFont(node);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#172033";
    ctx.globalAlpha = matched ? 0.95 : 0.36;
    ctx.fillText(trimLabel(node.label, node.type === "Concept" ? 14 : 20), node.x, node.y + node.radius + 5);
  }
  ctx.globalAlpha = 1;
}

function renderNodeDetail(node) {
  const target = $("nodeDetail");
  if (!node) {
    target.innerHTML = `<strong>그래프</strong><p>${graphView.nodes.length} nodes · ${graphView.edges.length} edges</p>`;
    return;
  }
  const kind = node.kind ? ` · ${node.kind}` : "";
  const link = node.url ? `<a href="${escapeHtml(node.url)}" target="_blank" rel="noreferrer">원문 열기</a>` : "";
  const headings = (node.headings || []).slice(0, 4).map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("");
  target.innerHTML = `<strong>${escapeHtml(node.label)}</strong>
    <p>${escapeHtml(node.type + kind)} · degree ${node.degree || 0}</p>
    <p>${escapeHtml(node.summary || "")}</p>
    ${headings}
    ${link}`;
}

function resizeCanvas(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1;
  const width = Math.floor(canvas.clientWidth * dpr);
  const height = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  } else {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function graphBounds() {
  if (!graphView.nodes.length) return { minX: 0, minY: 0, maxX: 1000, maxY: 700 };
  return graphView.nodes.reduce(
    (acc, node) => ({
      minX: Math.min(acc.minX, node.x),
      minY: Math.min(acc.minY, node.y),
      maxX: Math.max(acc.maxX, node.x),
      maxY: Math.max(acc.maxY, node.y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );
}

function fitGraph(animated = true) {
  const canvas = $("graph");
  const bounds = graphBounds();
  const pad = 80;
  const width = canvas.clientWidth || 1000;
  const height = canvas.clientHeight || 700;
  const graphWidth = Math.max(80, bounds.maxX - bounds.minX + pad * 2);
  const graphHeight = Math.max(80, bounds.maxY - bounds.minY + pad * 2);
  const k = Math.max(0.25, Math.min(2.4, Math.min(width / graphWidth, height / graphHeight)));
  graphView.transform = {
    k,
    x: width / 2 - ((bounds.minX + bounds.maxX) / 2) * k,
    y: height / 2 - ((bounds.minY + bounds.maxY) / 2) * k,
  };
  if (animated) drawGraph();
}

function searchMatches() {
  const query = state.search.trim().toLowerCase();
  if (!query) return new Set();
  const ids = new Set();
  graphView.nodes.forEach((node) => {
    const haystack = [node.label, node.type, node.summary, node.id].join(" ").toLowerCase();
    if (haystack.includes(query)) ids.add(node.id);
  });
  graphView.edges.forEach((edge) => {
    if (ids.has(edge.source_id) || ids.has(edge.target_id)) {
      ids.add(edge.source_id);
      ids.add(edge.target_id);
    }
  });
  return ids;
}

function hitTest(screenX, screenY) {
  const point = toGraphPoint(screenX, screenY);
  for (let i = graphView.nodes.length - 1; i >= 0; i -= 1) {
    const node = graphView.nodes[i];
    const distance = Math.hypot(point.x - node.x, point.y - node.y);
    if (distance <= node.radius + 5) return node;
  }
  return null;
}

function toGraphPoint(x, y) {
  return {
    x: (x - graphView.transform.x) / graphView.transform.k,
    y: (y - graphView.transform.y) / graphView.transform.k,
  };
}

function pointerPosition(event) {
  const rect = $("graph").getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function edgeDistance(edge) {
  if (edge.edge_type === "PARENT_OF") return 82;
  if (edge.edge_type === "HAS_SECTION") return 62;
  if (edge.edge_type === "LINKS_TO") return 118;
  if (edge.edge_type === "HAS_RISK") return 92;
  if (edge.edge_type === "SUGGESTS_IDEA") return 98;
  if (edge.edge_type === "HAS_METRIC") return 88;
  if (edge.edge_type === "USES_DATA") return 88;
  return 76;
}

function typeBand(node) {
  const mapping = {
    Page: 0,
    Folder: 1,
    Database: 2,
    Whiteboard: 3,
    Embed: 4,
    Concept: 2,
  };
  return mapping[node.type] ?? 2;
}

function radiusForNode(node, degree) {
  const base = {
    Page: 11,
    Folder: 12,
    Database: 12,
    Whiteboard: 10,
    Embed: 9,
    Concept: node.kind === "Section" ? 7 : 5,
  }[node.type] || 8;
  return Math.min(24, base + Math.sqrt(degree || 0) * 1.5);
}

function colorForNode(node) {
  if (node.type === "Page") return "#eaf2ff";
  if (node.type === "Folder") return "#fff1d6";
  if (node.type === "Database") return "#ece8ff";
  if (node.type === "Whiteboard") return "#eaf7f1";
  if (node.type === "Embed") return "#f3f5f8";
  if (node.kind === "Risk") return "#ffeceb";
  if (node.kind === "Metric") return "#eef7e8";
  if (node.kind === "DataAsset") return "#e6f4ff";
  if (node.kind === "Process") return "#fff1d6";
  if (node.kind === "TrainingModule") return "#edf0ff";
  if (node.kind === "System") return "#e8f3ef";
  if (node.kind === "WorkIdea") return "#fff4e8";
  if (node.kind === "Section") return "#e6f4ff";
  return "#e8f3ef";
}

function strokeForNode(node) {
  if (node.type === "Page") return "#1868db";
  if (node.type === "Folder") return "#b38600";
  if (node.type === "Database") return "#6b4eff";
  if (node.type === "Whiteboard") return "#2f8f68";
  if (node.type === "Embed") return "#697386";
  if (node.kind === "Risk") return "#c9372c";
  if (node.kind === "Metric") return "#4c7d25";
  if (node.kind === "DataAsset") return "#227d9b";
  if (node.kind === "Process") return "#b38600";
  if (node.kind === "TrainingModule") return "#5664d2";
  if (node.kind === "System") return "#2f8f68";
  if (node.kind === "WorkIdea") return "#c86f1d";
  if (node.kind === "Section") return "#227d9b";
  return "#2f8f68";
}

function colorForEdge(type, alpha) {
  const palette = {
    PARENT_OF: `rgba(24, 104, 219, ${alpha})`,
    HAS_SECTION: `rgba(34, 125, 155, ${alpha})`,
    HAS_RISK: `rgba(201, 55, 44, ${alpha})`,
    HAS_METRIC: `rgba(76, 125, 37, ${alpha})`,
    USES_DATA: `rgba(34, 125, 155, ${alpha})`,
    SUPPORTED_BY_SYSTEM: `rgba(47, 143, 104, ${alpha})`,
    SUGGESTS_IDEA: `rgba(200, 111, 29, ${alpha})`,
    REQUIRES_APPROVAL: `rgba(201, 55, 44, ${alpha})`,
    MENTIONS: `rgba(47, 143, 104, ${alpha})`,
    LINKS_TO: `rgba(179, 134, 0, ${alpha})`,
  };
  return palette[type] || `rgba(105, 115, 134, ${alpha})`;
}

function shouldDrawLabel(node, selected, hovered, matched) {
  if (!matched) return false;
  if (selected || hovered) return true;
  if (node.type !== "Concept") return true;
  return graphView.transform.k > 0.85 && (node.degree || 0) > 1;
}

function labelFont(node) {
  if (node.type === "Concept") return "11px Arial";
  return "12px Arial";
}

function seededPoint(value, index) {
  let seed = index + 17;
  for (let i = 0; i < value.length; i += 1) seed = (seed * 31 + value.charCodeAt(i)) % 9973;
  return {
    x: ((seed * 37) % 1000) / 1000,
    y: ((seed * 61) % 1000) / 1000,
  };
}

function displayType(value) {
  const mapping = {
    page: "Page",
    folder: "Folder",
    database: "Database",
    whiteboard: "Whiteboard",
    embed: "Embed",
  };
  return mapping[String(value || "").toLowerCase()] || String(value || "Content");
}

function trimLabel(value, max) {
  const text = String(value || "");
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

$("edgeFilter").addEventListener("change", (event) => {
  state.edgeFilter = event.target.value;
  initGraphData(true);
  render();
});

$("graphMode").addEventListener("change", async (event) => {
  state.graphMode = event.target.value;
  if (state.graphMode === "overview") {
    $("edgeFilter").value = "all";
    state.edgeFilter = "all";
  }
  await reloadGraph();
});

$("densityRange").addEventListener("input", (event) => {
  state.density = Number(event.target.value);
  initGraphData(true);
  render();
});

$("searchInput").addEventListener("input", (event) => {
  state.search = event.target.value;
  drawGraph();
});

$("userSearchForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = $("userSearchInput").value.trim();
  await runUserSearch(query);
});

$("suggestedQueries").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-query]");
  if (!button) return;
  const query = button.dataset.query || "";
  $("userSearchInput").value = query;
  await runUserSearch(query);
});

$("employeeGuide").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-query]");
  if (!button) return;
  const query = button.dataset.query || "";
  $("userSearchInput").value = query;
  await runUserSearch(query);
  $("userSearchInput").scrollIntoView({ behavior: "smooth", block: "center" });
});

$("fitBtn").addEventListener("click", () => fitGraph(true));

$("reheatBtn").addEventListener("click", () => {
  graphView.alpha = 1;
  startSimulation();
});

$("sampleBtn").addEventListener("click", async () => {
  const button = $("sampleBtn");
  button.disabled = true;
  try {
    const result = await api("/api/sample", { method: "POST" });
    showToast(result.message);
    await loadAll();
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
});

$("syncBtn").addEventListener("click", async () => {
  const button = $("syncBtn");
  if (button.disabled) return;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = "업데이트 중";
  try {
    const result = await api("/api/sync", { method: "POST" });
    showToast(result.message);
    await loadAll();
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
});

$("graph").addEventListener("wheel", (event) => {
  event.preventDefault();
  const pointer = pointerPosition(event);
  const before = toGraphPoint(pointer.x, pointer.y);
  const scale = event.deltaY < 0 ? 1.12 : 0.9;
  graphView.transform.k = Math.max(0.18, Math.min(4.5, graphView.transform.k * scale));
  graphView.transform.x = pointer.x - before.x * graphView.transform.k;
  graphView.transform.y = pointer.y - before.y * graphView.transform.k;
  drawGraph();
});

$("graph").addEventListener("mousedown", (event) => {
  const pointer = pointerPosition(event);
  const node = hitTest(pointer.x, pointer.y);
  graphView.lastPointer = pointer;
  if (node) {
    graphView.draggingNode = node;
    node.locked = true;
    graphView.selected = node;
    renderNodeDetail(node);
  } else {
    graphView.panning = true;
  }
});

window.addEventListener("mousemove", (event) => {
  const pointer = pointerPosition(event);
  if (graphView.draggingNode) {
    const point = toGraphPoint(pointer.x, pointer.y);
    graphView.draggingNode.x = point.x;
    graphView.draggingNode.y = point.y;
    graphView.alpha = Math.max(graphView.alpha, 0.22);
    drawGraph();
    return;
  }
  if (graphView.panning) {
    graphView.transform.x += pointer.x - graphView.lastPointer.x;
    graphView.transform.y += pointer.y - graphView.lastPointer.y;
    graphView.lastPointer = pointer;
    drawGraph();
    return;
  }
  const hovered = hitTest(pointer.x, pointer.y);
  if (hovered !== graphView.hovered) {
    graphView.hovered = hovered;
    drawGraph();
  }
});

window.addEventListener("mouseup", () => {
  if (graphView.draggingNode) {
    graphView.draggingNode.locked = false;
    graphView.draggingNode = null;
    startSimulation();
  }
  graphView.panning = false;
});

$("graph").addEventListener("dblclick", (event) => {
  const pointer = pointerPosition(event);
  const node = hitTest(pointer.x, pointer.y);
  if (node?.url) window.open(node.url, "_blank", "noopener,noreferrer");
});

window.addEventListener("resize", () => {
  drawGraph();
});

loadAll()
  .catch((error) => showToast(error.message));
