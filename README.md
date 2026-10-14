# Pulse — Marketing Analytics Dashboard

**Live Demo:** [View Pulse Dashboard](https://pulse-marketing-dashboard.vercel.app/)

**GitHub Repository:** [View Source Code](https://github.com/abhinav-abhii/pulse-marketing-dashboard)

A responsive marketing analytics dashboard designed to monitor campaign performance, advertising spend, conversions, and return on ad spend through a clean, modern interface.

## Overview

Pulse is a front-end dashboard project built to demonstrate how marketing campaign data can be presented and explored using interactive charts, KPI cards, filters, and a sortable campaign table.

The project uses sample campaign data for demonstration purposes.

## Features

- **KPI Overview** — View key marketing performance indicators.
- **Campaign Performance Chart** — Compare advertising spend and conversions across campaigns.
- **Platform Performance Chart** — Compare campaign performance across advertising platforms.
- **Dynamic Metrics** — Calculate metrics such as click-through rate (CTR), conversion rate, cost per click (CPC), and return on ad spend (ROAS).
- **Campaign Filters** — Filter campaigns by platform, status, and date range.
- **Search** — Find campaigns by campaign name or platform.
- **Sortable Table** — Sort campaign data by supported columns.
- **Empty States** — Display helpful messages when no matching data is available.
- **Responsive Design** — Adapt the dashboard layout to different screen sizes.

## Tech Stack

- HTML5
- CSS3
- Bootstrap 5
- JavaScript
- Chart.js

## Project Structure

```text
pulse-dashboard/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── data.js
│   └── app.js
└── assets/
```

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### 2. Open the project

```bash
cd pulse-dashboard
```

### 3. Run the dashboard

Open `index.html` in your browser.

For local development, you can also open the project in VS Code and use the Live Server extension.

## Metrics

| Metric | Meaning |
|---|---|
| CTR | Percentage of impressions that resulted in clicks |
| Conversion Rate | Percentage of clicks that resulted in conversions |
| CPC | Average advertising cost per click |
| ROAS | Revenue generated per unit of advertising spend |

## Data

The dashboard currently uses sample campaign data stored in `js/data.js`. It is intended for demonstration and portfolio purposes and is not connected to a live advertising platform or backend API.

## Future Improvements

- Connect to real advertising platform APIs.
- Add backend data storage and authentication.
- Support campaign data import and export.
- Add historical performance comparisons.

## Author

**Abhinav**

A portfolio project exploring marketing analytics, interactive data visualization, and responsive dashboard design.
