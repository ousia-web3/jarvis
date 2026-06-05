const DATA_URL = "../../data/market_dashboard/latest.json";

const state = {
  snapshot: null,
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

document.getElementById("reloadButton").addEventListener("click", () => {
  loadDashboard();
});

setInterval(updateClock, 1000);
updateClock();
loadDashboard();

async function loadDashboard() {
  setText("tableStatus", "로딩");
  try {
    const response = await fetch(`${DATA_URL}?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    state.snapshot = await response.json();
    renderDashboard(state.snapshot);
  } catch (error) {
    renderLoadError(error);
  }
}

function renderDashboard(snapshot) {
  const pulse = snapshot.market_pulse || {};
  const categories = snapshot.categories || [];
  const items = categories.flatMap((category) => category.items || []);
  const primary = findItem(items, "AAPL") || items.find((item) => typeof item.price === "number");

  setText("generatedAt", formatGeneratedAt(snapshot.generated_at));
  setText("coverageRatio", `${pulse.available_count || 0}/${pulse.total_count || 0}`);
  setText("delayedCount", pulse.delayed_count || 0);
  setText("apiCount", pulse.api_required_count || 0);
  setText("missingCount", pulse.missing_count || 0);
  setText("regimeLabel", marketRegime(pulse));
  setText("tableStatus", "완료");
  setText("alertCount", (pulse.api_required_count || 0) + (pulse.missing_count || 0));

  if (primary) {
    setText("primaryTitle", `${primary.symbol} ${primary.market} Equity`);
    setText("primaryPrice", `${formatPrice(primary)} ${primary.unit || ""}`.trim());
    setText("orderSymbol", `${primary.symbol} ${primary.market} Equity`);
    setText("orderLast", formatPrice(primary));
  }

  renderTickerStrip(items);
  renderMomentum(categories);
  renderVolSurface();
  renderCapitalFlows(items);
  renderPrimaryLegend(primary);
  renderCorrelationMatrix(items);
  renderScenarioBars(categories);
  renderNewsTape(snapshot, items);
  renderAiNewsSummary(snapshot, items, primary);
  renderRows(items);
  renderOptionsFlow(items);
  renderAssistantSummary(snapshot, items, primary);
  renderApiList(snapshot.api_key_requirements || []);
  drawGauge("pulseGauge", pulse.available_count || 0, pulse.total_count || 0);
  drawMainChart("mainChart", primary);
  drawRiskDonut("riskDonut");
}

function renderTickerStrip(items) {
  const host = document.getElementById("tickerStrip");
  host.replaceChildren();
  for (const item of items.slice(0, 12)) {
    const card = document.createElement("article");
    card.className = "ticker-card";
    card.innerHTML = `
      <strong>${escapeHtml(item.symbol)}</strong>
      <span class="ticker-price">${formatPrice(item)}</span>
      <span class="ticker-change ${changeClass(item.change)}">${formatCompactChange(item)}</span>
    `;
    host.append(card);
  }
}

function renderMomentum(categories) {
  const host = document.getElementById("momentumList");
  host.replaceChildren();
  const rows = categories.map((category) => {
    const values = (category.items || [])
      .map((item) => item.change_pct)
      .filter((value) => typeof value === "number");
    return {
      label: category.label,
      value: values.length ? average(values) : null,
    };
  });
  const maxAbs = Math.max(...rows.map((row) => Math.abs(row.value || 0)), 0.1);
  for (const row of rows) {
    host.append(createBarRow(row.label, row.value, maxAbs));
  }
}

function renderVolSurface() {
  const host = document.getElementById("volSurface");
  host.replaceChildren();
  const labels = ["1W", "2W", "1M", "3M", "ATM", "25D C", "25D P", "Skew", "Term", "VIX", "IV", "RV"];
  for (const label of labels) {
    const cell = document.createElement("div");
    cell.className = "surface-cell";
    cell.textContent = `${label}\nAPI 필요`;
    host.append(cell);
  }
}

function renderCapitalFlows(items) {
  const host = document.getElementById("capitalFlows");
  host.replaceChildren();
  const flows = items
    .filter((item) => item.category === "etfs" || item.category === "fx" || item.category === "commodities")
    .slice(0, 6)
    .map((item) => ({ label: item.symbol, value: item.change_pct }));
  const maxAbs = Math.max(...flows.map((row) => Math.abs(row.value || 0)), 0.1);
  for (const row of flows) {
    host.append(createBarRow(row.label, row.value, maxAbs));
  }
}

function renderPrimaryLegend(primary) {
  const host = document.getElementById("primaryLegend");
  host.replaceChildren();
  const rows = primary
    ? [
        `${primary.symbol} - Last Price ${formatPrice(primary)}`,
        `Open ${formatNullable(primary.open)}`,
        `High ${formatNullable(primary.high)}`,
        `Low ${formatNullable(primary.low)}`,
        `Volume ${formatVolume(primary.volume)}`,
        primary.source_timestamp || "시각 데이터 없음",
      ]
    : ["데이터 없음"];
  for (const row of rows) {
    const span = document.createElement("span");
    span.textContent = row;
    host.append(span);
  }
}

function renderCorrelationMatrix(items) {
  const host = document.getElementById("correlationMatrix");
  host.replaceChildren();
  const headers = ["", "SPX", "NDX", "US10Y", "GOLD", "WTI"];
  for (const header of headers) {
    host.append(matrixCell(header, "matrix-head"));
  }
  const rows = ["SPX", "NDX", "US10Y", "GOLD", "WTI"];
  for (const row of rows) {
    host.append(matrixCell(row, "matrix-head"));
    for (const col of rows) {
      if (row === col && hasPrice(items, row)) {
        host.append(matrixCell("1.00", "matrix-good"));
      } else {
        host.append(matrixCell("API 필요", "matrix-need"));
      }
    }
  }
}

function renderScenarioBars(categories) {
  const host = document.getElementById("scenarioBars");
  host.replaceChildren();
  const rows = categories.map((category) => {
    const values = (category.items || [])
      .map((item) => item.change_pct)
      .filter((value) => typeof value === "number");
    return {
      label: category.label,
      value: values.length ? average(values) : null,
    };
  });
  const maxAbs = Math.max(...rows.map((row) => Math.abs(row.value || 0)), 0.1);
  for (const row of rows) {
    const wrap = document.createElement("div");
    wrap.className = "scenario-row";
    const width = row.value === null ? 100 : Math.max(4, Math.abs(row.value) / maxAbs * 100);
    const side = row.value === null ? "neutral" : row.value >= 0 ? "positive" : "negative";
    wrap.innerHTML = `
      <span>${escapeHtml(row.label)}</span>
      <div class="scenario-track"><div class="scenario-fill ${side}" style="width:${width}%"></div></div>
      <strong class="${side}">${formatPct(row.value)}</strong>
    `;
    host.append(wrap);
  }
}

function renderRows(items) {
  const body = document.getElementById("assetRows");
  body.replaceChildren();
  for (const item of items) {
    const tr = document.createElement("tr");
    tr.className = `data-row data-row-${item.status_level}`;
    tr.innerHTML = `
      <td>
        <div class="symbol-cell">
          <strong>${escapeHtml(item.symbol)}</strong>
          <small>${escapeHtml(item.name)}</small>
        </div>
      </td>
      <td>${escapeHtml(item.category_label)}<br><small class="row-note">${escapeHtml(item.market)}</small></td>
      <td>${formatPrice(item)}<br><small class="row-note">${escapeHtml(item.unit || "")}</small></td>
      <td class="${changeClass(item.change)}">${formatChange(item)}</td>
      <td><span class="status-chip">${escapeHtml(item.status)}</span><br><small class="row-note">${escapeHtml(item.message || "")}</small></td>
      <td>${escapeHtml(item.source_timestamp || "데이터 없음")}<br><small class="row-note">${escapeHtml(item.source || "")}</small></td>
    `;
    body.append(tr);
  }
}

function renderOptionsFlow(items) {
  const host = document.getElementById("optionsFlow");
  host.replaceChildren();
  const header = document.createElement("div");
  header.className = "flow-row flow-head";
  header.innerHTML = "<span>TIME</span><span>UNDERLYING</span><span>SPOT</span><span>FLOW</span>";
  host.append(header);
  const symbols = ["AAPL", "NVDA", "SPY", "QQQ", "MSFT"];
  symbols.forEach((symbol, index) => {
    const item = findItem(items, symbol);
    const row = document.createElement("div");
    row.className = "flow-row";
    row.innerHTML = `
      <strong>${String(index + 1).padStart(2, "0")}:00</strong>
      <span>${escapeHtml(item?.name || "데이터 없음")}</span>
      <span>${formatPrice(item)}</span>
      <span class="status-chip">API 필요</span>
    `;
    host.append(row);
  });
}

function renderNewsTape(snapshot, items) {
  const host = document.getElementById("newsTape");
  host.replaceChildren();
  const pulse = snapshot.market_pulse || {};
  const movers = items
    .filter((item) => typeof item.change_pct === "number")
    .sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct));
  const top = movers[0];
  const rows = [
    {
      time: "07:00",
      source: "BATCH",
      headline: `${pulse.available_count || 0}/${pulse.total_count || 0} instruments loaded from actual delayed/public feeds`,
      tone: "positive",
    },
    {
      time: "API",
      source: "DATA",
      headline: `${pulse.api_required_count || 0} instruments intentionally marked API 필요 instead of synthetic values`,
      tone: "neutral",
    },
    {
      time: top?.source_timestamp || "N/A",
      source: top?.symbol || "MOVE",
      headline: top ? `Largest observed batch move: ${top.symbol} ${formatChange(top)}` : "데이터 없음",
      tone: top ? changeClass(top.change) : "neutral",
    },
    {
      time: "RISK",
      source: "KITT/TRON",
      headline: "Live broker order path remains blocked; dashboard is market information only",
      tone: "neutral",
    },
  ];
  for (const row of rows) {
    const div = document.createElement("div");
    div.className = "news-row";
    div.innerHTML = `
      <span>${escapeHtml(row.time)}</span>
      <strong class="${row.tone}">${escapeHtml(row.source)}</strong>
      <p>${escapeHtml(row.headline)}</p>
    `;
    host.append(div);
  }
}

function renderAiNewsSummary(snapshot, items, primary) {
  const host = document.getElementById("aiNewsSummary");
  host.replaceChildren();
  const pulse = snapshot.market_pulse || {};
  const groups = groupItemsByStatus(items);
  const rows = [
    {
      label: "Overall Impact",
      value: marketRegime(pulse),
      detail: "Coverage-driven regime only; not a trading signal.",
    },
    {
      label: "Affected Assets",
      value: `${groups.api_required.length} API 필요`,
      detail: groups.api_required.map((item) => item.symbol).slice(0, 5).join(", ") || "없음",
    },
    {
      label: "Primary Asset",
      value: primary ? primary.symbol : "데이터 없음",
      detail: primary ? `${formatPrice(primary)} · ${primary.status} · ${primary.source_timestamp || "시각 없음"}` : "데이터 없음",
    },
    {
      label: "Risk Shield",
      value: "PASS",
      detail: "No account data, no secrets, no live order execution.",
    },
  ];
  for (const row of rows) {
    const div = document.createElement("div");
    div.className = "summary-row";
    div.innerHTML = `
      <span>${escapeHtml(row.label)}</span>
      <strong>${escapeHtml(row.value)}</strong>
      <p>${escapeHtml(row.detail)}</p>
    `;
    host.append(div);
  }
}

function renderAssistantSummary(snapshot, items, primary) {
  const host = document.getElementById("assistantSummary");
  host.replaceChildren();
  const pulse = snapshot.market_pulse || {};
  const available = items.filter((item) => typeof item.price === "number");
  const top = available
    .filter((item) => typeof item.change_pct === "number")
    .sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct))[0];
  const cards = [
    {
      title: "Data Status",
      body: `${pulse.available_count || 0}/${pulse.total_count || 0} instruments have actual delayed values. Missing entries remain explicit.`,
      tag: "DATA",
    },
    {
      title: primary ? `${primary.symbol} Guard` : "Signal Guard",
      body: "Live orders are blocked. Dashboard data is read-only and not an investment recommendation.",
      tag: "GUARD",
    },
    {
      title: top ? `Largest Move: ${top.symbol}` : "Largest Move",
      body: top ? `${formatChange(top)} from the latest batch quote.` : "데이터 없음",
      tag: "MOVE",
    },
  ];
  for (const card of cards) {
    const div = document.createElement("div");
    div.className = "assistant-row";
    div.innerHTML = `<span>${escapeHtml(card.tag)}</span><strong>${escapeHtml(card.title)}</strong><p>${escapeHtml(card.body)}</p>`;
    host.append(div);
  }
}

function renderApiList(requirements) {
  const host = document.getElementById("apiList");
  host.replaceChildren();
  const header = document.createElement("div");
  header.className = "source-row source-head";
  header.innerHTML = "<span>PROVIDER</span><span>ENV</span><span>COVERAGE</span><span>DOCS</span>";
  host.append(header);
  for (const requirement of requirements) {
    const item = document.createElement("div");
    item.className = "source-row";
    item.innerHTML = `
      <strong>${escapeHtml(requirement.provider)}</strong>
      <span>${escapeHtml(requirement.env)}</span>
      <span>${escapeHtml(requirement.coverage)}</span>
      <a href="${escapeAttribute(requirement.docs)}" target="_blank" rel="noreferrer">문서</a>
    `;
    host.append(item);
  }
}

function drawGauge(canvasId, available, total) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const ratio = total > 0 ? available / total : 0;
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#20303a";
  ctx.beginPath();
  ctx.arc(width / 2, height - 10, 54, Math.PI, 0);
  ctx.stroke();
  const gradient = ctx.createLinearGradient(28, 0, width - 28, 0);
  gradient.addColorStop(0, "#ef4d61");
  gradient.addColorStop(0.48, "#f1b84a");
  gradient.addColorStop(1, "#21c875");
  ctx.strokeStyle = gradient;
  ctx.beginPath();
  ctx.arc(width / 2, height - 10, 54, Math.PI, Math.PI + Math.PI * ratio);
  ctx.stroke();
  ctx.fillStyle = "#e9f2ef";
  ctx.font = "800 22px Segoe UI, Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(ratio * 100)}%`, width / 2, height - 34);
  ctx.fillStyle = "#819099";
  ctx.font = "10px Segoe UI, Arial";
  ctx.fillText("coverage", width / 2, height - 15);
}

function drawMainChart(canvasId, item) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  const plot = { x: 44, y: 24, w: width - 92, h: height - 105 };
  drawGrid(ctx, plot);

  if (!item || typeof item.price !== "number" || typeof item.open !== "number" || typeof item.high !== "number" || typeof item.low !== "number") {
    drawCenteredText(ctx, width, height, "데이터 없음 / OHLC API 필요");
    return;
  }

  const padding = Math.max((item.high - item.low) * 0.3, item.price * 0.002);
  const min = item.low - padding;
  const max = item.high + padding;
  const y = (value) => plot.y + (max - value) / (max - min || 1) * plot.h;
  const candleX = plot.x + plot.w * 0.48;
  const openY = y(item.open);
  const closeY = y(item.price);
  const highY = y(item.high);
  const lowY = y(item.low);
  const up = item.price >= item.open;

  ctx.strokeStyle = up ? "#21c875" : "#ef4d61";
  ctx.fillStyle = up ? "rgba(33, 200, 117, 0.82)" : "rgba(239, 77, 97, 0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(candleX, highY);
  ctx.lineTo(candleX, lowY);
  ctx.stroke();
  ctx.fillRect(candleX - 26, Math.min(openY, closeY), 52, Math.max(5, Math.abs(closeY - openY)));

  const lines = [
    ["High", item.high, "#21c875"],
    ["Open", item.open, "#d89a3a"],
    ["Last", item.price, up ? "#21c875" : "#ef4d61"],
    ["Low", item.low, "#ef4d61"],
  ];
  for (const [label, value, color] of lines) {
    const yy = y(value);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.74;
    ctx.beginPath();
    ctx.moveTo(plot.x, yy);
    ctx.lineTo(plot.x + plot.w, yy);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.font = "11px Segoe UI, Arial";
    ctx.fillText(`${label} ${formatNumber(value)}`, plot.x + plot.w + 8, yy + 4);
  }

  drawVolumePane(ctx, plot, item);
  ctx.fillStyle = "#819099";
  ctx.font = "12px Segoe UI, Arial";
  ctx.fillText("Historical intraday candles: API 필요", plot.x + 8, plot.y + 18);
  ctx.fillText(item.source_timestamp || "source timestamp 없음", plot.x + 8, height - 18);
}

function drawVolumePane(ctx, plot, item) {
  const y = plot.y + plot.h + 24;
  const h = 46;
  ctx.strokeStyle = "#162229";
  ctx.strokeRect(plot.x, y, plot.w, h);
  ctx.fillStyle = item.change >= 0 ? "rgba(33, 200, 117, 0.42)" : "rgba(239, 77, 97, 0.42)";
  const barW = Math.min(plot.w * 0.34, Math.max(32, plot.w * 0.08));
  ctx.fillRect(plot.x + plot.w * 0.48 - barW / 2, y + 8, barW, h - 16);
  ctx.fillStyle = "#819099";
  ctx.font = "10px Segoe UI, Arial";
  ctx.fillText(`Volume ${formatVolume(item.volume)}`, plot.x + 8, y + h - 12);
}

function drawRiskDonut(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 18;
  ctx.strokeStyle = "#20303a";
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 48, 0, Math.PI * 2);
  ctx.stroke();
  const colors = ["#21c875", "#3f8cff", "#f1b84a", "#ef4d61"];
  colors.forEach((color, index) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 48, index * Math.PI * 0.42, index * Math.PI * 0.42 + Math.PI * 0.32);
    ctx.stroke();
  });
  ctx.fillStyle = "#819099";
  ctx.font = "11px Segoe UI, Arial";
  ctx.textAlign = "center";
  ctx.fillText("API 필요", width / 2, height / 2 + 4);
}

function drawGrid(ctx, plot) {
  ctx.fillStyle = "#070b0e";
  ctx.fillRect(plot.x, plot.y, plot.w, plot.h);
  ctx.strokeStyle = "#162229";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    const y = plot.y + (plot.h / 5) * i;
    ctx.beginPath();
    ctx.moveTo(plot.x, y);
    ctx.lineTo(plot.x + plot.w, y);
    ctx.stroke();
  }
  for (let i = 0; i <= 8; i += 1) {
    const x = plot.x + (plot.w / 8) * i;
    ctx.beginPath();
    ctx.moveTo(x, plot.y);
    ctx.lineTo(x, plot.y + plot.h);
    ctx.stroke();
  }
}

function drawCenteredText(ctx, width, height, text) {
  ctx.fillStyle = "#819099";
  ctx.font = "15px Segoe UI, Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, width / 2, height / 2);
}

function createBarRow(label, value, maxAbs) {
  const row = document.createElement("div");
  row.className = "bar-row";
  const width = value === null ? 100 : Math.max(4, Math.abs(value) / maxAbs * 100);
  const side = value === null ? "neutral" : value >= 0 ? "positive" : "negative";
  row.innerHTML = `
    <span>${escapeHtml(label)}</span>
    <div class="bar-track"><div class="bar-fill ${side}" style="width:${width}%"></div></div>
    <strong class="bar-value ${side}">${formatPct(value)}</strong>
  `;
  return row;
}

function matrixCell(text, className) {
  const div = document.createElement("div");
  div.className = `matrix-cell ${className}`;
  div.textContent = text;
  return div;
}

function renderLoadError(error) {
  setText("generatedAt", "데이터 없음");
  setText("tableStatus", "실패");
  document.getElementById("tickerStrip").innerHTML = `<div class="empty-state">latest.json 없음 또는 읽기 실패: ${escapeHtml(error.message)}</div>`;
  document.getElementById("assetRows").replaceChildren();
  drawGauge("pulseGauge", 0, 0);
  drawMainChart("mainChart", null);
  drawRiskDonut("riskDonut");
}

function updateClock() {
  const text = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
  setText("terminalClock", `SEOUL ${text}`);
}

function marketRegime(pulse) {
  const total = pulse.total_count || 0;
  const available = pulse.available_count || 0;
  if (!total) {
    return "DATA OFFLINE";
  }
  const ratio = available / total;
  if (ratio >= 0.7) {
    return "RISK-ON";
  }
  if (ratio >= 0.45) {
    return "MIXED";
  }
  return "API REQUIRED";
}

function findItem(items, symbol) {
  return items.find((item) => item.symbol === symbol);
}

function hasPrice(items, symbol) {
  const item = findItem(items, symbol);
  return item && typeof item.price === "number";
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function groupItemsByStatus(items) {
  return items.reduce(
    (groups, item) => {
      const key = item.status_level || "missing";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    { delayed: [], api_required: [], missing: [] }
  );
}

function formatGeneratedAt(value) {
  if (!value) {
    return "데이터 없음";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function formatPrice(item) {
  if (!item || typeof item.price !== "number") {
    return item?.status || "데이터 없음";
  }
  return formatNumber(item.price);
}

function formatNullable(value) {
  return typeof value === "number" ? formatNumber(value) : "데이터 없음";
}

function formatNumber(value) {
  return moneyFormatter.format(value);
}

function formatVolume(value) {
  if (typeof value !== "number") {
    return "데이터 없음";
  }
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatChange(item) {
  if (!item || typeof item.change !== "number" || typeof item.change_pct !== "number") {
    return "데이터 없음";
  }
  const sign = item.change > 0 ? "+" : "";
  return `${sign}${formatNumber(item.change)} (${sign}${item.change_pct.toFixed(2)}%)`;
}

function formatCompactChange(item) {
  if (!item || typeof item.change !== "number" || typeof item.change_pct !== "number") {
    return item?.status || "데이터 없음";
  }
  const sign = item.change > 0 ? "+" : "";
  return `${sign}${item.change_pct.toFixed(2)}%`;
}

function formatPct(value) {
  if (typeof value !== "number") {
    return "API 필요";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function changeClass(value) {
  if (typeof value !== "number" || value === 0) {
    return "neutral";
  }
  return value > 0 ? "positive" : "negative";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
