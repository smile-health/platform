import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/audit-trail.md
var __pageData = JSON.parse("{\"title\":\"Audit Trail Implementation Plan\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/audit-trail.md\",\"filePath\":\"architecture/audit-trail.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/audit-trail.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="audit-trail-implementation-plan" tabindex="-1">Audit Trail Implementation Plan <a class="header-anchor" href="#audit-trail-implementation-plan" aria-label="Permalink to &quot;Audit Trail Implementation Plan&quot;">​</a></h1><p><strong>Status</strong>: <code>PLANNED — NOT IMPLEMENTED</code><br><strong>Date</strong>: February 26, 2026 (plan) · verified still unimplemented September 2026</p><p><strong>Author</strong>: Platform Architecture Team<br><strong>Version</strong>: 1.0</p><blockquote><p><strong>Belum diimplementasi.</strong> Rencana ini disetujui Feb 2026 tapi tidak pernah dibangun: nol kemunculan <code>AsyncLocalStorage</code> di <code>apps/</code> maupun <code>packages/</code>, dan tidak ada tabel audit ClickHouse di <code>apps/main</code> atau <code>apps/core</code>. <a href="https://github.com/smile-health/platform/blob/main/apps/interop-service/src/modules/audit/audit-log.repository.ts" target="_blank" rel="noreferrer"><code>apps/interop-service/src/modules/audit/audit-log.repository.ts</code></a> itu audit pesan interop — hal yang berbeda, bukan implementasi dokumen ini.</p></blockquote><h2 id="executive-summary" tabindex="-1">Executive Summary <a class="header-anchor" href="#executive-summary" aria-label="Permalink to &quot;Executive Summary&quot;">​</a></h2><p>This document outlines the implementation plan for a comprehensive audit trail system in the SMILE platform backend. The system will track all user actions, maintain detailed logs for compliance and security, and enable detection of unusual activities through a scalable, non-blocking architecture.</p><h2 id="_1-architecture-decision" tabindex="-1">1. Architecture Decision <a class="header-anchor" href="#_1-architecture-decision" aria-label="Permalink to &quot;1. Architecture Decision&quot;">​</a></h2><h3 id="database-selection-clickhouse" tabindex="-1">Database Selection: ClickHouse <a class="header-anchor" href="#database-selection-clickhouse" aria-label="Permalink to &quot;Database Selection: ClickHouse&quot;">​</a></h3><p><strong>Decision</strong>: Use ClickHouse as the primary audit log storage.</p><p><strong>Rationale</strong>:</p><ul><li>Already installed in the platform (<code>@clickhouse/client</code>)</li><li>Columnar database optimized for append-only, time-series data</li><li>Excellent compression ratios (10-100x)</li><li>Fast aggregations for anomaly detection</li><li>Superior performance for high-volume write operations</li></ul><h3 id="message-queue-rabbitmq" tabindex="-1">Message Queue: RabbitMQ <a class="header-anchor" href="#message-queue-rabbitmq" aria-label="Permalink to &quot;Message Queue: RabbitMQ&quot;">​</a></h3><p><strong>Decision</strong>: Use RabbitMQ for asynchronous audit event processing.</p><p><strong>Rationale</strong>:</p><ul><li>Already integrated (<code>amqplib</code>)</li><li>Decouples audit logging from request lifecycle</li><li>Prevents audit logging from impacting API response times</li><li>Enables batch processing for efficiency</li><li>Provides reliability and message persistence</li></ul><h3 id="context-propagation-asynclocalstorage" tabindex="-1">Context Propagation: AsyncLocalStorage <a class="header-anchor" href="#context-propagation-asynclocalstorage" aria-label="Permalink to &quot;Context Propagation: AsyncLocalStorage&quot;">​</a></h3><p><strong>Decision</strong>: Use Node.js/Bun native <code>AsyncLocalStorage</code> for context propagation.</p><p><strong>Rationale</strong>:</p><ul><li>Native feature, no additional dependencies</li><li>Automatically propagates user context through async call chains</li><li>Eliminates need to pass <code>userId</code>, <code>ipAddress</code>, <code>traceId</code> as function parameters</li><li>Clean separation of concerns</li></ul><h2 id="_2-system-architecture" tabindex="-1">2. System Architecture <a class="header-anchor" href="#_2-system-architecture" aria-label="Permalink to &quot;2. System Architecture&quot;">​</a></h2><h3 id="data-flow" tabindex="-1">Data Flow <a class="header-anchor" href="#data-flow" aria-label="Permalink to &quot;Data Flow&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-132",
				class: "mermaid",
				graph: "sequenceDiagram%0A%20%20%20%20participant%20User%0A%20%20%20%20participant%20Hono%20as%20Hono%20API%20Server%0A%20%20%20%20participant%20Middleware%0A%20%20%20%20participant%20Service%20as%20Business%20Service%0A%20%20%20%20participant%20Audit%20as%20Audit%20Service%0A%20%20%20%20participant%20Queue%20as%20RabbitMQ%20(audit.events)%0A%20%20%20%20participant%20Worker%20as%20Background%20Worker%0A%20%20%20%20participant%20DB%20as%20ClickHouse%20DB%0A%0A%20%20%20%20User-%3E%3EHono%3A%20HTTP%20Request%20(e.g.%2C%20PUT%20%2Fstocks%2F456)%0A%20%20%20%20Hono-%3E%3EMiddleware%3A%20Intercept%20Request%0A%20%20%20%20Middleware-%3E%3EMiddleware%3A%20Extract%20userId%2C%20IP%2C%20traceId%0A%20%20%20%20Middleware-%3E%3EMiddleware%3A%20Store%20in%20AsyncLocalStorage%0A%20%20%20%20Middleware-%3E%3EService%3A%20Proceed%20to%20Route%20Handler%0A%20%20%20%20%0A%20%20%20%20Service-%3E%3EService%3A%20Execute%20Business%20Logic%20(Update%20Stock)%0A%20%20%20%20%0A%20%20%20%20alt%20If%20explicit%20audit%20required%0A%20%20%20%20%20%20%20%20Service-%3E%3EAudit%3A%20log(action%2C%20entity%2C%20oldData%2C%20newData)%0A%20%20%20%20%20%20%20%20Audit-%3E%3EMiddleware%3A%20Get%20Context%20(userId%2C%20IP%2C%20traceId)%0A%20%20%20%20%20%20%20%20Audit-%3E%3EQueue%3A%20Publish%20Audit%20Event%0A%20%20%20%20end%0A%0A%20%20%20%20Service--%3E%3EHono%3A%20Return%20Result%0A%20%20%20%20Hono--%3E%3EUser%3A%20HTTP%20Response%20(200%20OK)%0A%0A%20%20%20%20note%20over%20Queue%2C%20DB%3A%20Asynchronous%20Background%20Process%0A%20%20%20%20Queue--%3E%3EWorker%3A%20Consume%20Audit%20Events%0A%20%20%20%20Worker-%3E%3EWorker%3A%20Batch%20Events%20(100-1000%20records)%0A%20%20%20%20Worker-%3E%3EDB%3A%20Bulk%20Insert%20Logs%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="component-breakdown" tabindex="-1">Component Breakdown <a class="header-anchor" href="#component-breakdown" aria-label="Permalink to &quot;Component Breakdown&quot;">​</a></h3><ol><li><p><strong>Hono Middleware (Coarse-grained)</strong></p><ul><li>Captures all HTTP requests</li><li>Extracts: method, path, status code, user agent, IP</li><li>Stores context in AsyncLocalStorage</li><li>Logs generic access patterns</li></ul></li><li><p><strong>Service-Level Logging (Fine-grained)</strong></p><ul><li>Explicit audit calls for critical operations</li><li>Captures: entity type, entity ID, old values, new values</li><li>Business-specific context and metadata</li></ul></li><li><p><strong>Audit Service</strong></p><ul><li>Retrieves context from AsyncLocalStorage</li><li>Constructs audit event payload</li><li>Publishes to RabbitMQ queue</li></ul></li><li><p><strong>Background Worker</strong></p><ul><li>Consumes events from RabbitMQ</li><li>Batches events (configurable batch size)</li><li>Bulk inserts into ClickHouse</li><li>Handles retry logic and error recovery</li></ul></li></ol><h2 id="_3-implementation-action-items" tabindex="-1">3. Implementation Action Items <a class="header-anchor" href="#_3-implementation-action-items" aria-label="Permalink to &quot;3. Implementation Action Items&quot;">​</a></h2><h3 id="infrastructure-setup" tabindex="-1">Infrastructure Setup <a class="header-anchor" href="#infrastructure-setup" aria-label="Permalink to &quot;Infrastructure Setup&quot;">​</a></h3><ul><li>[ ] Create ClickHouse database and table schema</li><li>[ ] Set up RabbitMQ queue (<code>audit.events</code>)</li><li>[ ] Implement AsyncLocalStorage context manager</li><li>[ ] Create base audit service infrastructure</li></ul><h3 id="core-audit-module" tabindex="-1">Core Audit Module <a class="header-anchor" href="#core-audit-module" aria-label="Permalink to &quot;Core Audit Module&quot;">​</a></h3><ul><li>[ ] Create <code>apps/main/src/modules/audit-trail/</code> module</li><li>[ ] Implement audit schema with Zod validation</li><li>[ ] Build audit controller with Hono routing</li><li>[ ] Create audit repository for ClickHouse queries</li><li>[ ] Implement audit publisher for RabbitMQ</li></ul><h3 id="middleware-integration" tabindex="-1">Middleware Integration <a class="header-anchor" href="#middleware-integration" aria-label="Permalink to &quot;Middleware Integration&quot;">​</a></h3><ul><li>[ ] Create global Hono middleware for request tracking</li><li>[ ] Implement AsyncLocalStorage context injection</li><li>[ ] Add middleware to main server configuration</li><li>[ ] Test context propagation across async boundaries</li></ul><h3 id="background-worker" tabindex="-1">Background Worker <a class="header-anchor" href="#background-worker" aria-label="Permalink to &quot;Background Worker&quot;">​</a></h3><ul><li>[ ] Create audit worker consumer</li><li>[ ] Implement batch processing logic</li><li>[ ] Add error handling and retry mechanisms</li><li>[ ] Configure worker in existing worker infrastructure</li></ul><h3 id="service-integration" tabindex="-1">Service Integration <a class="header-anchor" href="#service-integration" aria-label="Permalink to &quot;Service Integration&quot;">​</a></h3><ul><li>[ ] Identify critical operations to audit</li><li>[ ] Add explicit audit calls to services</li><li>[ ] Implement change tracking (old vs new values)</li><li>[ ] Test audit coverage</li></ul><h3 id="query-analytics" tabindex="-1">Query &amp; Analytics <a class="header-anchor" href="#query-analytics" aria-label="Permalink to &quot;Query &amp; Analytics&quot;">​</a></h3><ul><li>[ ] Implement audit log query endpoints</li><li>[ ] Add filtering capabilities (user, date, action, entity)</li><li>[ ] Create anomaly detection queries</li><li>[ ] Build audit dashboard API</li></ul><h3 id="testing-documentation" tabindex="-1">Testing &amp; Documentation <a class="header-anchor" href="#testing-documentation" aria-label="Permalink to &quot;Testing &amp; Documentation&quot;">​</a></h3><ul><li>[ ] Unit tests for all components</li><li>[ ] Integration tests for end-to-end flow</li><li>[ ] Performance testing (load testing)</li><li>[ ] Documentation and runbooks</li></ul><h2 id="_4-database-schema" tabindex="-1">4. Database Schema <a class="header-anchor" href="#_4-database-schema" aria-label="Permalink to &quot;4. Database Schema&quot;">​</a></h2><h3 id="clickhouse-table-structure" tabindex="-1">ClickHouse Table Structure <a class="header-anchor" href="#clickhouse-table-structure" aria-label="Permalink to &quot;ClickHouse Table Structure&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">CREATE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> TABLE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> IF</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> NOT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> EXISTS</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> audit_logs (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    id UUID </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">DEFAULT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> generateUUIDv4(),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    timestamp</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> DateTime64(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">3</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">DEFAULT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> now64(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">3</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    trace_id String,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    user_id UInt32,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    user_name String,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    ip_address String,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    user_agent String,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    -- Request details</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    request_method String,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    request_path String,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    request_query String,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    request_body String,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    -- Action details</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    action</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> String,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    entity String,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    entity_id UInt32,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    -- Changes</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    old_data String,  </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- JSON</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    new_data String,  </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- JSON</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    changes</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> String,   </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- JSON diff</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    -- Response</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    status_code UInt16,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    response_time_ms UInt32,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    -- Metadata</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    program_id Nullable(UInt32),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    activity_id Nullable(UInt32),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    error_message Nullable(String),</span></span>
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
	})}"> idx_timestamp </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">timestamp</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> TYPE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> minmax GRANULARITY </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    INDEX</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> idx_user_id user_id </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">TYPE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> set</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">100</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) GRANULARITY </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    INDEX</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> idx_action </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">action</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> TYPE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> set</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">100</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) GRANULARITY </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    INDEX</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> idx_entity entity </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">TYPE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> set</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">100</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) GRANULARITY </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) ENGINE </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> MergeTree()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">PARTITION</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> BY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> toYYYYMM(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">timestamp</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">ORDER BY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">timestamp</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, user_id, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">action</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">);</span></span></code></pre></div><blockquote><p><strong>Note</strong>: This schema is an example and should be adjusted based on your specific requirements. Consider adding TTL (Time To Live) for data retention policies, additional indexes for query optimization, and partitioning strategies based on your data volume and access patterns.</p></blockquote><h2 id="_5-api-specification" tabindex="-1">5. API Specification <a class="header-anchor" href="#_5-api-specification" aria-label="Permalink to &quot;5. API Specification&quot;">​</a></h2><h3 id="module-structure" tabindex="-1">Module Structure <a class="header-anchor" href="#module-structure" aria-label="Permalink to &quot;Module Structure&quot;">​</a></h3><p>Following the existing platform pattern (<code>apps/main/src/modules</code>):</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>audit-trail/</span></span>
<span class="line"><span>├── audit.controller.ts</span></span>
<span class="line"><span>├── audit.module.ts</span></span>
<span class="line"><span>├── audit.repository.ts</span></span>
<span class="line"><span>├── audit.schema.ts</span></span>
<span class="line"><span>├── audit.service.ts</span></span>
<span class="line"><span>├── audit.publisher.ts</span></span>
<span class="line"><span>└── audit.worker.ts</span></span></code></pre></div><h3 id="schema-definition" tabindex="-1">Schema Definition <a class="header-anchor" href="#schema-definition" aria-label="Permalink to &quot;Schema Definition&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { PaginationQueriesSchema } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;@smile-health/lib/types/paginate.js&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { OptionalIdSchema } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;@smile-health/lib/types/param.js&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> z </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;zod&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> GetAuditLogsQueriesSchema</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> PaginationQueriesSchema.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">extend</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  user_id: OptionalIdSchema.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">nullish</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  entity_id: OptionalIdSchema.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">nullish</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  action: z.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">nullish</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  entity: z.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">nullish</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(),</span></span>
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
	})}">datetime</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">nullish</span><span style="${ssrRenderStyle({
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
	})}">datetime</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">().</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">nullish</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">})</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> GetAuditLogsQueries</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> z</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">infer</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">typeof</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> GetAuditLogsQueriesSchema&gt;</span></span></code></pre></div><h3 id="api-endpoints" tabindex="-1">API Endpoints <a class="header-anchor" href="#api-endpoints" aria-label="Permalink to &quot;API Endpoints&quot;">​</a></h3><h4 id="get-audit-logs" tabindex="-1">GET /audit-logs <a class="header-anchor" href="#get-audit-logs" aria-label="Permalink to &quot;GET /audit-logs&quot;">​</a></h4><p>Query audit logs with filtering and pagination.</p><p><strong>Query Parameters</strong>:</p><ul><li><code>page</code>: Page number (default: 1)</li><li><code>paginate</code>: Items per page (10, 25, 50, 100)</li><li><code>user_id</code>: Filter by user ID</li><li><code>entity_id</code>: Filter by entity ID</li><li><code>action</code>: Filter by action type</li><li><code>entity</code>: Filter by entity type</li><li><code>start_date</code>: Start date (ISO 8601)</li><li><code>end_date</code>: End date (ISO 8601)</li></ul><p><strong>Response</strong>:</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;page&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;item_per_page&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">50</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;total_item&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1050</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;total_page&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">21</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;list_pagination&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">10</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">25</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">50</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">100</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">],</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;data&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;uuid-1234&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;timestamp&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2024-03-24T14:30:22.123Z&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;user_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">123</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;user_name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;John Doe&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;action&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;UPDATE_STOCK&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;entity&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Stock&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;entity_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">456</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;ip_address&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;192.168.1.1&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;user_agent&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Mozilla/5.0...&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;request_method&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;PUT&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;request_path&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;/stocks/456&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;status_code&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">200</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      &quot;changes&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">        &quot;quantity&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;old&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">10</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">&quot;new&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">50</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h2 id="_6-integration-points" tabindex="-1">6. Integration Points <a class="header-anchor" href="#_6-integration-points" aria-label="Permalink to &quot;6. Integration Points&quot;">​</a></h2><h3 id="code-examples" tabindex="-1">Code Examples <a class="header-anchor" href="#code-examples" aria-label="Permalink to &quot;Code Examples&quot;">​</a></h3><h4 id="example-1-stock-module-integration" tabindex="-1">Example 1: Stock Module Integration <a class="header-anchor" href="#example-1-stock-module-integration" aria-label="Permalink to &quot;Example 1: Stock Module Integration&quot;">​</a></h4><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// apps/main/src/modules/stock/stock.module.ts</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { AuditService } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;../audit-trail/audit.service.js&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> class</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> StockModule</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> extends</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> BaseModule</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  constructor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    private</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> readonly</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}"> stockRepo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> StockRepository</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    private</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> readonly</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}"> auditService</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> AuditService</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    // ... other dependencies</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    super</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  async</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> updateStock</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Context</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">stockId</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">data</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> UpdateStockDTO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> oldStock</span><span style="${ssrRenderStyle({
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
	})}">.stockRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">findById</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(stockId)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> updatedStock</span><span style="${ssrRenderStyle({
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
	})}">.stockRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">update</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(stockId, data)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    // Explicit audit log</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.auditService.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">log</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      action: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;UPDATE_STOCK&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      entity: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Stock&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      entity_id: stockId,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      old_data: oldStock,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      new_data: updatedStock</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    })</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    return</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> updatedStock</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h4 id="example-2-user-module-integration" tabindex="-1">Example 2: User Module Integration <a class="header-anchor" href="#example-2-user-module-integration" aria-label="Permalink to &quot;Example 2: User Module Integration&quot;">​</a></h4><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// apps/main/src/modules/user/user.module.ts</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">import</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { AuditService } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;../audit-trail/audit.service.js&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> class</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> UserModule</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> extends</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> BaseModule</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  constructor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    private</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> readonly</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}"> userRepo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> UserRepository</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    private</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> readonly</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}"> auditService</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> AuditService</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">    // ... other dependencies</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  ) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    super</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">()</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  async</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> updateUser</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Context</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">userId</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">data</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> UpdateUserDTO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> oldUser</span><span style="${ssrRenderStyle({
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
	})}">.userRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">findById</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(userId)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> updatedUser</span><span style="${ssrRenderStyle({
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
	})}">.userRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">update</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(userId, data)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.auditService.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">log</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      action: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;UPDATE_USER&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      entity: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;User&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      entity_id: userId,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      old_data: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        name: oldUser.name,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        email: oldUser.email,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        role_id: oldUser.role_id</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      new_data: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        name: updatedUser.name,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        email: updatedUser.email,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        role_id: updatedUser.role_id</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    })</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    return</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> updatedUser</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  async</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> deleteUser</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">c</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Context</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">userId</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> user</span><span style="${ssrRenderStyle({
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
	})}">.userRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">findById</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(userId)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.userRepo.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">delete</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(userId)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.auditService.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">log</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">({</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      action: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;DELETE_USER&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      entity: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;User&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      entity_id: userId,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      old_data: user</span></span>
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
	})}">}</span></span></code></pre></div><h2 id="_7-security-compliance" tabindex="-1">7. Security &amp; Compliance <a class="header-anchor" href="#_7-security-compliance" aria-label="Permalink to &quot;7. Security &amp; Compliance&quot;">​</a></h2><h3 id="data-protection" tabindex="-1">Data Protection <a class="header-anchor" href="#data-protection" aria-label="Permalink to &quot;Data Protection&quot;">​</a></h3><ul><li><strong>Sensitive Data</strong>: Hash or encrypt PII in audit logs</li><li><strong>Access Control</strong>: Restrict audit log access to authorized users only</li><li><strong>Immutability</strong>: Audit logs cannot be modified or deleted</li><li><strong>Retention</strong>: Configurable retention period (default: 2 years)</li></ul><h3 id="compliance-requirements" tabindex="-1">Compliance Requirements <a class="header-anchor" href="#compliance-requirements" aria-label="Permalink to &quot;Compliance Requirements&quot;">​</a></h3><ul><li><strong>GDPR</strong>: Support for data subject access requests</li><li><strong>SOC 2</strong>: Complete audit trail for all system changes</li><li><strong>ISO 27001</strong>: Security event logging and monitoring</li></ul><h2 id="_8-risks-mitigation" tabindex="-1">8. Risks &amp; Mitigation <a class="header-anchor" href="#_8-risks-mitigation" aria-label="Permalink to &quot;8. Risks &amp; Mitigation&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Risk</th><th>Impact</th><th>Probability</th><th>Mitigation</th></tr></thead><tbody><tr><td>Performance degradation</td><td>High</td><td>Low</td><td>Async processing, monitoring</td></tr><tr><td>Data loss</td><td>High</td><td>Low</td><td>RabbitMQ persistence, retry logic</td></tr><tr><td>Storage growth</td><td>Medium</td><td>High</td><td>Partitioning, TTL, compression</td></tr><tr><td>Integration complexity</td><td>Medium</td><td>Medium</td><td>Phased rollout, clear patterns</td></tr><tr><td>Privacy concerns</td><td>High</td><td>Low</td><td>Data masking, access controls</td></tr></tbody></table><h2 id="_9-references" tabindex="-1">9. References <a class="header-anchor" href="#_9-references" aria-label="Permalink to &quot;9. References&quot;">​</a></h2><ul><li><a href="https://clickhouse.com/docs" target="_blank" rel="noreferrer">ClickHouse Documentation</a></li><li><a href="https://www.rabbitmq.com/best-practices.html" target="_blank" rel="noreferrer">RabbitMQ Best Practices</a></li><li><a href="https://nodejs.org/api/async_context.html" target="_blank" rel="noreferrer">AsyncLocalStorage API</a></li><li>Platform Architecture Overview: <code>PLATFORM_ARCHITECTURE_OVERVIEW.md</code></li><li>Infrastructure Monitoring: <code>INFRASTRUCTURE_MONITORING.md</code></li></ul><hr><p><strong>Document Owner</strong>: Platform Architecture Team<br><strong>Last Updated</strong>: February 26, 2026<br><strong>Next Review</strong>: March 26, 2026</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/audit-trail.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var audit_trail_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, audit_trail_default as default };
