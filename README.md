# InsightFlow — Interactive AI Data Explorer

**Turn Raw Data Into Clear Insights.**

InsightFlow is a polished, responsive, and privacy-first data exploration web application built with Next.js (App Router), React, TypeScript, Tailwind CSS, and Recharts. It allows users to instantly upload CSV or Excel (`.xlsx`) datasets, inspect their structure, calculate real descriptive statistics, create rich interactive visualizations, discover statistical patterns, clean dirty data, and generate actionable analytical insights.

**No login, no registration, and no mandatory database required.** All core spreadsheet processing occurs 100% client-side in browser memory.

---

## 🌟 Key Features

### 1. In-Browser Dataset Ingestion
- **Formats:** Full support for CSV (`.csv`) and Excel (`.xlsx`, `.xls`) files.
- **Drag-and-Drop Dropzone:** Intuitive file drop and click-to-browse interfaces.
- **Auto-Delimiter Fallback:** Automatic delimiter detection with custom fallback options (comma, semicolon, tab, pipe).
- **Multi-Sheet Excel Discovery:** Interactive modal allowing sheet selection for multi-worksheet workbooks.
- **Three Bundled Sample Datasets:** Instant one-click exploration with:
  1. *Retail Sales & Profitability* (Order metrics, discounts, margins)
  2. *SaaS Customer Churn & Retention* (Tenure, spend, channels, tickets)
  3. *Academic Student Performance* (Study hours, attendance, exam outcomes)

### 2. Dataset Architecture & Heuristic Quality Profiling
- **Calculated Overview Metrics:** Total rows, columns, missing cells (count & %), duplicate row counts, numeric columns, and categorical columns.
- **Heuristic Data Quality Score:** Explicitly calculated 0–100 score based on completeness, row uniqueness, and type consistency.
- **Column Profiler Table:** Inferred types (`number`, `string`, `date`, `boolean`), missing percentages, cardinality, and sample values.
- **Column Inspection Dialog:** In-depth modal with frequency histograms, parametric statistics, and category distribution bars.

### 3. Interactive Data Table
- **Search Across Values:** Live text search across all attributes.
- **Type-Appropriate Filters:** Filter rows by `contains`, `equals`, `greater than`, `less than`, `is null`, or `is not null`.
- **Column Sorting:** Multi-directional sorting (asc / desc / neutral).
- **Column Visibility Picker:** Toggle columns on/off with select all / reset.
- **Missing Value Highlighting:** Visual amber badges on null/missing cells.
- **Adjustable Pagination:** Paging with 10, 25, 50, or 100 records per page.

### 4. Comprehensive Statistical Analysis
- **Parametric & Non-Parametric Metrics:** Count, valid count, missing count, mean ($\mu$), median, minimum, maximum, range, quartiles ($Q_1, Q_2, Q_3$), and interquartile range ($IQR$).
- **Sample Standard Deviation:** Computed using $s = \sqrt{\frac{\sum (x_i - \bar{x})^2}{n - 1}}$ ($N-1$ degrees of freedom).
- **Categorical Profiling:** Mode identification, unique counts, and frequency distributions.
- **Pearson Correlation Heatmap:** Matrix of correlation coefficients ($r$) between all numeric column pairs with an interactive color-gradient heatmap.

### 5. Interactive Visualization Studio
- **Supported Chart Types:** Bar Chart, Line Chart, Area Chart, Pie / Donut Chart, Histogram (with automatic binning), and Scatter Plot.
- **Dynamic Configuration:** X-axis, Y-axis, breakdown grouping, aggregation methods (Sum, Mean, Count, Min, Max, Raw), titles, gridlines, and legends.
- **Curated Color Palettes:** Electric Indigo, Ocean Breeze, Forest Emerald, and Sunset Glow.
- **High-Resolution PNG Export:** Direct client-side chart capture and download via `html-to-image`.

### 6. Dual Insights Engine (Rule-Based + Optional AI)
- **Deterministic Rule Engine (100% Offline):** Automatically flags missing data clusters, dominant class imbalances, high collinearities ($|r| \ge 0.70$), and statistical outliers via the IQR boundary rule ($Q_1 - 1.5\cdot IQR$, $Q_3 + 1.5\cdot IQR$).
- **Factual vs. Hypotheses Separation:** Clearly differentiates verified numeric findings from plausible hypotheses.
- **Suggested Follow-Up Questions:** Proactively suggests strategic business questions to investigate.
- **Optional Server-Side AI Deep Dive (`/api/insights`):** Shielded metadata transmission (sends only statistical summaries and correlations; never raw row records) with graceful offline fallback.

### 7. Data Cleaning Workspace with Undo/Redo
- **Deduplication with Backward Fill (bfill):** Choose between standard row purging or replacing duplicates using backward fill (`bfill`) from subsequent rows, preserving 100% of the sample count for downstream modeling.
- **Transformations:** Deduplicate (drop or bfill), drop columns, filter rows, drop missing rows, and impute numeric missing values (mean, median, zero, custom) or categorical values (mode, custom).
- **Session History:** Full immutable history stack with Undo, Redo, and Reset to Original Dataset.
- **Auditing:** Displays exact affected rows and cells for every applied operation.

### 8. Multi-Format Export & Reporting
- **Cleaned Dataset CSV:** Export transformed data reflecting current filters and imputations.
- **Raw Original CSV:** Export initial unmodified dataset.
- **Markdown Summary:** Copy structured Markdown reports directly to your clipboard.
- **Printable Executive PDF Report:** Browser-printable document styled with metrics, findings, and column dictionaries.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict typing)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Tailwind v4 with dark mode variant)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Parsing:** [Papa Parse](https://www.papaparse.com/) (CSV) & [SheetJS (xlsx)](https://sheetjs.com/) (Excel)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Validation:** [Zod](https://zod.dev/)
- **Image Export:** [html-to-image](https://github.com/bubkoo/html-to-image)
- **Testing:** [Vitest](https://vitest.dev/)

---

## 📁 Project Structure

```
InsightFlow/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with ThemeProvider and ToastProvider
│   │   ├── page.tsx               # Landing page with live chart preview & feature showcase
│   │   ├── workspace/
│   │   │   └── page.tsx           # Interactive dataset exploration workspace
│   │   ├── privacy/
│   │   │   └── page.tsx           # Privacy statement & data handling documentation
│   │   └── api/
│   │       └── insights/
│   │           └── route.ts       # Optional AI metadata synthesis endpoint with offline fallback
│   ├── components/
│   │   ├── landing/               # Hero, LiveChartPreview, Features, Workflow, Footer
│   │   ├── workspace/             # Header, Uploader, Overview, Table, Stats, Charts, Insights, Cleaning, Export
│   │   ├── theme/                 # ThemeProvider & ThemeToggle
│   │   └── ui/                    # Accessible Toasts and UI helpers
│   ├── lib/
│   │   ├── parsers/               # CSV (Papa Parse) & Excel (SheetJS) parsers
│   │   ├── statistics/            # Numerical, categorical, correlation, and profiling logic
│   │   ├── visualization/         # Chart data preparation, histogram binning & palettes
│   │   ├── data-cleaning/         # Immutable data transformations & affected cell counters
│   │   ├── insights/              # Deterministic rule engine & follow-up questions generator
│   │   ├── export/                # CSV exporter, Markdown generator & printable PDF report
│   │   ├── samples/               # Bundled Sales, Customer, and Student datasets
│   │   └── workspace/             # Workspace Context & State Store
│   └── types/                     # Dataset, Statistics, Charts, Cleaning, and Insights types
├── tests/                         # Vitest unit test suite (23 tests)
├── public/                        # Static assets & icons
├── .env.example                   # Optional AI environment variable template
├── vitest.config.mts              # Vitest runner configuration
└── package.json
```

---

## 🚀 Installation & Local Development

### 1. Prerequisites
- **Node.js:** v18.18.0 or newer (v20+ recommended)
- **npm:** v9+ or equivalent package manager

### 2. Clone and Install Dependencies
```bash
cd InsightFlow
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Unit Tests
```bash
npm test
```
Runs the full Vitest unit test suite validating:
- Mean, median, sample standard deviation, and quartiles
- Categorical mode and frequencies
- Pearson correlation coefficients
- Missing-value and duplicate-row detection
- Inferred column types and quality heuristics
- Data cleaning transformations (deduplication, imputations, column drops)
- CSV parsing and unparsing

### 5. Build for Production
```bash
npm run build
```

---

## 🔒 Privacy & Data Handling Guarantee

- **Client-Side First:** All data files remain strictly inside your browser's local sandbox memory.
- **Zero Database Storage:** No user profiles, authentication, or remote database tables exist.
- **Clear Workspace:** Instantly purge active dataset memory at any time via the "Clear Workspace" action.
- **Untrusted Content Sanitization:** Spreadsheet cell values are rendered as sanitized React text nodes without executing formulas or innerHTML.

---

## ☁️ Deploying to Vercel

InsightFlow is configured to deploy directly to [Vercel](https://vercel.com/) with zero custom server setup:

1. Push this repository to GitHub or GitLab.
2. Import the project into Vercel.
3. Keep default build settings (`npm run build`, output directory `.next`).
4. *(Optional)* Add `OPENAI_API_KEY` or `AI_API_KEY` under Project Settings &rarr; Environment Variables if you want to enable the optional AI executive summary feature. Core functionality does not require any environment variables.
5. Click **Deploy**.
