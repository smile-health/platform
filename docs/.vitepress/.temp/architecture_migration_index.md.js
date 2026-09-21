import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/migration/index.md
var __pageData = JSON.parse("{\"title\":\"SMILE 3.0 to 5.0 Data Migration Documentation\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/index.md\",\"filePath\":\"architecture/migration/index.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="smile-3-0-to-5-0-data-migration-documentation" tabindex="-1">SMILE 3.0 to 5.0 Data Migration Documentation <a class="header-anchor" href="#smile-3-0-to-5-0-data-migration-documentation" aria-label="Permalink to &quot;SMILE 3.0 to 5.0 Data Migration Documentation&quot;">​</a></h1><blockquote><p><strong><code>apps/sync-service</code> sudah tidak ada di repo ini.</strong> Instruksi <code>cd apps/sync-service &amp;&amp; npm run migrate:all</code> di bawah, dan rujukan <code>apps/sync-service/src/scripts/data-migration/const.ts</code> di <a href="./constants-mapping.html">constants-mapping.md</a>, tidak lagi bisa dijalankan apa adanya. Query SQL, mapping tabel, dan validation queries di folder ini tetap dipertahankan karena masih dipakai manual untuk migrasi SMILE 3.0 → 5.0.</p></blockquote><p>This directory contains comprehensive documentation for migrating data from SMILE 3.0 to SMILE 5.0 platform. The migration involves transforming legacy database structures into the new unified platform architecture.</p><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>The SMILE platform migration is a complex process that involves:</p><ul><li><strong>17 migration scripts</strong> organized in 5 phases</li><li><strong>Global and workspace-specific</strong> data transformations</li><li><strong>Referential integrity</strong> preservation</li><li><strong>Batch processing</strong> for performance optimization</li></ul><h2 id="quick-start" tabindex="-1">Quick Start <a class="header-anchor" href="#quick-start" aria-label="Permalink to &quot;Quick Start&quot;">​</a></h2><h3 id="prerequisites" tabindex="-1">Prerequisites <a class="header-anchor" href="#prerequisites" aria-label="Permalink to &quot;Prerequisites&quot;">​</a></h3><ul><li>SMILE 3.0 database access</li><li>SMILE 5.0 platform database setup</li><li>Redis instance for progress tracking</li><li>Sufficient database permissions</li></ul><h3 id="execution-command" tabindex="-1">Execution Command <a class="header-anchor" href="#execution-command" aria-label="Permalink to &quot;Execution Command&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Navigate to sync-service</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">cd</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> apps/sync-service</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Run complete migration in order</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate:all</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Or run individual migrations</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate:location</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate:activity</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># ... continue with other migrations</span></span></code></pre></div><h2 id="documentation-structure" tabindex="-1">Documentation Structure <a class="header-anchor" href="#documentation-structure" aria-label="Permalink to &quot;Documentation Structure&quot;">​</a></h2><h3 id="core-documentation" tabindex="-1">Core Documentation <a class="header-anchor" href="#core-documentation" aria-label="Permalink to &quot;Core Documentation&quot;">​</a></h3><ul><li><strong><a href="./migration-execution-order.html">Migration Execution Order</a></strong> - Complete execution strategy and dependencies</li><li><strong><a href="./constants-mapping.html">Constants Mapping</a></strong> - Data mapping and transformation rules</li></ul><h3 id="global-migrations" tabindex="-1">Global Migrations <a class="header-anchor" href="#global-migrations" aria-label="Permalink to &quot;Global Migrations&quot;">​</a></h3><p>Foundation data that applies across all workspaces:</p><table tabindex="0"><thead><tr><th>Script</th><th>Documentation</th><th>Purpose</th></tr></thead><tbody><tr><td><code>migrate-location.ts</code></td><td><a href="./global/migrate-location.html">Location Migration</a></td><td>Geographic hierarchy</td></tr><tr><td><code>migrate-activity.ts</code></td><td><a href="./global/migrate-activity.html">Activity Migration</a></td><td>Program activities</td></tr><tr><td><code>migrate-user-bulk.ts</code></td><td><a href="./global/migrate-user-bulk.html">User Migration</a></td><td>User accounts</td></tr><tr><td><code>migrate-entity-bulk.ts</code></td><td><a href="./global/migrate-entity-bulk.html">Entity Migration</a></td><td>Business entities</td></tr><tr><td><code>migrate-material.ts</code></td><td><a href="./global/migrate-material.html">Material Migration</a></td><td>Material catalog</td></tr><tr><td><code>migrate-manufacture.ts</code></td><td><a href="./global/migrate-manufacture.html">Manufacture Migration</a></td><td>Manufacturer data</td></tr><tr><td><code>migrate-budget-source.ts</code></td><td><a href="./global/migrate-budget-source.html">Budget Source Migration</a></td><td>Budget sources</td></tr></tbody></table><h3 id="workspace-migrations" tabindex="-1">Workspace Migrations <a class="header-anchor" href="#workspace-migrations" aria-label="Permalink to &quot;Workspace Migrations&quot;">​</a></h3><p>Program-specific data that varies by workspace:</p><table tabindex="0"><thead><tr><th>Script</th><th>Documentation</th><th>Purpose</th></tr></thead><tbody><tr><td><code>migrate-entity/*</code></td><td>Entity Relations</td><td>Entity associations</td></tr><tr><td><code>migrate-material/*</code></td><td>Material Relations</td><td>Material associations</td></tr><tr><td><code>migrate-order/*</code></td><td>Order Data</td><td>Order management</td></tr><tr><td><code>migrate-stock/*</code></td><td>Stock Data</td><td>Inventory management</td></tr><tr><td><code>migrate-transaction/*</code></td><td>Transaction Data</td><td>Financial transactions</td></tr><tr><td><code>migrate-patients.ts</code></td><td><a href="./workspace/migrate-patients.html">Patient Migration</a></td><td>Patient records</td></tr><tr><td><code>migrate-batches.ts</code></td><td><a href="./workspace/migrate-batches.html">Batch Migration</a></td><td>Material batches</td></tr><tr><td><code>migrate-stock-opnames.ts</code></td><td><a href="./workspace/migrate-stock-opnames.html">Stock Opname Migration</a></td><td>Inventory counts</td></tr><tr><td><code>migrate-reconciliations.ts</code></td><td>Reconciliation Data</td><td>Data reconciliation</td></tr><tr><td><code>migrate-transaction-reasons.ts</code></td><td>Transaction Reasons</td><td>Transaction metadata</td></tr></tbody></table><h2 id="migration-phases" tabindex="-1">Migration Phases <a class="header-anchor" href="#migration-phases" aria-label="Permalink to &quot;Migration Phases&quot;">​</a></h2><h3 id="phase-1-foundation-data-global" tabindex="-1">Phase 1: Foundation Data (Global) <a class="header-anchor" href="#phase-1-foundation-data-global" aria-label="Permalink to &quot;Phase 1: Foundation Data (Global)&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-328",
				class: "mermaid",
				graph: "graph%20LR%0A%20%20%20%20A%5BLocations%5D%20--%3E%20B%5BActivities%5D%0A%20%20%20%20B%20--%3E%20C%5BManufactures%5D%0A%20%20%20%20C%20--%3E%20D%5BBudget%20Sources%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<p><strong>Purpose</strong>: Establish core reference data that other entities depend on.</p><h3 id="phase-2-core-entities" tabindex="-1">Phase 2: Core Entities <a class="header-anchor" href="#phase-2-core-entities" aria-label="Permalink to &quot;Phase 2: Core Entities&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-335",
				class: "mermaid",
				graph: "graph%20LR%0A%20%20%20%20A%5BUsers%5D%20--%3E%20B%5BEntities%5D%0A%20%20%20%20B%20--%3E%20C%5BMaterials%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<p><strong>Purpose</strong>: Create primary business entities with proper relationships.</p><h3 id="phase-3-workspace-relations" tabindex="-1">Phase 3: Workspace Relations <a class="header-anchor" href="#phase-3-workspace-relations" aria-label="Permalink to &quot;Phase 3: Workspace Relations&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-342",
				class: "mermaid",
				graph: "graph%20LR%0A%20%20%20%20A%5BEntity%20Relations%5D%20--%3E%20B%5BMaterial%20Relations%5D%0A%20%20%20%20B%20--%3E%20C%5BPatients%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<p><strong>Purpose</strong>: Establish workspace-specific associations and relationships.</p><h3 id="phase-4-operational-data" tabindex="-1">Phase 4: Operational Data <a class="header-anchor" href="#phase-4-operational-data" aria-label="Permalink to &quot;Phase 4: Operational Data&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-349",
				class: "mermaid",
				graph: "graph%20LR%0A%20%20%20%20A%5BBatches%5D%20--%3E%20B%5BStocks%5D%0A%20%20%20%20B%20--%3E%20C%5BOrders%5D%0A%20%20%20%20C%20--%3E%20D%5BTransactions%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<p><strong>Purpose</strong>: Migrate business operations and transaction data.</p><h3 id="phase-5-supporting-data" tabindex="-1">Phase 5: Supporting Data <a class="header-anchor" href="#phase-5-supporting-data" aria-label="Permalink to &quot;Phase 5: Supporting Data&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-356",
				class: "mermaid",
				graph: "graph%20LR%0A%20%20%20%20A%5BStock%20Opnames%5D%20--%3E%20B%5BReconciliations%5D%0A%20%20%20%20B%20--%3E%20C%5BTransaction%20Reasons%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<p><strong>Purpose</strong>: Complete audit trails and supporting documentation.</p><h2 id="key-features" tabindex="-1">Key Features <a class="header-anchor" href="#key-features" aria-label="Permalink to &quot;Key Features&quot;">​</a></h2><h3 id="data-integrity" tabindex="-1">Data Integrity <a class="header-anchor" href="#data-integrity" aria-label="Permalink to &quot;Data Integrity&quot;">​</a></h3><ul><li><strong>Foreign key preservation</strong> across all migrations</li><li><strong>Referential constraint validation</strong> at each step</li><li><strong>Data type transformation</strong> with validation</li><li><strong>Null value handling</strong> and default assignments</li></ul><h3 id="performance-optimization" tabindex="-1">Performance Optimization <a class="header-anchor" href="#performance-optimization" aria-label="Permalink to &quot;Performance Optimization&quot;">​</a></h3><ul><li><strong>Batch processing</strong> with configurable sizes</li><li><strong>Progress tracking</strong> using Redis</li><li><strong>Memory management</strong> for large datasets</li><li><strong>Connection pooling</strong> for database efficiency</li></ul><h3 id="error-handling" tabindex="-1">Error Handling <a class="header-anchor" href="#error-handling" aria-label="Permalink to &quot;Error Handling&quot;">​</a></h3><ul><li><strong>Rollback capabilities</strong> for failed migrations</li><li><strong>Resume functionality</strong> from last successful batch</li><li><strong>Detailed logging</strong> for troubleshooting</li><li><strong>Validation checks</strong> at each phase</li></ul><h2 id="data-transformation-examples" tabindex="-1">Data Transformation Examples <a class="header-anchor" href="#data-transformation-examples" aria-label="Permalink to &quot;Data Transformation Examples&quot;">​</a></h2><h3 id="location-hierarchy" tabindex="-1">Location Hierarchy <a class="header-anchor" href="#location-hierarchy" aria-label="Permalink to &quot;Location Hierarchy&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- SMILE 3.0 (Multiple Tables)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">provinces: id, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, lat, lng</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">regencies: id, province_id, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, lat, lng</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">sub_districts: id, regency_id, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, lat, lng</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">villages: id, sub_district_id, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, lat, lng</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- SMILE 5.0 (Unified Table)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">locations: id, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, lat, lng, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">level</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, parent_id</span></span></code></pre></div><h3 id="material-relationships" tabindex="-1">Material Relationships <a class="header-anchor" href="#material-relationships" aria-label="Permalink to &quot;Material Relationships&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- SMILE 3.0</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">master_materials: id, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, unit</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">material_activities: material_id, activity_id</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- SMILE 5.0</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">materials: id, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, type_id, unit_id</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">material_workspaces: material_id, program_id, activity_id</span></span></code></pre></div><h2 id="configuration" tabindex="-1">Configuration <a class="header-anchor" href="#configuration" aria-label="Permalink to &quot;Configuration&quot;">​</a></h2><h3 id="environment-variables" tabindex="-1">Environment Variables <a class="header-anchor" href="#environment-variables" aria-label="Permalink to &quot;Environment Variables&quot;">​</a></h3><div class="language-env vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">env</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># Source Database (SMILE 3.0)</span></span>
<span class="line"><span>MIGRATION_DB_HOST=localhost</span></span>
<span class="line"><span>MIGRATION_DB_USER=user</span></span>
<span class="line"><span>MIGRATION_DB_PASSWORD=password</span></span>
<span class="line"><span>MIGRATION_DB_NAME=smile3_db</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Target Database (SMILE 5.0)</span></span>
<span class="line"><span>PLATFORM_DB_HOST=localhost</span></span>
<span class="line"><span>PLATFORM_DB_USER=user</span></span>
<span class="line"><span>PLATFORM_DB_PASSWORD=password</span></span>
<span class="line"><span>PLATFORM_DB_NAME=smile5_platform</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Redis for Progress Tracking</span></span>
<span class="line"><span>REDIS_HOST=localhost</span></span>
<span class="line"><span>REDIS_PORT=6379</span></span>
<span class="line"><span>REDIS_PASSWORD=</span></span></code></pre></div><h3 id="batch-size-recommendations" tabindex="-1">Batch Size Recommendations <a class="header-anchor" href="#batch-size-recommendations" aria-label="Permalink to &quot;Batch Size Recommendations&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Data Type</th><th>Recommended Batch Size</th><th>Notes</th></tr></thead><tbody><tr><td>Locations</td><td>1000</td><td>Small reference data</td></tr><tr><td>Users</td><td>5000</td><td>Medium complexity</td></tr><tr><td>Entities</td><td>2000</td><td>Complex relationships</td></tr><tr><td>Materials</td><td>1000</td><td>Hierarchical data</td></tr><tr><td>Stocks</td><td>10000</td><td>High volume</td></tr><tr><td>Transactions</td><td>5000</td><td>Complex business logic</td></tr></tbody></table><h2 id="monitoring-and-validation" tabindex="-1">Monitoring and Validation <a class="header-anchor" href="#monitoring-and-validation" aria-label="Permalink to &quot;Monitoring and Validation&quot;">​</a></h2><h3 id="progress-tracking" tabindex="-1">Progress Tracking <a class="header-anchor" href="#progress-tracking" aria-label="Permalink to &quot;Progress Tracking&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Check migration progress</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">redis-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> get</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;current_user_id&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">redis-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> get</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;current_entity_id&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">redis-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> get</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;current_material_id&quot;</span></span></code></pre></div><h3 id="data-validation" tabindex="-1">Data Validation <a class="header-anchor" href="#data-validation" aria-label="Permalink to &quot;Data Validation&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- Verify record counts</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">SELECT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;users&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> as</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> table_name, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">COUNT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">as</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> count </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">FROM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> users</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">UNION ALL</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">SELECT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;entities&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">COUNT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">FROM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> entities</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">UNION ALL</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">SELECT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;materials&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">COUNT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">FROM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> materials;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- Check foreign key integrity</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">SELECT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> COUNT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">as</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> orphaned_records </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">FROM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> entities e </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">LEFT JOIN</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> users u </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">ON</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> e</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">created_by</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> u</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">WHERE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> u</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> IS</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> NULL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> AND</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> e</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">created_by</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> IS NOT NULL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span></code></pre></div><h2 id="troubleshooting" tabindex="-1">Troubleshooting <a class="header-anchor" href="#troubleshooting" aria-label="Permalink to &quot;Troubleshooting&quot;">​</a></h2><h3 id="common-issues" tabindex="-1">Common Issues <a class="header-anchor" href="#common-issues" aria-label="Permalink to &quot;Common Issues&quot;">​</a></h3><ol><li><p><strong>Memory Exhaustion</strong></p><ul><li>Reduce batch size</li><li>Increase available memory</li><li>Monitor memory usage during migration</li></ul></li><li><p><strong>Foreign Key Violations</strong></p><ul><li>Verify migration order</li><li>Check data consistency in source</li><li>Validate mapping tables</li></ul></li><li><p><strong>Performance Issues</strong></p><ul><li>Add database indexes</li><li>Optimize query performance</li><li>Use connection pooling</li></ul></li><li><p><strong>Data Inconsistencies</strong></p><ul><li>Validate source data quality</li><li>Check transformation logic</li><li>Review mapping constants</li></ul></li></ol><h3 id="recovery-procedures" tabindex="-1">Recovery Procedures <a class="header-anchor" href="#recovery-procedures" aria-label="Permalink to &quot;Recovery Procedures&quot;">​</a></h3><ol><li><p><strong>Resume Failed Migration</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Check last processed ID</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">redis-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> get</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;current_batch_id&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Resume from specific batch</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate:users</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --resume</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --batch=1500</span></span></code></pre></div></li><li><p><strong>Rollback Migration</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Rollback specific migration</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> rollback:users</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Full rollback</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> rollback:all</span></span></code></pre></div></li></ol><h2 id="best-practices" tabindex="-1">Best Practices <a class="header-anchor" href="#best-practices" aria-label="Permalink to &quot;Best Practices&quot;">​</a></h2><h3 id="before-migration" tabindex="-1">Before Migration <a class="header-anchor" href="#before-migration" aria-label="Permalink to &quot;Before Migration&quot;">​</a></h3><ul><li>[ ] Backup source and target databases</li><li>[ ] Verify database connectivity</li><li>[ ] Test migration on sample data</li><li>[ ] Review and update mapping constants</li><li>[ ] Ensure sufficient disk space</li></ul><h3 id="during-migration" tabindex="-1">During Migration <a class="header-anchor" href="#during-migration" aria-label="Permalink to &quot;During Migration&quot;">​</a></h3><ul><li>[ ] Monitor system resources</li><li>[ ] Track progress regularly</li><li>[ ] Validate data at each phase</li><li>[ ] Keep detailed logs</li><li>[ ] Be prepared to pause/resume</li></ul><h3 id="after-migration" tabindex="-1">After Migration <a class="header-anchor" href="#after-migration" aria-label="Permalink to &quot;After Migration&quot;">​</a></h3><ul><li>[ ] Perform comprehensive data validation</li><li>[ ] Update application configurations</li><li>[ ] Test application functionality</li><li>[ ] Document any issues encountered</li><li>[ ] Archive migration logs</li></ul><h2 id="support" tabindex="-1">Support <a class="header-anchor" href="#support" aria-label="Permalink to &quot;Support&quot;">​</a></h2><p>For migration support:</p><ul><li>Review individual migration documentation</li><li>Check troubleshooting guides</li><li>Contact the platform team</li><li>Submit issues with detailed logs</li></ul><hr><p><strong>Last Updated</strong>: December 2024<br><strong>Version</strong>: 1.0<br><strong>Maintainer</strong>: Platform Team</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var migration_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, migration_default as default };
