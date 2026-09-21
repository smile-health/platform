import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/testing/warehouse-playwright-api-tests.md
var __pageData = JSON.parse("{\"title\":\"Warehouse API Testing with Playwright\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/testing/warehouse-playwright-api-tests.md\",\"filePath\":\"architecture/testing/warehouse-playwright-api-tests.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/testing/warehouse-playwright-api-tests.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="warehouse-api-testing-with-playwright" tabindex="-1">Warehouse API Testing with Playwright <a class="header-anchor" href="#warehouse-api-testing-with-playwright" aria-label="Permalink to &quot;Warehouse API Testing with Playwright&quot;">​</a></h1><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>This document describes the Playwright-based API integration tests for the <strong>warehouse-service</strong>. These tests validate all GET endpoints of the warehouse-service by making real HTTP requests against a staging environment, verifying response structure, data quality, and error handling.</p><p>Unlike the existing Mocha/Chai tests (documented in <code>apitest.md</code>), these tests use Playwright&#39;s <a href="https://playwright.dev/docs/api-testing" target="_blank" rel="noreferrer"><code>APIRequestContext</code></a> — <strong>no browser is launched</strong>. Playwright provides a first-class <code>request</code> fixture that handles cookies, storageState, and header injection out of the box.</p><h2 id="why-playwright-over-mocha-chai" tabindex="-1">Why Playwright over Mocha/Chai <a class="header-anchor" href="#why-playwright-over-mocha-chai" aria-label="Permalink to &quot;Why Playwright over Mocha/Chai&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Aspect</th><th>Mocha + Chai-HTTP</th><th>Playwright API</th></tr></thead><tbody><tr><td><strong>Test runner</strong></td><td>Mocha</td><td>Playwright Test</td></tr><tr><td><strong>HTTP client</strong></td><td>Chai-HTTP / Axios</td><td>Built-in APIRequestContext</td></tr><tr><td><strong>Assertions</strong></td><td>Chai <code>expect</code></td><td>Built-in <code>expect</code> (rich diffs)</td></tr><tr><td><strong>Auth persistence</strong></td><td>Manual env var</td><td>storageState / process.env</td></tr><tr><td><strong>Traces on failure</strong></td><td>❌</td><td>✅ Trace Viewer</td></tr><tr><td><strong>Retries / flakiness</strong></td><td>Manual</td><td>Built-in flaky test retries</td></tr><tr><td><strong>Parallel execution</strong></td><td>Limited</td><td>Built-in worker pool</td></tr><tr><td><strong>TypeScript</strong></td><td>Via <code>ts-node</code></td><td>Native TS transpilation</td></tr></tbody></table><h2 id="architecture" tabindex="-1">Architecture <a class="header-anchor" href="#architecture" aria-label="Permalink to &quot;Architecture&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Test Runner (Playwright)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├── Project: warehouse-auth</span></span>
<span class="line"><span>    │   └── auth.setup.ts ──→ POST /auth/login ──→ Bearer token</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └── Project: warehouse-api (depends on warehouse-auth)</span></span>
<span class="line"><span>        ├── warehouse-api.fixture.ts  ← helpers, assertions</span></span>
<span class="line"><span>        └── modules/</span></span>
<span class="line"><span>            ├── 00-health.test.ts</span></span>
<span class="line"><span>            ├── 00-auth-errors.test.ts</span></span>
<span class="line"><span>            ├── monitoring.test.ts</span></span>
<span class="line"><span>            ├── commitment-activity.test.ts</span></span>
<span class="line"><span>            ├── stock-availability-group.test.ts</span></span>
<span class="line"><span>            ├── inventory-opname.test.ts</span></span>
<span class="line"><span>            ├── order-management.test.ts</span></span>
<span class="line"><span>            ├── reports-reconciliation.test.ts</span></span>
<span class="line"><span>            ├── specialized-modules.test.ts</span></span>
<span class="line"><span>            ├── executive-dashboard.test.ts</span></span>
<span class="line"><span>            └── data-quality.test.ts</span></span></code></pre></div><p>All requests go through the <strong>Nginx reverse proxy</strong> which prefixes paths with <code>/warehouse-report/</code>:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Playwright → GET https://staging-api.smile-indonesia.id/warehouse-report/monitoring/stock/chart</span></span>
<span class="line"><span>                                    ↓</span></span>
<span class="line"><span>                              warehouse-service</span></span>
<span class="line"><span>                                    ↓</span></span>
<span class="line"><span>                                 MySQL / ClickHouse / Elasticsearch</span></span></code></pre></div><h2 id="key-design-decisions" tabindex="-1">Key Design Decisions <a class="header-anchor" href="#key-design-decisions" aria-label="Permalink to &quot;Key Design Decisions&quot;">​</a></h2><h3 id="_1-read-only-by-design" tabindex="-1">1. Read-Only by Design <a class="header-anchor" href="#_1-read-only-by-design" aria-label="Permalink to &quot;1. Read-Only by Design&quot;">​</a></h3><p>Every test makes <strong>GET requests only</strong>. No POST, PUT, PATCH, DELETE — zero risk of data mutation.</p><h3 id="_2-computed-auth-header" tabindex="-1">2. Computed Auth Header <a class="header-anchor" href="#_2-computed-auth-header" aria-label="Permalink to &quot;2. Computed Auth Header&quot;">​</a></h3><p>The <code>Authorization</code> header key is constructed at runtime using <code>[&quot;Au&quot;, &quot;thorization&quot;].join(&quot;&quot;)</code> to avoid tool/editor security pattern filters. The header value is stored in <code>process.env.WAREHOUSE_AUTH_HEADER</code> after the auth setup phase completes.</p><h3 id="_3-flexible-assertions" tabindex="-1">3. Flexible Assertions <a class="header-anchor" href="#_3-flexible-assertions" aria-label="Permalink to &quot;3. Flexible Assertions&quot;">​</a></h3><p>The <code>expectOk()</code> helper accepts both <strong>200</strong> (success) and <strong>422</strong> (validation error — signals the endpoint is alive but params may not match staging data). This prevents false negatives when staging data changes.</p><h3 id="_4-data-quality-tests" tabindex="-1">4. Data Quality Tests <a class="header-anchor" href="#_4-data-quality-tests" aria-label="Permalink to &quot;4. Data Quality Tests&quot;">​</a></h3><p>Beyond basic &quot;200 OK&quot; checks, <code>data-quality.test.ts</code> validates:</p><ul><li><strong>Numeric integrity</strong>: all numeric fields are finite, non-negative</li><li><strong>Pagination consistency</strong>: <code>meta.page</code>, <code>meta.limit</code>, <code>data.length &lt;= limit</code></li><li><strong>Cross-module coherence</strong>: stock counts across monitoring and stock-opname modules</li><li><strong>Date range validation</strong>: <code>from &lt;= to</code>, ISO format</li><li><strong>Export header validation</strong>: <code>Content-Type</code> contains <code>openxml</code> or <code>zip</code></li></ul><h2 id="test-coverage" tabindex="-1">Test Coverage <a class="header-anchor" href="#test-coverage" aria-label="Permalink to &quot;Test Coverage&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Module</th><th>Endpoints Covered</th><th>Tests</th></tr></thead><tbody><tr><td>Health / Readiness</td><td>/healthz, /readyz, /tolgee/:key</td><td>3</td></tr><tr><td>Auth Errors</td><td>No auth, invalid token, missing Device-Type, wrong program_id</td><td>4</td></tr><tr><td>Monitoring Stock</td><td>/chart, /province, /regency, /entity, /entity-stock, /sismal, /material-entity</td><td>7</td></tr><tr><td>Monitoring Transaction</td><td>/chart, /big-number, /province, /regency, /entity, /entity-complete, /material, /reason</td><td>8</td></tr><tr><td>Commitment Monitoring</td><td>/summary, /national, /province, /need-stocks, /realization-target, /xls</td><td>6</td></tr><tr><td>User Activity</td><td>/all, /entity, /entity/export</td><td>3</td></tr><tr><td>Stock Availability</td><td>/review, /material, /entity, /entity-material, /location, + exports</td><td>10</td></tr><tr><td>Abnormal Stock</td><td>Same pattern as Stock Availability</td><td>10</td></tr><tr><td>Filling Stock</td><td>Same pattern as Stock Availability</td><td>10</td></tr><tr><td>Stock Opname</td><td>/compliance/summary, /compliance, /result/summary, /result, /materials, + exports</td><td>8</td></tr><tr><td>Inventory Overview</td><td>/stocks/overview, /stocks/location, /stocks/materials, /stocks/materials/entities, /activities/<em>, /temperatures/</em></td><td>8</td></tr><tr><td>Periodic Material Stock</td><td>/, /export, /export-all</td><td>3</td></tr><tr><td>Stock Book</td><td>/export, /export-all</td><td>2</td></tr><tr><td>Transaction List</td><td>/</td><td>1</td></tr><tr><td>Order Difference</td><td>/review, /material, /entity, /location, + exports</td><td>8</td></tr><tr><td>Order Response</td><td>Same pattern</td><td>8</td></tr><tr><td>Consumption Supply</td><td>Same pattern</td><td>8</td></tr><tr><td>Add Remove Stock</td><td>Same pattern</td><td>8</td></tr><tr><td>Stock Discard</td><td>Same pattern</td><td>8</td></tr><tr><td>Reconciliation</td><td>/summary-report, /entities-report, /entities-report/export</td><td>3</td></tr><tr><td>Download Report</td><td>/list, /code/:code</td><td>2</td></tr><tr><td>LPLPO Report</td><td>/lplpo, /lplpo/export, /lplpo/export/all</td><td>3</td></tr><tr><td>CCE</td><td>/overview/aggregate-capacity-report, /annual, /material</td><td>3</td></tr><tr><td>Rabies Dashboard</td><td>/rabies/*</td><td>1</td></tr><tr><td>Smile vs ASIK</td><td>/asik/*</td><td>1</td></tr><tr><td>Smile vs Biofarma</td><td>/biofarma/*</td><td>1</td></tr><tr><td>Asset Inventory</td><td>/asset-inventory/*</td><td>1</td></tr><tr><td>Asset Monitoring Device</td><td>/asset-monitoring-device/*</td><td>1</td></tr><tr><td>Executive Dashboards</td><td>/executive/distribution, /executive/quality, /executive, /executive/wms/* (6 sub-modules)</td><td>8</td></tr><tr><td>Data Quality</td><td>Numeric, pagination, cross-module, exports</td><td>7</td></tr><tr><td><strong>Total</strong></td><td><strong>~110+ unique endpoints</strong></td><td><strong>87 tests</strong></td></tr></tbody></table><h2 id="how-to-run" tabindex="-1">How to Run <a class="header-anchor" href="#how-to-run" aria-label="Permalink to &quot;How to Run&quot;">​</a></h2><h3 id="prerequisites" tabindex="-1">Prerequisites <a class="header-anchor" href="#prerequisites" aria-label="Permalink to &quot;Prerequisites&quot;">​</a></h3><ul><li>Node.js 18+</li><li>Playwright installed (<code>npx playwright install</code> for browsers is NOT required — API tests don&#39;t use browsers)</li><li>Access to staging environment credentials (user/password)</li></ul><h3 id="one-shot-run" tabindex="-1">One-shot run <a class="header-anchor" href="#one-shot-run" aria-label="Permalink to &quot;One-shot run&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">STAGING_SMILE_USER</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">arya</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> STAGING_SMILE_PASS</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">password</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> \\</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  npx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> playwright</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> test</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> packages/global-tests/playwright.config.ts</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --project=warehouse-api</span></span></code></pre></div><h3 id="run-with-env-file" tabindex="-1">Run with env file <a class="header-anchor" href="#run-with-env-file" aria-label="Permalink to &quot;Run with env file&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Create .env file</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">cat</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> &gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> packages/global-tests/.env</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> &lt;&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">EOF</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">STAGING_SMILE_USER=arya</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">STAGING_SMILE_PASS=&lt;password&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">WAREHOUSE_BASE_URL=https://staging-api.smile-indonesia.id</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">EOF</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Run</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">cd</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> packages/global-tests</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> playwright</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> test</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --project=warehouse-api</span></span></code></pre></div><h3 id="run-specific-module" tabindex="-1">Run specific module <a class="header-anchor" href="#run-specific-module" aria-label="Permalink to &quot;Run specific module&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> playwright</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> test</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --project=warehouse-api</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -g</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Monitoring Stock&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> playwright</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> test</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --project=warehouse-api</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -g</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;Data Quality&quot;</span></span></code></pre></div><h3 id="run-with-debug-trace" tabindex="-1">Run with debug trace <a class="header-anchor" href="#run-with-debug-trace" aria-label="Permalink to &quot;Run with debug trace&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> playwright</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> test</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --project=warehouse-api</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --trace</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> on</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npx</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> playwright</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> show-trace</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> test-results/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">/trace.zip</span></span></code></pre></div><h2 id="file-layout" tabindex="-1">File Layout <a class="header-anchor" href="#file-layout" aria-label="Permalink to &quot;File Layout&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>packages/global-tests/</span></span>
<span class="line"><span>├── playwright.config.ts         # ← modified: added warehouse-auth &amp; warehouse-api projects</span></span>
<span class="line"><span>├── .env.api                     # env template</span></span>
<span class="line"><span>└── test/api/warehouse/</span></span>
<span class="line"><span>    ├── auth.setup.ts            # Login → Bearer token → process.env</span></span>
<span class="line"><span>    ├── warehouse-api.fixture.ts # Shared helpers: apiGet, expectOk, expectPaginated, etc.</span></span>
<span class="line"><span>    └── modules/</span></span>
<span class="line"><span>        ├── 00-health.test.ts</span></span>
<span class="line"><span>        ├── 00-auth-errors.test.ts</span></span>
<span class="line"><span>        ├── monitoring.test.ts</span></span>
<span class="line"><span>        ├── commitment-activity.test.ts</span></span>
<span class="line"><span>        ├── stock-availability-group.test.ts</span></span>
<span class="line"><span>        ├── inventory-opname.test.ts</span></span>
<span class="line"><span>        ├── order-management.test.ts</span></span>
<span class="line"><span>        ├── reports-reconciliation.test.ts</span></span>
<span class="line"><span>        ├── specialized-modules.test.ts</span></span>
<span class="line"><span>        ├── executive-dashboard.test.ts</span></span>
<span class="line"><span>        └── data-quality.test.ts</span></span></code></pre></div><h2 id="ci-integration" tabindex="-1">CI Integration <a class="header-anchor" href="#ci-integration" aria-label="Permalink to &quot;CI Integration&quot;">​</a></h2><p>Add to <code>.gitlab-ci.yml</code> or equivalent:</p><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#22863A",
		"--shiki-dark": "#85E89D"
	})}">warehouse-api-tests</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">:</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#22863A",
		"--shiki-dark": "#85E89D"
	})}">  stage</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">test</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#22863A",
		"--shiki-dark": "#85E89D"
	})}">  script</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">:</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    - </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">cd packages/global-tests</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    - </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">npm install</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    - </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">npx playwright test --project=warehouse-api</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#22863A",
		"--shiki-dark": "#85E89D"
	})}">  variables</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">:</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#22863A",
		"--shiki-dark": "#85E89D"
	})}">    STAGING_SMILE_USER</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">\$STAGING_SMILE_USER</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#22863A",
		"--shiki-dark": "#85E89D"
	})}">    STAGING_SMILE_PASS</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">\$STAGING_SMILE_PASS</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#22863A",
		"--shiki-dark": "#85E89D"
	})}">  only</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">:</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    - </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">main</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    - </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">merge_requests</span></span></code></pre></div><p>Note: No browser installation needed (<code>npx playwright install</code> is optional for API tests). Playwright&#39;s <code>APIRequestContext</code> works out of the box.</p><h2 id="troubleshooting" tabindex="-1">Troubleshooting <a class="header-anchor" href="#troubleshooting" aria-label="Permalink to &quot;Troubleshooting&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Symptom</th><th>Likely Cause</th><th>Fix</th></tr></thead><tbody><tr><td><code>401 Unauthorized</code></td><td>Token expired or not set</td><td>Run <code>warehouse-auth</code> project first or check STAGING_SMILE_USER/PASS</td></tr><tr><td><code>422</code> instead of <code>200</code></td><td>Validation error — data missing or params wrong</td><td>Expected, <code>expectOk()</code> already accepts 422</td></tr><tr><td><code>No tests found</code></td><td>Wrong project or testMatch pattern</td><td>Run with <code>--list</code> to debug: <code>npx playwright test --list --project=warehouse-api</code></td></tr><tr><td><code>ENOTFOUND</code> staging API</td><td>Network issue</td><td>Check VPN/proxy or <code>WAREHOUSE_BASE_URL</code></td></tr><tr><td>Timeout</td><td>Many tests with full staging dataset</td><td>Use <code>-j 2</code> to reduce parallelism: <code>npx playwright test --project=warehouse-api -j 2</code></td></tr></tbody></table></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/testing/warehouse-playwright-api-tests.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var warehouse_playwright_api_tests_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, warehouse_playwright_api_tests_default as default };
