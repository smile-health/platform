import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/cutoff-stock-opname-architecture.md
var __pageData = JSON.parse("{\"title\":\"Software Architecture Document: Cutoff Stock Opname\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/cutoff-stock-opname-architecture.md\",\"filePath\":\"architecture/cutoff-stock-opname-architecture.md\",\"lastUpdated\":1784876801000}");
var _sfc_main = { name: "architecture/cutoff-stock-opname-architecture.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="software-architecture-document-cutoff-stock-opname" tabindex="-1">Software Architecture Document: Cutoff Stock Opname <a class="header-anchor" href="#software-architecture-document-cutoff-stock-opname" aria-label="Permalink to &quot;Software Architecture Document: Cutoff Stock Opname&quot;">​</a></h1><p><strong>Author</strong>: Khoirul Annas<br><strong>Email</strong>: <a href="mailto:khoirul.annas@badr-interactive.co.id" target="_blank" rel="noreferrer">khoirul.annas@badr-interactive.co.id</a><br><strong>Feature</strong>: Cutoff Stock Opname<br><strong>Implementation Period</strong>: May 20, 2026 - June 02, 2026<br><strong>Version</strong>: 1.0<br><strong>Date</strong>: June 08, 2026</p><hr><h2 id="table-of-contents" tabindex="-1">Table of Contents <a class="header-anchor" href="#table-of-contents" aria-label="Permalink to &quot;Table of Contents&quot;">​</a></h2><ol><li><a href="#1-introduction">Introduction</a></li><li><a href="#2-business-context--problem-statement">Business Context &amp; Problem Statement</a></li><li><a href="#3-system-overview">System Overview</a></li><li><a href="#4-architecture-design">Architecture Design</a></li><li><a href="#5-database-schema-design">Database Schema Design</a></li><li><a href="#6-component-architecture">Component Architecture</a></li><li><a href="#7-integration-points">Integration Points</a></li><li><a href="#8-data-flow">Data Flow</a></li><li><a href="#9-validation--business-rules">Validation &amp; Business Rules</a></li><li><a href="#10-deployment-considerations">Deployment Considerations</a></li><li><a href="#11-testing-strategy">Testing Strategy</a></li></ol><hr><h2 id="_1-introduction" tabindex="-1">1. Introduction <a class="header-anchor" href="#_1-introduction" aria-label="Permalink to &quot;1. Introduction&quot;">​</a></h2><h3 id="_1-1-purpose" tabindex="-1">1.1 Purpose <a class="header-anchor" href="#_1-1-purpose" aria-label="Permalink to &quot;1.1 Purpose&quot;">​</a></h3><p>This document describes the software architecture for the <strong>Cutoff Stock Opname</strong> feature, a critical component of the SMILE Platform&#39;s inventory management system. The feature ensures that stock quantities recorded during stock opname (physical inventory) remain immutable after a specified cutoff date/time, preventing discrepancies between physical counts and system records.</p><h3 id="_1-2-scope" tabindex="-1">1.2 Scope <a class="header-anchor" href="#_1-2-scope" aria-label="Permalink to &quot;1.2 Scope&quot;">​</a></h3><ul><li>Database schema enhancements for stock opname periods and stock quantities</li><li>Business logic for cutoff-based stock quantity management</li><li>Integration with order fulfillment, shipment, and transaction modules</li><li>API endpoint modifications for stock opname period management</li><li>Master data export enhancements</li></ul><h3 id="_1-3-definitions" tabindex="-1">1.3 Definitions <a class="header-anchor" href="#_1-3-definitions" aria-label="Permalink to &quot;1.3 Definitions&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Term</th><th>Definition</th></tr></thead><tbody><tr><td><strong>Cutoff Date</strong></td><td>A datetime field in <code>ws_stock_opname_periods</code> that marks the deadline after which stock quantities become immutable</td></tr><tr><td><strong>Cutoff Qty</strong></td><td>A field in <code>ws_stocks</code> that stores the stock quantity as of the cutoff date</td></tr><tr><td><strong>Stock Opname Period</strong></td><td>A defined timeframe for conducting physical inventory counts</td></tr><tr><td><strong>canUpdateCutoffQty()</strong></td><td>A repository method that determines whether cutoff quantities can be modified based on current date vs. cutoff date</td></tr></tbody></table><hr><h2 id="_2-business-context-problem-statement" tabindex="-1">2. Business Context &amp; Problem Statement <a class="header-anchor" href="#_2-business-context-problem-statement" aria-label="Permalink to &quot;2. Business Context &amp; Problem Statement&quot;">​</a></h2><h3 id="_2-1-problem-statement" tabindex="-1">2.1 Problem Statement <a class="header-anchor" href="#_2-1-problem-statement" aria-label="Permalink to &quot;2.1 Problem Statement&quot;">​</a></h3><p>In the traditional inventory management workflow, stock quantities (<code>qty</code>) in the system continuously change with every transaction (order fulfillment, stock addition/removal, discards, returns). This creates a mismatch between:</p><ol><li><strong>Physical Stock Opname Count</strong>: The actual count of items in the warehouse at a specific point in time</li><li><strong>System Stock Quantity</strong>: The quantity that may have changed due to subsequent transactions</li></ol><p>This discrepancy makes it impossible to:</p><ul><li>Accurately reconcile physical counts with system records</li><li>Perform meaningful variance analysis</li><li>Maintain audit trails for financial reporting</li></ul><h3 id="_2-2-solution" tabindex="-1">2.2 Solution <a class="header-anchor" href="#_2-2-solution" aria-label="Permalink to &quot;2.2 Solution&quot;">​</a></h3><p>The <strong>Cutoff Stock Opname</strong> feature introduces a temporal boundary (cutoff date) that freezes stock quantities for reporting purposes while allowing normal business operations to continue. The system maintains two parallel quantity values:</p><ul><li><strong><code>qty</code></strong>: Real-time quantity (updates with all transactions)</li><li><strong><code>cutoff_qty</code></strong>: Quantity as of cutoff date (immutable after cutoff)</li></ul><hr><h2 id="_3-system-overview" tabindex="-1">3. System Overview <a class="header-anchor" href="#_3-system-overview" aria-label="Permalink to &quot;3. System Overview&quot;">​</a></h2><h3 id="_3-1-system-context" tabindex="-1">3.1 System Context <a class="header-anchor" href="#_3-1-system-context" aria-label="Permalink to &quot;3.1 System Context&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                     SMILE Platform                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌──────────────────┐        ┌──────────────────────────┐  │</span></span>
<span class="line"><span>│  │ Stock Opname      │        │ Order Management System   │  │</span></span>
<span class="line"><span>│  │ Module            │◄──────►│                          │  │</span></span>
<span class="line"><span>│  │ - Period Mgmt     │        │ - Order Fulfillment      │  │</span></span>
<span class="line"><span>│  │ - Cutoff Logic    │        │ - Shipment Processing    │  │</span></span>
<span class="line"><span>│  │ - API Endpoints   │        │ - Order Status Tracking  │  │</span></span>
<span class="line"><span>│  └──────────────────┘        └──────────────────────────┘  │</span></span>
<span class="line"><span>│          │                              │                    │</span></span>
<span class="line"><span>│          │                              │                    │</span></span>
<span class="line"><span>│          ▼                              ▼                    │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │              Transaction Module                       │  │</span></span>
<span class="line"><span>│  │  - ADD_STOCK / REMOVE_STOCK / DISCARDS / RETURNS     │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>│          │                                                   │</span></span>
<span class="line"><span>│          │                                                   │</span></span>
<span class="line"><span>│          ▼                                                   │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────────────┐  │</span></span>
<span class="line"><span>│  │              Database Layer                           │  │</span></span>
<span class="line"><span>│  │  ws_stock_opname_periods  →  cutoff_date              │  │</span></span>
<span class="line"><span>│  │  ws_stocks                →  cutoff_qty               │  │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────────────┘  │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_3-2-technology-stack" tabindex="-1">3.2 Technology Stack <a class="header-anchor" href="#_3-2-technology-stack" aria-label="Permalink to &quot;3.2 Technology Stack&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Layer</th><th>Technology</th></tr></thead><tbody><tr><td><strong>Runtime</strong></td><td>Node.js / NestJS Framework</td></tr><tr><td><strong>Database</strong></td><td>MySQL (via Kysely query builder)</td></tr><tr><td><strong>Validation</strong></td><td>Zod Schema Validation</td></tr><tr><td><strong>ORM/Query Builder</strong></td><td>Kysely</td></tr><tr><td><strong>Migration</strong></td><td>Kysely Migration</td></tr><tr><td><strong>Transaction Management</strong></td><td>Atomic database transactions</td></tr></tbody></table><hr><h2 id="_4-architecture-design" tabindex="-1">4. Architecture Design <a class="header-anchor" href="#_4-architecture-design" aria-label="Permalink to &quot;4. Architecture Design&quot;">​</a></h2><h3 id="_4-1-high-level-architecture-pattern" tabindex="-1">4.1 High-Level Architecture Pattern <a class="header-anchor" href="#_4-1-high-level-architecture-pattern" aria-label="Permalink to &quot;4.1 High-Level Architecture Pattern&quot;">​</a></h3><p>The feature follows the <strong>Domain-Driven Design (DDD)</strong> pattern with <strong>Clean Architecture</strong> principles:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                     Presentation Layer                       │</span></span>
<span class="line"><span>│  (Controllers, REST APIs, DTOs, Schema Validation)          │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                     Application Layer                        │</span></span>
<span class="line"><span>│  (Use Cases, Services, Orchestration Logic)                  │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                     Domain Layer                             │</span></span>
<span class="line"><span>│  (Business Rules, Entities, Repository Interfaces)           │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                     Infrastructure Layer                     │</span></span>
<span class="line"><span>│  (Repositories, Database Access, External APIs)              │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_4-2-design-principles" tabindex="-1">4.2 Design Principles <a class="header-anchor" href="#_4-2-design-principles" aria-label="Permalink to &quot;4.2 Design Principles&quot;">​</a></h3><ol><li><strong>Single Responsibility</strong>: Each module (order, transaction, stock-opname) handles its own logic</li><li><strong>Dependency Inversion</strong>: High-level modules depend on abstractions (repositories)</li><li><strong>Atomic Operations</strong>: All stock updates use atomic database transactions</li><li><strong>Temporal Consistency</strong>: Cutoff logic is evaluated at runtime based on current timestamp</li><li><strong>Backward Compatibility</strong>: Existing workflows continue to function with conditional updates</li></ol><hr><h2 id="_5-database-schema-design" tabindex="-1">5. Database Schema Design <a class="header-anchor" href="#_5-database-schema-design" aria-label="Permalink to &quot;5. Database Schema Design&quot;">​</a></h2><h3 id="_5-1-entity-relationship-diagram" tabindex="-1">5.1 Entity Relationship Diagram <a class="header-anchor" href="#_5-1-entity-relationship-diagram" aria-label="Permalink to &quot;5.1 Entity Relationship Diagram&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ws_stock_opname_periods (1) ──── can have many ──── (N) ws_stocks</span></span>
<span class="line"><span>         │                                                    │</span></span>
<span class="line"><span>         │ cutoff_date                                        │ cutoff_qty</span></span>
<span class="line"><span>         │                                                    │</span></span>
<span class="line"><span>         └────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="_5-2-table-definitions" tabindex="-1">5.2 Table Definitions <a class="header-anchor" href="#_5-2-table-definitions" aria-label="Permalink to &quot;5.2 Table Definitions&quot;">​</a></h3><h4 id="table-ws-stock-opname-periods" tabindex="-1">Table: <code>ws_stock_opname_periods</code> <a class="header-anchor" href="#table-ws-stock-opname-periods" aria-label="Permalink to &quot;Table: \`ws_stock_opname_periods\`&quot;">​</a></h4><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">CREATE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> TABLE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> ws_stock_opname_periods</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">BIGINT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> PRIMARY KEY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> AUTO_INCREMENT,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    warehouse_id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">BIGINT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> NOT NULL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    month_period </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">INT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> NOT NULL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> CHECK</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (month_period </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">BETWEEN</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> AND</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 12</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    year_period </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">INT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> NOT NULL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> CHECK</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (year_period </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 2000</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    start_date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> DATE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> NOT NULL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    end_date </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">DATE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> NOT NULL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    cutoff_date </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">DATETIME</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> NOT NULL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,  </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- NEW COLUMN</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    status</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> INT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    created_at </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">TIMESTAMP</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> DEFAULT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> CURRENT_TIMESTAMP,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    updated_at </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">TIMESTAMP</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> DEFAULT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> CURRENT_TIMESTAMP </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">ON</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> UPDATE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> CURRENT_TIMESTAMP,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    deleted_at </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">TIMESTAMP</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> NULL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    INDEX</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> idx_warehouse_period (warehouse_id, year_period, month_period),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    INDEX</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> idx_cutoff_date (cutoff_date)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">);</span></span></code></pre></div><p><strong>New Column Rationale</strong>: <code>cutoff_date</code> stores the exact timestamp after which stock quantities become immutable for stock opname reporting purposes.</p><h4 id="table-ws-stocks" tabindex="-1">Table: <code>ws_stocks</code> <a class="header-anchor" href="#table-ws-stocks" aria-label="Permalink to &quot;Table: \`ws_stocks\`&quot;">​</a></h4><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">ALTER</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> TABLE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> ws_stocks </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">ADD</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> COLUMN cutoff_qty DOUBLE UNSIGNED </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">NOT NULL</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> DEFAULT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> AFTER</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> unreceived_qty;</span></span></code></pre></div><p><strong>Column Rationale</strong>: <code>cutoff_qty</code> mirrors the <code>qty</code> field but represents the quantity captured at cutoff time. It updates synchronously with <code>qty</code> until the cutoff date is exceeded.</p><h3 id="_5-3-migration-details" tabindex="-1">5.3 Migration Details <a class="header-anchor" href="#_5-3-migration-details" aria-label="Permalink to &quot;5.3 Migration Details&quot;">​</a></h3><p><strong>Migration File</strong>: <code>1779175342124_add_coloumn_cutoff_date_at_table_ws_stock_opname_periods.ts</code></p><p><strong>Up Migration</strong>:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> async</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> function</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> up</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">db</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Kysely</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">Database</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;)</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Promise</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">void</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt; {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // 1. Add cutoff_date to ws_stock_opname_periods</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> db.schema</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">alterTable</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;ws_stock_opname_periods&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">addColumn</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;cutoff_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">sql</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">\`datetime after end_date\`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">execute</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // 2. Add cutoff_qty to ws_stocks</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> db.schema</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">alterTable</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;ws_stocks&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">addColumn</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">      &quot;cutoff_qty&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">      sql</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">\`double unsigned not null default 0 after unreceived_qty\`</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    )</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">execute</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // 3. Backfill existing stock records</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> sql</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">\`UPDATE ws_stocks SET cutoff_qty = GREATEST(qty, 0) WHERE deleted_at IS NULL\`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">execute</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(db)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p><strong>Down Migration</strong>:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> async</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> function</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> down</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">db</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Kysely</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">Database</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;)</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Promise</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">void</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt; {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> db.schema</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">alterTable</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;ws_stock_opname_periods&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">dropColumn</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;cutoff_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    .</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">execute</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> db.schema.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">alterTable</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;ws_stocks&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">).</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">dropColumn</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;cutoff_qty&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">).</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">execute</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p><strong>Data Backfill Strategy</strong>: Existing stock records are initialized with <code>cutoff_qty = GREATEST(qty, 0)</code> to ensure non-negative values.</p><hr><h2 id="_6-component-architecture" tabindex="-1">6. Component Architecture <a class="header-anchor" href="#_6-component-architecture" aria-label="Permalink to &quot;6. Component Architecture&quot;">​</a></h2><h3 id="_6-1-core-repository-stockopnameperiodrepository" tabindex="-1">6.1 Core Repository: <code>StockOpnamePeriodRepository</code> <a class="header-anchor" href="#_6-1-core-repository-stockopnameperiodrepository" aria-label="Permalink to &quot;6.1 Core Repository: \`StockOpnamePeriodRepository\`&quot;">​</a></h3><p><strong>Location</strong>: <code>apps/main/src/modules/stock-opname-period/stock-opname-period.repository.ts</code></p><p><strong>Primary Responsibility</strong>: Provide cutoff evaluation logic and stock opname period queries.</p><p><strong>Key Method: <code>canUpdateCutoffQty(c: Connection)</code></strong></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">async </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">canUpdateCutoffQty</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c: Connection): </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">Promise</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">boolean</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // 1. Retrieve active stock opname period with cutoff_date</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // 2. Compare current datetime with cutoff_date</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // 3. Return true if current datetime &lt; cutoff_date (can still update)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  //    Return false if current datetime &gt;= cutoff_date (frozen)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p><strong>Logic Flow</strong>:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Input: Database transaction context (c)</span></span>
<span class="line"><span>  ├─► Query: Find active stock opname period for current warehouse</span></span>
<span class="line"><span>  ├─► IF no active period exists</span></span>
<span class="line"><span>  │     └─► RETURN true (no cutoff restriction)</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ├─► Compare: NOW() vs cutoff_date</span></span>
<span class="line"><span>  ├─► IF NOW() &lt; cutoff_date</span></span>
<span class="line"><span>  │     └─► RETURN true (allow cutoff_qty updates)</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  └─► ELSE (NOW() &gt;= cutoff_date)</span></span>
<span class="line"><span>        └─► RETURN false (freeze cutoff_qty)</span></span></code></pre></div><h3 id="_6-2-module-integration-map" tabindex="-1">6.2 Module Integration Map <a class="header-anchor" href="#_6-2-module-integration-map" aria-label="Permalink to &quot;6.2 Module Integration Map&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Module</th><th>File</th><th>Integration Point</th></tr></thead><tbody><tr><td><strong>Stock Opname Period</strong></td><td><code>stock-opname-period.module.ts</code></td><td>Core: Manages cutoff_date field</td></tr><tr><td><strong>Order Central Delivery</strong></td><td><code>order-central-delivery.module.ts</code></td><td>Updates <code>cutoff_qty</code> on vendor stock fulfillment</td></tr><tr><td><strong>Order Status Fulfilled</strong></td><td><code>order-status-fulfilled.module.ts</code></td><td>Applies delta to <code>cutoff_qty</code> on customer stock fulfillment</td></tr><tr><td><strong>Order Status Ship</strong></td><td><code>order-status-ship.module.ts</code></td><td>Updates <code>cutoff_qty</code> during shipment</td></tr><tr><td><strong>Transaction Module</strong></td><td><code>transaction.module.ts</code></td><td>Updates <code>cutoff_qty</code> across all transaction types</td></tr><tr><td><strong>Consumption Module</strong></td><td><code>consumption.module.ts</code></td><td>Manages cutoff_qty on consumptions</td></tr><tr><td><strong>Master Data Export</strong></td><td>Export services</td><td>Includes cutoff_date in exports</td></tr></tbody></table><hr><h2 id="_7-integration-points" tabindex="-1">7. Integration Points <a class="header-anchor" href="#_7-integration-points" aria-label="Permalink to &quot;7. Integration Points&quot;">​</a></h2><h3 id="_7-1-order-fulfillment-integration-order-central-delivery" tabindex="-1">7.1 Order Fulfillment Integration (<code>order-central-delivery</code>) <a class="header-anchor" href="#_7-1-order-fulfillment-integration-order-central-delivery" aria-label="Permalink to &quot;7.1 Order Fulfillment Integration (\`order-central-delivery\`)&quot;">​</a></h3><p><strong>Trigger</strong>: When a central delivery order is processed and vendor stock is deducted.</p><p><strong>Behavior</strong>:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Check if cutoff_qty updates are allowed</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> canUpdateCutoffQty</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.stockOpnamePeriodRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">canUpdateCutoffQty</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Calculate new quantities</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> newVendorQty</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(vendorStock.qty) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">-</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(child.ordered_qty)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Prepare update payload</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> updateData</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  qty: newVendorQty,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  in_transit_qty: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">Number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(vendorStock.in_transit_qty) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">+</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(child.ordered_qty),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // ... other fields</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Conditionally include cutoff_qty</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (canUpdateCutoffQty) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  updateData.cutoff_qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> newVendorQty</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Execute update</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.stockRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">update</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, updateData, { id: vendorStock.id })</span></span></code></pre></div><p><strong>Business Rule</strong>: Vendor stock <code>cutoff_qty</code> is updated only if the current date is before the cutoff date.</p><h3 id="_7-2-order-fulfillment-customer-stock-order-status-fulfilled" tabindex="-1">7.2 Order Fulfillment Customer Stock (<code>order-status-fulfilled</code>) <a class="header-anchor" href="#_7-2-order-fulfillment-customer-stock-order-status-fulfilled" aria-label="Permalink to &quot;7.2 Order Fulfillment Customer Stock (\`order-status-fulfilled\`)&quot;">​</a></h3><p><strong>Trigger</strong>: When an order is marked as fulfilled (received by customer).</p><p><strong>Atomic SQL Pattern</strong>:</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">UPDATE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> ws_stocks </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">SET</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">+</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> qty_delta,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  unreceived_qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> GREATEST</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(unreceived_qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">+</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> unreceived_qty_delta, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  cutoff_qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> GREATEST</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">COALESCE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">NULLIF</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(cutoff_qty, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">), qty) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">+</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> cutoff_qty_delta, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">WHERE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> ?</span></span></code></pre></div><p><strong>Key Logic</strong>:</p><ul><li><code>COALESCE(NULLIF(cutoff_qty, 0), qty)</code> handles initialization: if <code>cutoff_qty</code> is 0 (not yet set), it uses current <code>qty</code> as baseline</li><li><code>GREATEST(..., 0)</code> ensures non-negative quantities (safety constraint)</li><li><code>cutoff_qty_delta</code> is applied only when <code>canUpdateCutoffQty</code> returns true</li></ul><h3 id="_7-3-transaction-module-integration" tabindex="-1">7.3 Transaction Module Integration <a class="header-anchor" href="#_7-3-transaction-module-integration" aria-label="Permalink to &quot;7.3 Transaction Module Integration&quot;">​</a></h3><p><strong>Scope</strong>: All transaction types in <code>TransactionModule</code></p><p><strong>Transaction Types Affected</strong>:</p><ol><li><strong>ADD_STOCK</strong> - Stock intake/entry</li><li><strong>REMOVE_STOCK</strong> - Stock withdrawal</li><li><strong>DISCARDS</strong> - Broken/damaged items</li><li><strong>RETURN</strong> - Customer returns</li><li><strong>CANCEL_DISCARD</strong> - Cancellation of previous discard</li><li><strong>PROGRAM_STOCK</strong> - Program/asset stock allocation</li></ol><p><strong>Pattern Applied</strong>:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// For each transaction processing method</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> canUpdateCutoffQty</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.stockOpnamePeriodRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">canUpdateCutoffQty</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// During stock update</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.stockRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">update</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c, {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  qty: qty.newQty,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  ...</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(canUpdateCutoffQty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { cutoff_qty: qty.newQty } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {})</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}, { id: stockId })</span></span></code></pre></div><h3 id="_7-4-consumption-module-integration" tabindex="-1">7.4 Consumption Module Integration <a class="header-anchor" href="#_7-4-consumption-module-integration" aria-label="Permalink to &quot;7.4 Consumption Module Integration&quot;">​</a></h3><p><strong>Feature</strong>: <code>cutoff_qty</code> management within consumption workflows<br><strong>Commit</strong>: <code>002e21785</code> (May 21, 2026)</p><hr><h2 id="_8-data-flow" tabindex="-1">8. Data Flow <a class="header-anchor" href="#_8-data-flow" aria-label="Permalink to &quot;8. Data Flow&quot;">​</a></h2><h3 id="_8-1-cutoff-qty-update-flow-before-cutoff-date" tabindex="-1">8.1 Cutoff Qty Update Flow (Before Cutoff Date) <a class="header-anchor" href="#_8-1-cutoff-qty-update-flow-before-cutoff-date" aria-label="Permalink to &quot;8.1 Cutoff Qty Update Flow (Before Cutoff Date)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Transaction Trigger (Order Fulfillment, Stock Update, etc.)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>canUpdateCutoffQty(connection)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├─► Query active stock opname period</span></span>
<span class="line"><span>    │   WHERE NOW() &lt; cutoff_date</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>true (can update)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>Update ws_stocks SET</span></span>
<span class="line"><span>  qty = newQty,</span></span>
<span class="line"><span>  cutoff_qty = newQty  ← MIRRORS qty</span></span></code></pre></div><h3 id="_8-2-cutoff-qty-freeze-flow-after-cutoff-date" tabindex="-1">8.2 Cutoff Qty Freeze Flow (After Cutoff Date) <a class="header-anchor" href="#_8-2-cutoff-qty-freeze-flow-after-cutoff-date" aria-label="Permalink to &quot;8.2 Cutoff Qty Freeze Flow (After Cutoff Date)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Transaction Trigger (Order Fulfillment, Stock Update, etc.)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>canUpdateCutoffQty(connection)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├─► Query active stock opname period</span></span>
<span class="line"><span>    │   WHERE NOW() &gt;= cutoff_date</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>false (cannot update)</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>Update ws_stocks SET</span></span>
<span class="line"><span>  qty = newQty           ← REAL-TIME quantity changes</span></span>
<span class="line"><span>  -- cutoff_qty unchanged (frozen)</span></span></code></pre></div><h3 id="_8-3-stock-opname-period-creation-flow" tabindex="-1">8.3 Stock Opname Period Creation Flow <a class="header-anchor" href="#_8-3-stock-opname-period-creation-flow" aria-label="Permalink to &quot;8.3 Stock Opname Period Creation Flow&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>API Request: CreateStockOpnamePeriodRequest</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├─► Zod Validation: cutoff_date between start_date and end_date</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>Transform payload:</span></span>
<span class="line"><span>  cutoff_date: \`\${data.cutoff_date} 16:59:59\`</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ▼</span></span>
<span class="line"><span>Insert into ws_stock_opname_periods</span></span>
<span class="line"><span>  (includes cutoff_date field)</span></span></code></pre></div><hr><h2 id="_9-validation-business-rules" tabindex="-1">9. Validation &amp; Business Rules <a class="header-anchor" href="#_9-validation-business-rules" aria-label="Permalink to &quot;9. Validation &amp; Business Rules&quot;">​</a></h2><h3 id="_9-1-zod-validation-schema" tabindex="-1">9.1 Zod Validation Schema <a class="header-anchor" href="#_9-1-zod-validation-schema" aria-label="Permalink to &quot;9.1 Zod Validation Schema&quot;">​</a></h3><p><strong>File</strong>: <code>apps/main/src/modules/stock-opname-period/stock-opname-period.schema.ts</code></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> CreateStockOpnamePeriodRequest</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> z.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">object</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  warehouse_id: z.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">int</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">positive</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  month_period: z.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">int</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">min</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">).</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">max</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">12</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  year_period: z.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">int</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">min</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2000</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  start_date: z.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  end_date: z.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  cutoff_date: z.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(),  </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// NEW: Required field</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  status: z.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">int</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">optional</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}).</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">superRefine</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">((</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">val</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Existing: start_date must be &lt;= end_date</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(val.start_date) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(val.end_date)) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    c.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">addIssue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      code: z.ZodIssueCode.custom,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      message: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;validator.end_date_before_start_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      path: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;end_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    })</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // NEW: cutoff_date must be &gt;= start_date</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(val.cutoff_date) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(val.start_date)) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    c.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">addIssue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      code: z.ZodIssueCode.custom,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      message: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;validator.cutoff_date_before_start_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      path: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;cutoff_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    })</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // NEW: cutoff_date must be &lt;= end_date</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(val.cutoff_date) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(val.end_date)) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    c.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">addIssue</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      code: z.ZodIssueCode.custom,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      message: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;validator.cutoff_date_after_end_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      path: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;cutoff_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    })</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">})</span></span></code></pre></div><h3 id="_9-2-business-rules-summary" tabindex="-1">9.2 Business Rules Summary <a class="header-anchor" href="#_9-2-business-rules-summary" aria-label="Permalink to &quot;9.2 Business Rules Summary&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Rule #</th><th>Rule Description</th><th>Enforcement Location</th></tr></thead><tbody><tr><td>BR-001</td><td><code>cutoff_date</code> must be within <code>[start_date, end_date]</code></td><td>API Schema Validation</td></tr><tr><td>BR-002</td><td><code>cutoff_qty</code> updates only allowed when <code>NOW() &lt; cutoff_date</code></td><td>Repository <code>canUpdateCutoffQty()</code></td></tr><tr><td>BR-003</td><td><code>cutoff_qty</code> cannot be negative (uses <code>GREATEST(..., 0)</code>)</td><td>Database Update Query</td></tr><tr><td>BR-004</td><td><code>cutoff_qty</code> initialization uses current <code>qty</code> if not set</td><td>Fulfillment Repository</td></tr><tr><td>BR-005</td><td>Time component of <code>cutoff_date</code> is set to <code>16:59:59</code> (end of business day)</td><td>Payload Transformation</td></tr><tr><td>BR-006</td><td>Migration backfills <code>cutoff_qty = GREATEST(qty, 0)</code> for existing data</td><td>Database Migration</td></tr></tbody></table><hr><h2 id="_10-deployment-considerations" tabindex="-1">10. Deployment Considerations <a class="header-anchor" href="#_10-deployment-considerations" aria-label="Permalink to &quot;10. Deployment Considerations&quot;">​</a></h2><h3 id="_10-1-pre-deployment-checklist" tabindex="-1">10.1 Pre-Deployment Checklist <a class="header-anchor" href="#_10-1-pre-deployment-checklist" aria-label="Permalink to &quot;10.1 Pre-Deployment Checklist&quot;">​</a></h3><ol><li><p><strong>Database Migration</strong>:</p><ul><li>[ ] Run migration <code>1779175342124_add_coloumn_cutoff_date_at_table_ws_stock_opname_periods.ts</code></li><li>[ ] Verify <code>cutoff_qty</code> backfill completed successfully</li><li>[ ] Verify indexes created on <code>ws_stock_opname_periods.cutoff_date</code></li></ul></li><li><p><strong>Code Deployment Order</strong>:</p><ul><li>[ ] Deploy Stock Opname Period module (repository + controller)</li><li>[ ] Deploy Order modules (central-delivery, order-status-fulfilled, order-status-ship)</li><li>[ ] Deploy Transaction module</li><li>[ ] Deploy Consumption module</li><li>[ ] Deploy Export services</li></ul></li><li><p><strong>Configuration</strong>:</p><ul><li>[ ] No new environment variables required</li><li>[ ] Verify database connection supports datetime precision</li></ul></li></ol><h3 id="_10-2-rollback-strategy" tabindex="-1">10.2 Rollback Strategy <a class="header-anchor" href="#_10-2-rollback-strategy" aria-label="Permalink to &quot;10.2 Rollback Strategy&quot;">​</a></h3><p><strong>Option 1: Feature Flag</strong> (Recommended)</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> canUpdateCutoffQty</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> process.env.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">ENABLE_CUTOFF_QTY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> ===</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;true&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  ?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.stockOpnamePeriodRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">canUpdateCutoffQty</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(c)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  :</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> true</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">  // Force true to maintain old behavior</span></span></code></pre></div><p><strong>Option 2: Database Rollback</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Execute down migration</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">kysely</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate:down</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> 1779175342124_add_coloumn_cutoff_date_at_table_ws_stock_opname_periods</span></span></code></pre></div><p><strong>Option 3: Code Rollback</strong></p><ul><li>Revert commits in reverse chronological order using git revert</li></ul><h3 id="_10-3-performance-considerations" tabindex="-1">10.3 Performance Considerations <a class="header-anchor" href="#_10-3-performance-considerations" aria-label="Permalink to &quot;10.3 Performance Considerations&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Concern</th><th>Mitigation</th></tr></thead><tbody><tr><td><code>canUpdateCutoffQty()</code> called on every transaction</td><td>Add database index on <code>ws_stock_opname_periods.cutoff_date</code></td></tr><tr><td>Large batch updates</td><td>Use atomic SQL operations, not row-by-row updates</td></tr><tr><td>Concurrent transaction processing</td><td>Database-level locking via Kysely transactions</td></tr></tbody></table><hr><h2 id="_11-testing-strategy" tabindex="-1">11. Testing Strategy <a class="header-anchor" href="#_11-testing-strategy" aria-label="Permalink to &quot;11. Testing Strategy&quot;">​</a></h2><h3 id="_11-1-unit-tests" tabindex="-1">11.1 Unit Tests <a class="header-anchor" href="#_11-1-unit-tests" aria-label="Permalink to &quot;11.1 Unit Tests&quot;">​</a></h3><p><strong>Target</strong>: <code>StockOpnamePeriodRepository.canUpdateCutoffQty()</code></p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">describe</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;canUpdateCutoffQty&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, () </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  it</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;should return true when no active stock opname period exists&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  it</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;should return true when NOW() &lt; cutoff_date&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  it</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;should return false when NOW() &gt;= cutoff_date&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  it</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;should handle edge case: NOW() exactly equals cutoff_date&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">})</span></span></code></pre></div><h3 id="_11-2-integration-tests" tabindex="-1">11.2 Integration Tests <a class="header-anchor" href="#_11-2-integration-tests" aria-label="Permalink to &quot;11.2 Integration Tests&quot;">​</a></h3><p><strong>Scenario 1: Order Fulfillment Before Cutoff</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Setup: Create stock opname period with cutoff_date = tomorrow</span></span>
<span class="line"><span>Action: Process order fulfillment</span></span>
<span class="line"><span>Assert: Both qty and cutoff_qty are updated</span></span></code></pre></div><p><strong>Scenario 2: Order Fulfillment After Cutoff</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Setup: Create stock opname period with cutoff_date = yesterday</span></span>
<span class="line"><span>Action: Process order fulfillment</span></span>
<span class="line"><span>Assert: qty is updated, cutoff_qty remains unchanged</span></span></code></pre></div><p><strong>Scenario 3: Stock Opname Period Creation</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Action: POST /api/stock-opname-period with cutoff_date</span></span>
<span class="line"><span>Assert: Validation error when cutoff_date &gt; end_date</span></span>
<span class="line"><span>Assert: Validation error when cutoff_date &lt; start_date</span></span>
<span class="line"><span>Assert: Success when cutoff_date within range</span></span></code></pre></div><h3 id="_11-3-end-to-end-tests" tabindex="-1">11.3 End-to-End Tests <a class="header-anchor" href="#_11-3-end-to-end-tests" aria-label="Permalink to &quot;11.3 End-to-End Tests&quot;">​</a></h3><ol><li><strong>Full Workflow: Create Period → Process Transactions → Verify Cutoff</strong></li><li><strong>Regression: Ensure existing transaction flows are not broken</strong></li><li><strong>Export Validation: Verify cutoff_date appears in master data exports</strong></li></ol><h3 id="_11-4-data-integrity-tests" tabindex="-1">11.4 Data Integrity Tests <a class="header-anchor" href="#_11-4-data-integrity-tests" aria-label="Permalink to &quot;11.4 Data Integrity Tests&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- Verify no negative cutoff_qty values</span></span>
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
	})}">FROM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> ws_stocks </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">WHERE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> cutoff_qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- Verify cutoff_qty initialized correctly</span></span>
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
	})}">FROM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> ws_stocks </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">WHERE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> cutoff_qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> AND</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- Verify cutoff_date constraints</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">SELECT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> *</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> FROM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> ws_stock_opname_periods </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">WHERE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> cutoff_date </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> start_date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> OR</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> cutoff_date </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> end_date;</span></span></code></pre></div><hr><h2 id="_12-commit-history" tabindex="-1">12. Commit History <a class="header-anchor" href="#_12-commit-history" aria-label="Permalink to &quot;12. Commit History&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Date</th><th>Commit</th><th>Description</th></tr></thead><tbody><tr><td>May 20, 2026</td><td><code>f5de292c</code></td><td>Add payload cutoff_date when creating stock opname period</td></tr><tr><td>May 20, 2026</td><td><code>f7d2bfcf</code></td><td>Add UPDATE query for cutoff_qty backfill in migration</td></tr><tr><td>May 20, 2026</td><td><code>1b3ec8f9</code></td><td>Update cutoff_qty on order fulfillment (central delivery)</td></tr><tr><td>May 20, 2026</td><td><code>d8e38275</code></td><td>Update cutoff_qty on order status flow</td></tr><tr><td>May 20, 2026</td><td><code>fd78f1b0</code></td><td>Duplicate migration fix for cutoff_qty</td></tr><tr><td>May 21, 2026</td><td><code>002e2178</code></td><td>Implementation cutoff_qty on module consumptions</td></tr><tr><td>May 21, 2026</td><td><code>44627750</code></td><td>Implementation update cutoff_qty on module transactions</td></tr><tr><td>May 21, 2026</td><td><code>48a66283</code></td><td>Duplicate transaction module implementation</td></tr><tr><td>May 21, 2026</td><td><code>b9f873ae</code></td><td>Duplicate consumption module implementation</td></tr><tr><td>May 21, 2026</td><td><code>e84a1e11</code></td><td>Duplicate cutoff hours fix</td></tr><tr><td>May 22, 2026</td><td><code>017de79d</code></td><td>Duplicate cutoff_date payload commit</td></tr><tr><td>May 22, 2026</td><td><code>1e06501f</code></td><td>Duplicate period_id fix for cutoff_qty retrieval</td></tr><tr><td>May 22, 2026</td><td><code>d8e38275</code></td><td>Duplicate cutoff_qty sales order logic</td></tr><tr><td>May 25, 2026</td><td><code>66f3bf37</code></td><td>Add hours to cutoff_date time component</td></tr><tr><td>May 25, 2026</td><td><code>e84a1e11</code></td><td>Duplicate hours fix</td></tr><tr><td>Jun 02, 2026</td><td><code>fbf4a2e8</code></td><td>Fix cutoff date validation when updating cutoff_qty</td></tr><tr><td>Jun 02, 2026</td><td><code>48209f69</code></td><td>Add cutoff date to master data exports</td></tr><tr><td>Jun 02, 2026</td><td><code>75d27e0a</code></td><td>Duplicate master data export cutoff date</td></tr></tbody></table><hr><h2 id="_13-future-enhancements" tabindex="-1">13. Future Enhancements <a class="header-anchor" href="#_13-future-enhancements" aria-label="Permalink to &quot;13. Future Enhancements&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Enhancement</th><th>Description</th><th>Priority</th></tr></thead><tbody><tr><td><strong>Cutoff Date History</strong></td><td>Track changes to cutoff dates for audit purposes</td><td>Medium</td></tr><tr><td><strong>Partial Cutoff</strong></td><td>Support per-material or per-category cutoff dates</td><td>Low</td></tr><tr><td><strong>Cutoff Notification</strong></td><td>Notify warehouse managers before cutoff date</td><td>Medium</td></tr><tr><td><strong>Batch Cutoff Update</strong></td><td>Recalculate cutoff_qty for completed periods</td><td>Low</td></tr><tr><td><strong>Analytics Dashboard</strong></td><td>Show variance between qty and cutoff_qty</td><td>High</td></tr></tbody></table><hr><h2 id="appendix-a-error-handling" tabindex="-1">Appendix A: Error Handling <a class="header-anchor" href="#appendix-a-error-handling" aria-label="Permalink to &quot;Appendix A: Error Handling&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Scenario</th><th>Error Type</th><th>HTTP Status</th><th>User Message</th></tr></thead><tbody><tr><td><code>cutoff_date</code> &gt; <code>end_date</code></td><td>ValidationError</td><td>400</td><td>&quot;validator.cutoff_date_after_end_date&quot;</td></tr><tr><td><code>cutoff_date</code> &lt; <code>start_date</code></td><td>ValidationError</td><td>400</td><td>&quot;validator.cutoff_date_before_start_date&quot;</td></tr><tr><td>No active stock opname period</td><td>N/A</td><td>N/A</td><td>Returns <code>canUpdateCutoffQty = true</code></td></tr><tr><td><code>cutoff_qty</code> &lt; 0 (attempted)</td><td>Safety Guard</td><td>N/A</td><td>Prevented by <code>GREATEST(..., 0)</code></td></tr></tbody></table><hr><h2 id="appendix-b-monitoring-observability" tabindex="-1">Appendix B: Monitoring &amp; Observability <a class="header-anchor" href="#appendix-b-monitoring-observability" aria-label="Permalink to &quot;Appendix B: Monitoring &amp; Observability&quot;">​</a></h2><h3 id="key-metrics-to-track" tabindex="-1">Key Metrics to Track <a class="header-anchor" href="#key-metrics-to-track" aria-label="Permalink to &quot;Key Metrics to Track&quot;">​</a></h3><ol><li><strong>Transaction Success Rate</strong>: % of transactions that successfully update <code>cutoff_qty</code></li><li><strong>Cutoff Freeze Events</strong>: Count of transactions after cutoff date (should not update <code>cutoff_qty</code>)</li><li><strong>Migration Duration</strong>: Time taken for <code>cutoff_qty</code> backfill</li><li><strong>Validation Errors</strong>: Count of <code>cutoff_date</code> validation failures</li></ol><h3 id="logging-points" tabindex="-1">Logging Points <a class="header-anchor" href="#logging-points" aria-label="Permalink to &quot;Logging Points&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// In canUpdateCutoffQty</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">logger.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">info</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Cutoff evaluation&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  warehouseId,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  cutoffDate,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  currentTime: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  canUpdate: result</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">})</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// In transaction handlers</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">!</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">canUpdateCutoffQty) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  logger.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">warn</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Cutoff freeze active - cutoff_qty not updated&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    stockId,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    transactionType,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    cutoffDate,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    currentTime: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  })</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><hr><p><strong>End of Document</strong></p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/cutoff-stock-opname-architecture.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var cutoff_stock_opname_architecture_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, cutoff_stock_opname_architecture_default as default };
