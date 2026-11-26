// Summary cards and the campaign panel.
// Everything here is calculated from the campaign data in data.js.

let selectedCampaignId = null;
let panelCampaigns = [];

const byId = id => document.getElementById(id);

// Creates an element; text is always inserted as plain text.
function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

const formatMoney = number => "₹" + formatNumber(number);
const divide = (top, bottom) => bottom ? top / bottom : null;
const formatPercent = value => value === null ? "—" : (value * 100).toFixed(2) + "%";
const formatRupees = value => value === null ? "—" : "₹" + value.toFixed(2);
const formatTimes = value => value === null ? "—" : value.toFixed(2) + "x";
const total = (list, key) => list.reduce((sum, campaign) => sum + campaign[key], 0);
const byDate = list => [...list].sort((a, b) => a.date.localeCompare(b.date));

function formatDate(date) {
    return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function selectValue(id, value) {
    const select = byId(id);

    select.value = value;
    select.dispatchEvent(new Event("change"));
}


/* ---------- Spend card: one bar per campaign ---------- */

function renderSpendBars(list) {
    const highest = Math.max(...list.map(campaign => campaign.spend), 0);

    byId("spend-note").textContent =
        list.length + (list.length === 1 ? " campaign" : " campaigns");

    byId("spend-bars").replaceChildren(...byDate(list).map(campaign => {
        const bar = createElement("span", "mini-bar");

        bar.style.height = (divide(campaign.spend, highest) * 100) + "%";
        bar.title = campaign.name + ": " + formatMoney(campaign.spend);

        return bar;
    }));
}


/* ---------- Revenue card: line across campaigns by date ---------- */

function renderRevenue(list) {
    const revenue = total(list, "revenue");
    const profit = revenue - total(list, "spend");
    const chart = byId("revenue-line");
    const svg = "http://www.w3.org/2000/svg";

    byId("total-revenue").textContent = formatMoney(revenue);
    byId("revenue-note").textContent = formatMoney(profit) + " after ad spend";

    chart.replaceChildren();

    if (list.length === 0) return;

    const ordered = byDate(list);
    const highest = Math.max(...ordered.map(campaign => campaign.revenue));

    const points = ordered.map((campaign, index) => {
        const x = ordered.length === 1 ? 100 : 6 + (index * 188) / (ordered.length - 1);
        const y = 62 - (divide(campaign.revenue, highest) || 0) * 52;

        return { x, y, campaign };
    });

    const line = points.map(point => point.x + "," + point.y).join(" ");

    const area = document.createElementNS(svg, "polygon");
    area.setAttribute("class", "line-area");
    area.setAttribute("points", `${points[0].x},68 ${line} ${points[points.length - 1].x},68`);

    const path = document.createElementNS(svg, "polyline");
    path.setAttribute("class", "line-path");
    path.setAttribute("points", line);

    chart.append(area, path);

    points.forEach(point => {
        const dot = document.createElementNS(svg, "circle");
        const title = document.createElementNS(svg, "title");

        dot.setAttribute("class", "line-dot");
        dot.setAttribute("cx", point.x);
        dot.setAttribute("cy", point.y);
        dot.setAttribute("r", 3.5);

        title.textContent =
            point.campaign.name + ": " + formatMoney(point.campaign.revenue);

        dot.append(title);
        chart.append(dot);
    });
}


/* ---------- Funnel card ---------- */

function renderFunnel(list) {
    const impressions = total(list, "impressions");
    const clicks = total(list, "clicks");
    const conversions = total(list, "conversions");

    // Bar widths use a square-root scale so the small steps stay visible
    const width = value => (Math.sqrt(divide(value, impressions) || 0) * 100) + "%";

    byId("impressions-bar").style.width = width(impressions);
    byId("clicks-bar").style.width = width(clicks);
    byId("conversions-bar").style.width = width(conversions);
}


/* ---------- Highlight cards ---------- */

function renderHighlights(list) {
    const best = (score, isBetter) => list
        .filter(campaign => score(campaign) !== null)
        .reduce((winner, campaign) =>
            !winner || isBetter(score(campaign), score(winner)) ? campaign : winner, null);

    const show = (id, campaign, describe) => {
        byId(id + "-name").textContent = campaign ? campaign.name : "—";
        byId(id + "-value").textContent = campaign ? describe(campaign) : "No matching campaigns";
    };

    const roas = campaign => divide(campaign.revenue, campaign.spend);
    const rate = campaign => divide(campaign.conversions, campaign.clicks);
    const cpc = campaign => divide(campaign.spend, campaign.clicks);

    show("best-roas", best(roas, (a, b) => a > b),
        campaign => formatTimes(roas(campaign)) + " return on ad spend");

    show("best-rate", best(rate, (a, b) => a > b),
        campaign => formatPercent(rate(campaign)) + " of clicks converted");

    show("lowest-cpc", best(cpc, (a, b) => a < b),
        campaign => formatRupees(cpc(campaign)) + " per click");
}


/* ---------- Platform tiles (also a platform filter) ---------- */

function setupPlatformTiles() {
    const platforms = [...new Set(campaigns.map(campaign => campaign.platform))];

    byId("platform-tiles").replaceChildren(...platforms.map(platform => {
        const tile = createElement("button", "platform-tile");
        const spend = total(campaigns.filter(c => c.platform === platform), "spend");

        tile.type = "button";
        tile.dataset.platform = platform;
        tile.append(
            createElement("span", "platform-name", platform),
            createElement("strong", "", formatMoney(spend))
        );

        return tile;
    }));
}

function renderPlatformTiles() {
    const selected = byId("platform-filter").value;

    if (!byId("platform-tiles").children.length) setupPlatformTiles();

    byId("platform-tiles").querySelectorAll("button").forEach(tile => {
        tile.setAttribute("aria-pressed", String(tile.dataset.platform === selected));
    });
}


/* ---------- Status tabs and filter count ---------- */

function renderStatusTabs(list) {
    const selected = byId("status-filter").value;

    document.querySelectorAll("[data-status]").forEach(tab => {
        const status = tab.dataset.status;
        const count = status === "All"
            ? list.length
            : list.filter(campaign => campaign.status === status).length;

        tab.querySelector("span").textContent = count;
        tab.setAttribute("aria-pressed", String(status === selected));
    });
}

function renderFilterCount() {
    const selects = ["platform-filter", "status-filter", "date-filter"];
    const active = selects.filter(id => byId(id).value !== "All").length +
        (byId("campaign-search").value.trim() ? 1 : 0);

    byId("filter-count").textContent = active;
    byId("reset-filters").disabled = active === 0;
}


/* ---------- Campaign list and details ---------- */

function statusBadge(status) {
    const badge = createElement("span", "status-badge " + status.toLowerCase());

    badge.append(createElement("span", "status-dot"), status);

    return badge;
}

function renderCampaignList() {
    const list = byId("campaign-list");

    if (panelCampaigns.length === 0) {
        list.replaceChildren(createElement("p", "list-empty", "No campaigns found"));
        return;
    }

    list.replaceChildren(...panelCampaigns.map(campaign => {
        const item = createElement("button", "campaign-item");
        const name = createElement("span", "item-name");

        item.type = "button";
        item.dataset.id = campaign.id;
        item.setAttribute("aria-pressed", String(campaign.id === selectedCampaignId));

        name.append(
            createElement("strong", "", campaign.name),
            createElement("small", "", formatDate(campaign.date))
        );

        item.append(
            createElement("span", "item-avatar", campaign.platform.charAt(0)),
            name,
            statusBadge(campaign.status),
            createElement("span", "item-spend", formatMoney(campaign.spend))
        );

        return item;
    }));
}

function detailTile(label, value) {
    const tile = createElement("div", "detail-tile");

    tile.append(createElement("strong", "", value), createElement("span", "", label));

    return tile;
}

function renderCampaignDetails() {
    const details = byId("campaign-details");
    const campaign = panelCampaigns.find(c => c.id === selectedCampaignId);

    if (!campaign) {
        details.replaceChildren(
            createElement("p", "list-empty", "Try adjusting your filters.")
        );
        return;
    }

    const heading = createElement("div", "detail-heading");
    const title = createElement("div");

    title.append(
        createElement("span", "detail-label", "Campaign details"),
        createElement("h3", "", campaign.name)
    );

    heading.append(title, statusBadge(campaign.status));

    const facts = createElement("p", "detail-facts",
        campaign.platform + " · " + formatDate(campaign.date));

    const tiles = createElement("div", "detail-tiles");

    tiles.append(
        detailTile("Ad spend", formatMoney(campaign.spend)),
        detailTile("Revenue", formatMoney(campaign.revenue)),
        detailTile("Revenue after ad spend", formatMoney(campaign.revenue - campaign.spend))
    );

    const metrics = createElement("dl", "detail-metrics");

    [
        ["CTR", formatPercent(divide(campaign.clicks, campaign.impressions))],
        ["Conversion rate", formatPercent(divide(campaign.conversions, campaign.clicks))],
        ["CPC", formatRupees(divide(campaign.spend, campaign.clicks))],
        ["Cost per conversion", formatRupees(divide(campaign.spend, campaign.conversions))],
        ["ROAS", formatTimes(divide(campaign.revenue, campaign.spend))]
    ].forEach(([label, value]) => {
        const metric = createElement("div");

        metric.append(createElement("dt", "", label), createElement("dd", "", value));
        metrics.append(metric);
    });

    details.replaceChildren(heading, facts, tiles, metrics);
}

function renderCampaignPanel(list) {
    panelCampaigns = list;

    if (!list.some(campaign => campaign.id === selectedCampaignId)) {
        selectedCampaignId = list.length ? list[0].id : null;
    }

    renderCampaignList();
    renderCampaignDetails();
}


/* ---------- Called by app.js after every change ---------- */

function renderCards(visible, anyStatus) {
    renderSpendBars(visible);
    renderRevenue(visible);
    renderFunnel(visible);
    renderHighlights(visible);
    renderPlatformTiles();
    renderStatusTabs(anyStatus);
    renderFilterCount();
    renderCampaignPanel(visible);
}


/* ---------- Events ---------- */

byId("platform-tiles").addEventListener("click", event => {
    const tile = event.target.closest("[data-platform]");

    if (!tile) return;

    // Clicking the selected platform again shows all platforms
    const platform = tile.dataset.platform;
    const current = byId("platform-filter").value;

    selectValue("platform-filter", current === platform ? "All" : platform);
});

document.querySelectorAll("[data-status]").forEach(tab => {
    tab.addEventListener("click", () => selectValue("status-filter", tab.dataset.status));
});

byId("campaign-list").addEventListener("click", event => {
    const item = event.target.closest("[data-id]");

    if (!item) return;

    selectedCampaignId = Number(item.dataset.id);
    renderCampaignList();
    renderCampaignDetails();

    byId("campaign-list").querySelector(`[data-id="${selectedCampaignId}"]`).focus();
});

byId("reset-filters").addEventListener("click", () => {
    const search = byId("campaign-search");

    search.value = "";
    search.dispatchEvent(new Event("input"));

    ["platform-filter", "status-filter", "date-filter"].forEach(id => selectValue(id, "All"));
});

document.querySelectorAll(".section-link").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".section-link").forEach(other => {
            other.classList.toggle("active", other === link);
        });
    });
});
