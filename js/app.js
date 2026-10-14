let filteredCampaigns = campaigns;
let campaignChart;
let platformChart;
let searchTerm = "";

// Sorting functionality
let sortColumn = null;
let sortDirection = "asc";

// Status filter
let selectedStatus = "All";
let selectedDateRange = "All";

function updateDashboard() {

let visibleCampaigns = filteredCampaigns;

if (selectedStatus !== "All") {
    visibleCampaigns = visibleCampaigns.filter(campaign => {
        return campaign.status === selectedStatus;
    });
}

if (selectedDateRange !== "All") {
    const days = Number(selectedDateRange);

    const today = new Date("2026-10-12");
    const startDate = new Date(today);

    startDate.setDate(today.getDate() - days);

    visibleCampaigns = visibleCampaigns.filter(campaign => {
        const campaignDate = new Date(campaign.date);

        return campaignDate >= startDate && campaignDate <= today;
    });
}

if (searchTerm) {
    visibleCampaigns = visibleCampaigns.filter(campaign => {
        return (
            campaign.name.toLowerCase().includes(searchTerm) ||
            campaign.platform.toLowerCase().includes(searchTerm)
        );
    });
}

visibleCampaigns = sortCampaigns(visibleCampaigns);;

const platformData = {};

visibleCampaigns.forEach(campaign => {
    if (!platformData[campaign.platform]) {
        platformData[campaign.platform] = {
            spend: 0,
            conversions: 0,
            revenue: 0
        };
    }

    platformData[campaign.platform].spend += campaign.spend;
    platformData[campaign.platform].conversions += campaign.conversions;
    platformData[campaign.platform].revenue += campaign.revenue;
});

    // 1.Calculate totals
const totalSpend = visibleCampaigns.reduce((total, campaign) => {
    return total + campaign.spend;
}, 0);

const totalImpressions = visibleCampaigns.reduce((total, campaign) => {
    return total + campaign.impressions;
}, 0);

const totalClicks = visibleCampaigns.reduce((total, campaign) => {
    return total + campaign.clicks;
}, 0);

const totalConversions = visibleCampaigns.reduce((total, campaign) => {
    return total + campaign.conversions;
}, 0);

const totalRevenue = visibleCampaigns.reduce((total, campaign) => {
    return total + campaign.revenue;
}, 0);

    // 2.Calculate performance metrics
const ctr = ((totalClicks / totalImpressions) * 100).toFixed(2);
const conversionRate =((totalConversions / totalClicks) * 100).toFixed(2);
const cpc = (totalSpend / totalClicks).toFixed(2);
const roas = (totalRevenue / totalSpend).toFixed(2);

// 3.Update the dashboard with calculated values
document.getElementById("total-spend").textContent =
    "₹" + formatNumber(totalSpend);

document.getElementById("total-impressions").textContent =
    formatCompactNumber(totalImpressions);

document.getElementById("total-clicks").textContent =
    formatNumber(totalClicks);

document.getElementById("total-conversions").textContent =
    formatNumber(totalConversions);

    document.getElementById("total-conversions").textContent =
    formatNumber(totalConversions);
 
// 4.Update the performance metrics on the dashboard
document.getElementById("ctr-value").textContent =
    ctr + "%";

document.getElementById("conversion-rate-value").textContent =
    conversionRate + "%";

document.getElementById("cpc-value").textContent =
    "₹" + cpc;

document.getElementById("roas-value").textContent =
    roas + "x";

const campaignNames = visibleCampaigns.map(campaign => campaign.name);

const campaignSpend = visibleCampaigns.map(campaign => campaign.spend);

const campaignConversions = visibleCampaigns.map(campaign => campaign.conversions);



// <!-- Chart.js -->
const chartCanvas = document.getElementById(
    "campaign-performance-chart"
);

const platformChartCanvas =
    document.getElementById("platform-performance-chart");

const campaignChartEmpty =
    document.getElementById("campaign-chart-empty");

const platformChartEmpty =
    document.getElementById("platform-chart-empty");    

if (campaignChart) {
    campaignChart.destroy();
}

if(visibleCampaigns.length === 0) {
    chartCanvas.style.display = "none";
    campaignChartEmpty.style.display = "flex";
} else {
    chartCanvas.style.display = "block";
    campaignChartEmpty.style.display = "none";
}

campaignChart = new Chart(chartCanvas, {
    type: "bar",

    data: {
        labels: campaignNames,

        datasets: [
    {
        type: "bar",

        label: "Ad Spend",
        data: campaignSpend,

        backgroundColor: "#8cff00",
        borderRadius: 6,

       barThickness:"flex",
       barPercentage: 0.55,
       categoryPercentage: 0.7,

        yAxisID: "y"
    },

    {
        type: "line",

        label: "Conversions",
        data: campaignConversions,

        borderColor: "#f4f7f4",
        backgroundColor: "#f4f7f4",

        borderWidth: 2,

        pointRadius: 4,
        pointHoverRadius: 6,

        tension: 0.3,

        yAxisID: "y1"
    }
]
        
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                   label: function(context) {

    if (context.dataset.label === "Ad Spend") {
        return "Spend: ₹" +
            context.raw.toLocaleString("en-IN");
    }

    if (context.dataset.label === "Conversions") {
        return "Conversions: " +
            context.raw.toLocaleString("en-IN");
    }
}
                }
            }
        },

        scales: {

    x: {
        offset: true,
        grid: {
            display: false
        },

        

ticks: {
    color: "#929a94",
    maxRotation: 0,
    minRotation: 0,
    autoSkip: false,
    font: {
        size: window.innerWidth <= 576 ? 8 : 11
    },
    
callback: function(value) {
    const label = this.getLabelForValue(value);

    if (window.innerWidth <= 576) {
        const shortLabels = {
            "Summer Sale": "Summer",
            "Brand Launch": "Brand",
            "Product Video": "Video",
            "Retargeting Campaign": "Retarget",
            "Holiday Promotion": "Holiday"
        };

        return shortLabels[label] || label;
    }

    return label;
}

}


    },

    y: {
        beginAtZero: true,

        position: "left",

        grid: {
            color: "#242925"
        },

        ticks: {
            color: "#929a94",

            callback: function(value) {
                return "₹" +
                    (value / 1000) +
                    "K";
            }
        }
    },

    y1: {
        beginAtZero: true,

        position: "right",

        grid: {
            drawOnChartArea: false
        },

        ticks: {
            color: "#929a94"
        }
    }
}
    }
});

const platformLabels = Object.keys(platformData);

const platformSpend = platformLabels.map(platform => {
    return platformData[platform].spend;
});

const platformConversions = platformLabels.map(platform => {
    return platformData[platform].conversions;
});

if (platformChart) {
    platformChart.destroy();
}
if(visibleCampaigns.length === 0) {
    platformChartCanvas.style.display = "none";
    platformChartEmpty.style.display = "flex";
} else {
    platformChartCanvas.style.display = "block";
    platformChartEmpty.style.display = "none";
}

platformChart = new Chart(platformChartCanvas, {
    type: "bar",
    data: {
        labels: platformLabels,
        datasets: [
            {
                label: "Ad Spend",
                data: platformSpend,
                borderRadius: 8
            },
            {
                label: "Conversions",
                data: platformConversions,
                borderRadius: 8
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    color: "#929a94",
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: false,
                    font: {
                        size: window.innerWidth <= 576 ? 9 : 11
                    },
                    callback: function(value) {
                        const label = this.getLabelForValue(value);

                        if (window.innerWidth <= 576) {
                            const shortLabels = {
                                "Google Ads": "Google",
                                "Instagram": "Insta",
                                "YouTube": "YouTube",
                                "Facebook": "Facebook"
                            };

                            return shortLabels[label] || label;
                        }

                        return label;
                    }
                }
            }
        }
    }
});


const tableBody = document.getElementById("campaign-table-body");
tableBody.innerHTML = "";

if (visibleCampaigns.length === 0) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td colspan="7" class="empty-state">
            <strong>No campaigns found</strong>
            <span>Try adjusting your filters.</span>
        </td>
    `;

    tableBody.appendChild(row);
} else {
    visibleCampaigns.forEach(campaign => {
        const roas = (campaign.revenue / campaign.spend).toFixed(2);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${campaign.name}</td>
            <td>${campaign.platform}</td>
            <td>₹${formatNumber(campaign.spend)}</td>
            <td>${formatNumber(campaign.clicks)}</td>
            <td>${formatNumber(campaign.conversions)}</td>
            <td>${roas}x</td>
            <td>
                <span class="status-badge ${campaign.status.toLowerCase()}">
                   <span class="status-dot"></span>
                   ${campaign.status}
                </span>
</td>
        `;

        tableBody.appendChild(row);
    });
}
}
// updatedashboard function ends here


function sortCampaigns(campaignList) {
    if (!sortColumn) {
        return campaignList;
    }

    return [...campaignList].sort((a, b) => {
        let valueA;
        let valueB;

        if (sortColumn === "roas") {
            valueA = a.revenue / a.spend;
            valueB = b.revenue / b.spend;
        } else {
            valueA = a[sortColumn];
            valueB = b[sortColumn];
        }

        if (typeof valueA === "string") {
            return sortDirection === "asc"
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        }

        return sortDirection === "asc"
            ? valueA - valueB
            : valueB - valueA;
    });
}
const sortableHeaders = document.querySelectorAll("[data-sort]");

sortableHeaders.forEach(header => {
    header.addEventListener("click", function() {
        const selectedColumn = header.dataset.sort;

        if (sortColumn === selectedColumn) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortColumn = selectedColumn;
            sortDirection = "asc";
        }

        updateDashboard();
        updateSortIndicators();
    });
});

function updateSortIndicators() {
    sortableHeaders.forEach(header => {
        const column = header.dataset.sort;
        const label = header.textContent.replace(" ↕", "").replace(" ↑", "").replace(" ↓", "");

        if (column === sortColumn) {
            header.textContent =
                `${label} ${sortDirection === "asc" ? "↑" : "↓"}`;
        } else {
            header.textContent = `${label} ↕`;
        }
    });
}


function formatNumber(number) {
    return number.toLocaleString("en-IN");
}


// Format the number to K and M for large numbers. For example, 1,000 should be displayed as 1K and 1,000,000 should be displayed as 1M.
function formatCompactNumber(number) {

    if (number >= 1000000) {
        return (number / 1000000).toFixed(2) + "M";
    }

    if (number >= 1000) {
        return (number / 1000).toFixed(1) + "K";
    }

    return number.toString();
}
  


const platformFilter = document.getElementById("platform-filter");

platformFilter.addEventListener("change", function() {

    const selectedPlatform = platformFilter.value;

    if (selectedPlatform === "All") {
        filteredCampaigns = campaigns;
    } else {
        filteredCampaigns = campaigns.filter(
            campaign => campaign.platform === selectedPlatform
        );
    }

    console.log("Selected platform:", selectedPlatform);
    console.log("Filtered campaigns:", filteredCampaigns);

    updateDashboard();
});

// Status filter

const statusFilter = document.getElementById("status-filter");

statusFilter.addEventListener("change", function() {
    selectedStatus = statusFilter.value;
    console.log("Selected status:", selectedStatus);
    updateDashboard();
});

const dateFilter = document.getElementById("date-filter");

dateFilter.addEventListener("change", function() {
    selectedDateRange = dateFilter.value;

    console.log("Selected date range:", selectedDateRange);

    updateDashboard();
});









const campaignSearch =
    document.getElementById("campaign-search");

campaignSearch.addEventListener("input", function() {

    searchTerm = campaignSearch.value.toLowerCase().trim();

    updateDashboard();
});

updateDashboard();