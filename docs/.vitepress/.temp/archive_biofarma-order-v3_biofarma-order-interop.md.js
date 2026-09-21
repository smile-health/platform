import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region archive/biofarma-order-v3/biofarma-order-interop.md
var __pageData = JSON.parse("{\"title\":\"Biofarma Order Integration via Interop Layer\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/biofarma-order-v3/biofarma-order-interop.md\",\"filePath\":\"archive/biofarma-order-v3/biofarma-order-interop.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/biofarma-order-v3/biofarma-order-interop.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="biofarma-order-integration-via-interop-layer" tabindex="-1">Biofarma Order Integration via Interop Layer <a class="header-anchor" href="#biofarma-order-integration-via-interop-layer" aria-label="Permalink to &quot;Biofarma Order Integration via Interop Layer&quot;">​</a></h1><blockquote><p><strong>ARSIP — jangan dipakai sebagai acuan implementasi.</strong> Merujuk <code>biofarma.cron.ts</code>, <code>biofarma.gateway.ts</code>, <code>biofarma.repository.ts</code>, dan <code>sync_orders.ts</code> yang semuanya sudah dihapus. Disimpan sebagai rujukan historis saja.</p></blockquote><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>The Biofarma integration syncs vaccine delivery orders (DO — Delivery Orders) from PT Bio Farma (Persero)&#39;s external API into SMILE&#39;s internal order system. It runs as a scheduled job every day at <strong>07:00 WIB</strong>.</p><p>This document describes how to wire Biofarma order lifecycle events through the interop pipeline so that downstream systems can be notified when vaccine deliveries are created or cancelled inside SMILE.</p><blockquote><p>⚠️ <strong>Current state</strong>: The integration today is entirely internal — data flows <code>Biofarma API → BiofarmaCron → ws_orders</code>. There is <strong>no outbound notification to any external system</strong>. The interop layer wiring described here is a <strong>design guide</strong> for adding that outbound leg. Actual downstream target systems and filter criteria must be confirmed with the business/integration team before implementing the routing rules in Steps 3–4.</p></blockquote><hr><h3 id="scheduled-trigger" tabindex="-1">Scheduled Trigger <a class="header-anchor" href="#scheduled-trigger" aria-label="Permalink to &quot;Scheduled Trigger&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Job</th><th>Schedule</th><th>Timezone</th><th>CLI Command</th></tr></thead><tbody><tr><td>Order sync — province</td><td><strong>07:00 WIB</strong> daily</td><td>WIB (UTC+7) = 00:00 UTC</td><td><code>bun ./src/cli.ts sync-biofarma-orders --type province</code></td></tr><tr><td>Order sync — hub</td><td><strong>07:00 WIB</strong> daily</td><td>WIB (UTC+7) = 00:00 UTC</td><td><code>bun ./src/cli.ts sync-biofarma-orders --type hub</code></td></tr><tr><td>Dashboard sync (SMDV)</td><td>Configurable</td><td>WIB (UTC+7)</td><td><code>bun ./src/cli.ts sync-biofarma-dashboard --type province</code></td></tr></tbody></table><p><strong>Cron expression:</strong></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>0 0 * * *   # 00:00 UTC = 07:00 WIB</span></span></code></pre></div><h3 id="implementation-entry-points" tabindex="-1">Implementation Entry Points <a class="header-anchor" href="#implementation-entry-points" aria-label="Permalink to &quot;Implementation Entry Points&quot;">​</a></h3><table tabindex="0"><thead><tr><th>File</th><th>Purpose</th></tr></thead><tbody><tr><td><code>apps/main/src/modules/order-integration/biofarma/biofarma.cron.ts</code> <em>(dihapus)</em></td><td><code>BiofarmaCron</code> — core sync logic (syncOrders, syncDashboard)</td></tr><tr><td><code>apps/main/src/modules/order-integration/biofarma/biofarma.gateway.ts</code> <em>(dihapus)</em></td><td><code>BiofarmaGateway</code> — HTTP client for Biofarma API and SMILE API</td></tr><tr><td><code>apps/main/src/modules/order-integration/biofarma/biofarma.repository.ts</code> <em>(dihapus)</em></td><td><code>BiofarmaRepository</code> — DB reads/writes</td></tr><tr><td><code>apps/main/src/scripts/cron/biofarma/sync_orders.ts</code> <em>(dihapus)</em></td><td>CLI entry point — sets up transaction context and invokes <code>BiofarmaCron</code></td></tr></tbody></table><hr><h2 id="before-after-the-interop-layer" tabindex="-1">Before &amp; After the Interop Layer <a class="header-anchor" href="#before-after-the-interop-layer" aria-label="Permalink to &quot;Before &amp; After the Interop Layer&quot;">​</a></h2><h3 id="before-—-current-state" tabindex="-1">Before — Current State <a class="header-anchor" href="#before-—-current-state" aria-label="Permalink to &quot;Before — Current State&quot;">​</a></h3><p>Data flows only inward. SMILE consumes from Biofarma. Nothing is notified externally.</p>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-151",
				class: "mermaid",
				graph: "flowchart%20LR%0A%20%20%20%20subgraph%20SCHED%5B%22%E2%8F%B0%2007%3A00%20WIB%20daily%22%5D%0A%20%20%20%20%20%20%20%20CRON(%5BCron%20Scheduler%5D)%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20MAIN%5B%22SMILE%20Main%20Service%22%5D%0A%20%20%20%20%20%20%20%20CLI%5B%22CLI%3Cbr%2F%3Esync-biofarma-orders%22%5D%0A%20%20%20%20%20%20%20%20BFCRON%5B%22BiofarmaCron%3Cbr%2F%3EsyncOrders()%22%5D%0A%20%20%20%20%20%20%20%20BFGW%5B%22BiofarmaGateway%3Cbr%2F%3EcreateSmileOrder%20%2F%20cancelSmileOrder%22%5D%0A%20%20%20%20%20%20%20%20SMILEDB%5B(%22SMILE%20DB%3Cbr%2F%3Ews_orders%3Cbr%2F%3Eintegration_biofarma_orders%22)%5D%0A%20%20%20%20end%0A%0A%20%20%20%20BFAPI%5B%22Biofarma%20API%3Cbr%2F%3E%2Fapi%2Fpublic%2Fget-transaksi-*%22%5D%0A%0A%20%20%20%20CRON%20--%3E%20%7Ctriggers%7C%20CLI%20--%3E%20BFCRON%0A%20%20%20%20BFCRON%20--%3E%20%7C%22GET%20province%20%2B%20hub%20orders%22%7C%20BFAPI%0A%20%20%20%20BFAPI%20-.-%3E%20%7C%22DO%20records%22%7C%20BFCRON%0A%20%20%20%20BFCRON%20--%3E%20%7C%22compare%20metadata%22%7C%20SMILEDB%0A%20%20%20%20BFCRON%20--%3E%20%7C%22createSmileOrder%20%2F%20cancelSmileOrder%22%7C%20BFGW%0A%20%20%20%20BFGW%20--%3E%20%7C%22POST%20%2Fv2%2Forder%2Fdropping%3Cbr%2F%3EPUT%20%2Forder%2F%3Aid%2Fcancel%22%7C%20SMILEDB%0A%20%20%20%20BFCRON%20--%3E%20%7C%22upsert%22%7C%20SMILEDB%0A%0A%20%20%20%20classDef%20external%20fill%3A%23f5f0e8%2Cstroke%3A%23b8a87a%2Ccolor%3A%235a4a1a%0A%20%20%20%20classDef%20sched%20fill%3A%23fff8e8%2Cstroke%3A%23c8a82a%2Ccolor%3A%235a4a00%0A%20%20%20%20class%20BFAPI%20external%0A%20%20%20%20class%20CRON%20sched%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<p><strong>What&#39;s missing:</strong> No external system is told when a vaccine delivery order is created or cancelled inside SMILE. The only record is <code>console.log</code> output and <code>integration_biofarma_orders</code> in the local DB.</p><hr><h3 id="after-—-with-interop-layer" tabindex="-1">After — With Interop Layer <a class="header-anchor" href="#after-—-with-interop-layer" aria-label="Permalink to &quot;After — With Interop Layer&quot;">​</a></h3><p>Same inbound sync remains unchanged. A publish step is added at the end of each <code>createSmileOrder</code> / <code>cancelSmileOrder</code> call, feeding the interop pipeline.</p>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-162",
				class: "mermaid",
				graph: "flowchart%20LR%0A%20%20%20%20subgraph%20SCHED%5B%22%E2%8F%B0%2007%3A00%20WIB%20daily%22%5D%0A%20%20%20%20%20%20%20%20CRON(%5BCron%20Scheduler%5D)%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20MAIN%5B%22SMILE%20Main%20Service%22%5D%0A%20%20%20%20%20%20%20%20CLI%5B%22CLI%3Cbr%2F%3Esync-biofarma-orders%22%5D%0A%20%20%20%20%20%20%20%20BFCRON%5B%22BiofarmaCron%3Cbr%2F%3EsyncOrders()%22%5D%0A%20%20%20%20%20%20%20%20BFGW%5B%22BiofarmaGateway%22%5D%0A%20%20%20%20%20%20%20%20SMILEDB%5B(%22SMILE%20DB%3Cbr%2F%3Ews_orders%22)%5D%0A%20%20%20%20end%0A%0A%20%20%20%20BFAPI%5B%22Biofarma%20API%22%5D%0A%0A%20%20%20%20subgraph%20INTEROP%5B%22Interop%20Layer%20%20%C2%B7%20%20NEW%22%5D%0A%20%20%20%20%20%20%20%20MQ(%5B%22RabbitMQ%3Cbr%2F%3Ebiofarma.order.*%22%5D)%0A%20%20%20%20%20%20%20%20IS%5B%22interop-service%3Cbr%2F%3EBiofarmaOrderTransformer%22%5D%0A%20%20%20%20%20%20%20%20OHM%5B%22OpenHIM%20Core%22%5D%0A%20%20%20%20%20%20%20%20RR%5B%22rule-router%22%5D%0A%20%20%20%20%20%20%20%20AUDITDB%5B(%22smile_interop%3Cbr%2F%3Eaudit%20log%22)%5D%0A%20%20%20%20end%0A%0A%20%20%20%20DSYS%5B%22Downstream%20System%3Cbr%2F%3E(TBD)%22%5D%0A%0A%20%20%20%20CRON%20--%3E%20%7Ctriggers%7C%20CLI%20--%3E%20BFCRON%0A%20%20%20%20BFCRON%20--%3E%20%7C%22GET%20orders%22%7C%20BFAPI%0A%20%20%20%20BFAPI%20-.-%3E%20%7C%22DO%20records%22%7C%20BFCRON%0A%20%20%20%20BFCRON%20--%3E%20%7C%22createSmileOrder%20%2F%20cancelSmileOrder%22%7C%20BFGW%0A%20%20%20%20BFGW%20--%3E%20SMILEDB%0A%0A%20%20%20%20BFCRON%20--%3E%20%7C%22%F0%9F%93%A4%20publish%3Cbr%2F%3Ebiofarma.order.created%3Cbr%2F%3Ebiofarma.order.cancelled%22%7C%20MQ%0A%0A%20%20%20%20MQ%20--%3E%20%7Cconsume%7C%20IS%0A%20%20%20%20IS%20--%3E%20%7C%22CloudEvent%20POST%22%7C%20OHM%0A%20%20%20%20OHM%20--%3E%20%7C%22POST%20%2Froute%22%7C%20RR%0A%20%20%20%20RR%20--%3E%20%7C%22routing%20rules%20(TBD)%22%7C%20DSYS%0A%20%20%20%20IS%20--%3E%20AUDITDB%0A%0A%20%20%20%20classDef%20external%20fill%3A%23f5f0e8%2Cstroke%3A%23b8a87a%2Ccolor%3A%235a4a1a%0A%20%20%20%20classDef%20interop%20fill%3A%23e8f0f5%2Cstroke%3A%237a9ab8%2Ccolor%3A%231a3a5a%0A%20%20%20%20classDef%20new%20stroke%3A%2328a745%2Cstroke-width%3A2px%0A%20%20%20%20classDef%20sched%20fill%3A%23fff8e8%2Cstroke%3A%23c8a82a%2Ccolor%3A%235a4a00%0A%20%20%20%20class%20BFAPI%20external%0A%20%20%20%20class%20MQ%2CIS%2COHM%2CRR%2CAUDITDB%20interop%0A%20%20%20%20class%20MQ%2CIS%2COHM%2CRR%2CAUDITDB%2CDSYS%20new%0A%20%20%20%20class%20CRON%20sched%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h3 id="what-changes" tabindex="-1">What Changes <a class="header-anchor" href="#what-changes" aria-label="Permalink to &quot;What Changes&quot;">​</a></h3><table tabindex="0"><thead><tr><th></th><th>Before</th><th>After</th></tr></thead><tbody><tr><td>Biofarma → SMILE sync</td><td><code>BiofarmaCron.syncOrders()</code> daily at 07:00 WIB</td><td><strong>Unchanged</strong></td></tr><tr><td>Order created in SMILE</td><td>Written to <code>ws_orders</code></td><td><strong>Unchanged</strong> + publishes <code>biofarma.order.created</code> to RabbitMQ</td></tr><tr><td>Order cancelled in SMILE</td><td>Cancelled via <code>cancelSmileOrder()</code></td><td><strong>Unchanged</strong> + publishes <code>biofarma.order.cancelled</code> to RabbitMQ</td></tr><tr><td>External systems notified</td><td><strong>None</strong></td><td>Via <code>interop-service</code> → OpenHIM → downstream adapter (TBD)</td></tr><tr><td>Audit trail</td><td><code>console.log</code> only</td><td><code>openhim_route_execution_logs</code> per event with HTTP status, timing, payload</td></tr><tr><td>Add new downstream system</td><td>Code change required</td><td>Insert row into <code>integration_routing_rules</code> → reload cache</td></tr><tr><td>Field names sent externally</td><td>Indonesian (<code>no_do</code>, <code>kode_area</code>, <code>jm_dosis</code>, ...)</td><td>English (<code>delivery_number</code>, <code>area_code</code>, <code>quantity_doses</code>, ...) via <code>BiofarmaOrderTransformer</code></td></tr></tbody></table><hr><h3 id="code-change-required-minimal" tabindex="-1">Code Change Required (Minimal) <a class="header-anchor" href="#code-change-required-minimal" aria-label="Permalink to &quot;Code Change Required (Minimal)&quot;">​</a></h3><p>Only one addition is needed inside <code>BiofarmaCron.syncOrders()</code> — a publish call after each successful <code>createSmileOrder</code> / <code>cancelSmileOrder</code>:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// After createSmileOrder() succeeds — add:</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">publishEvent</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;biofarma.order.created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, item, context)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// After cancelSmileOrder() succeeds — add:</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">await</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">publishEvent</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;biofarma.order.cancelled&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, item, context)</span></span></code></pre></div><p>Everything else (route mapping, OpenHIM channel, routing rules, transformer) is configuration — no further code changes to <code>BiofarmaCron</code> are needed.</p><hr><h2 id="system-architecture" tabindex="-1">System Architecture <a class="header-anchor" href="#system-architecture" aria-label="Permalink to &quot;System Architecture&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-276",
				class: "mermaid",
				graph: "flowchart%20TB%0A%20%20%20%20subgraph%20SCHED%5B%22%E2%8F%B0%2007%3A00%20WIB%20daily%20%20(0%200%20*%20*%20*%20UTC)%22%5D%0A%20%20%20%20%20%20%20%20CRON(%5BCron%20Scheduler%5D)%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20MAIN%5B%22SMILE%20Main%20Service%20%20%C2%B7%20%20apps%2Fmain%22%5D%0A%20%20%20%20%20%20%20%20CLI%5B%22CLI%3Cbr%2F%3Esync-biofarma-orders%22%5D%0A%20%20%20%20%20%20%20%20BFCRON%5B%22BiofarmaCron%3Cbr%2F%3Ebiofarma.cron.ts%22%5D%0A%20%20%20%20%20%20%20%20BFGW%5B%22BiofarmaGateway%3Cbr%2F%3Ebiofarma.gateway.ts%22%5D%0A%20%20%20%20%20%20%20%20SMILEDB%5B(%22SMILE%20DB%3Cbr%2F%3Ews_orders%3Cbr%2F%3Eintegration_biofarma_orders%22)%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20EXT%5B%22External%22%5D%0A%20%20%20%20%20%20%20%20BFAPI%5B%22Biofarma%20API%3Cbr%2F%3E%2Fapi%2Fpublic%2Fget-transaksi-*%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20INTEROP%5B%22Interop%20Layer%20%20%C2%B7%20%20to%20be%20wired%22%5D%0A%20%20%20%20%20%20%20%20MQ(%5B%22RabbitMQ%3Cbr%2F%3Ebiofarma.order.*%22%5D)%0A%20%20%20%20%20%20%20%20IS%5B%22interop-service%3Cbr%2F%3E%2B%20BiofarmaOrderTransformer%22%5D%0A%20%20%20%20%20%20%20%20OHM%5B%22OpenHIM%20Core%22%5D%0A%20%20%20%20%20%20%20%20RR%5B%22rule-router%3Cbr%2F%3E(OpenHIM%20Mediator)%22%5D%0A%20%20%20%20%20%20%20%20AUDITDB%5B(%22smile_interop%3Cbr%2F%3Eopenhim_route_execution_logs%22)%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20TBD%5B%22Downstream%20Systems%20%20%C2%B7%20%20TBD%22%5D%0A%20%20%20%20%20%20%20%20DSYS%5B%22Target%20Adapter%3Cbr%2F%3E%E2%9A%A0%EF%B8%8F%20system%20Tbd%20by%20business%20team%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20CRON%20--%3E%20%7Ctriggers%7C%20CLI%0A%20%20%20%20CLI%20--%3E%20BFCRON%0A%20%20%20%20BFCRON%20--%3E%20%7C%22GET%20orders%20(province%20%2B%20hub)%22%7C%20BFAPI%0A%20%20%20%20BFAPI%20-.-%3E%20%7C%22DO%20records%22%7C%20BFCRON%0A%20%20%20%20BFCRON%20--%3E%20%7C%22lookup%20existing%20orders%22%7C%20SMILEDB%0A%20%20%20%20BFCRON%20--%3E%20%7C%22createSmileOrder%20%2F%20cancelSmileOrder%22%7C%20BFGW%0A%20%20%20%20BFGW%20--%3E%20%7C%22POST%20%2Fv2%2Forder%2Fdropping%22%7C%20SMILEDB%0A%20%20%20%20BFCRON%20--%3E%20%7C%22publish%20biofarma.order.created%20%2F%20cancelled%22%7C%20MQ%0A%0A%20%20%20%20MQ%20--%3E%20%7Cconsume%7C%20IS%0A%20%20%20%20IS%20--%3E%20%7C%22CloudEvent%20POST%22%7C%20OHM%0A%20%20%20%20OHM%20--%3E%20%7C%22POST%20%2Froute%22%7C%20RR%0A%20%20%20%20RR%20--%3E%20%7C%22routing%20rules%20(TBD)%22%7C%20DSYS%0A%20%20%20%20IS%20--%3E%20%7C%22write%20audit%20log%22%7C%20AUDITDB%0A%0A%20%20%20%20classDef%20external%20fill%3A%23f5f0e8%2Cstroke%3A%23b8a87a%2Ccolor%3A%235a4a1a%0A%20%20%20%20classDef%20interop%20fill%3A%23e8f0f5%2Cstroke%3A%237a9ab8%2Ccolor%3A%231a3a5a%0A%20%20%20%20classDef%20tbd%20fill%3A%23fdf3e8%2Cstroke%3A%23c8843a%2Ccolor%3A%237a3a00%0A%20%20%20%20classDef%20sched%20fill%3A%23fff8e8%2Cstroke%3A%23c8a82a%2Ccolor%3A%235a4a00%0A%20%20%20%20class%20BFAPI%20external%0A%20%20%20%20class%20MQ%2CIS%2COHM%2CRR%2CAUDITDB%20interop%0A%20%20%20%20class%20DSYS%20tbd%0A%20%20%20%20class%20CRON%20sched%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="what-the-code-actually-does-current-flow" tabindex="-1">What the Code Actually Does (Current Flow) <a class="header-anchor" href="#what-the-code-actually-does-current-flow" aria-label="Permalink to &quot;What the Code Actually Does (Current Flow)&quot;">​</a></h2><h3 id="biofarmacron-syncorders-—-per-type-province-hub" tabindex="-1"><code>BiofarmaCron.syncOrders()</code> — per type (province / hub) <a class="header-anchor" href="#biofarmacron-syncorders-—-per-type-province-hub" aria-label="Permalink to &quot;\`BiofarmaCron.syncOrders()\` — per type (province / hub)&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-284",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20%20%20START(%5B%22BiofarmaCron.syncOrders()%3Cbr%2F%3EFetch%20all%20DOs%20from%20Biofarma%20API%22%5D)%0A%20%20%20%20RESOLVE%5B%22mapBiofarmaToIntegration()%3Cbr%2F%3EResolve%3A%20material%20%C2%B7%20entity%20%C2%B7%20activity%20%C2%B7%20budget_source%3Cbr%2F%3Efrom%20SMILE%20DB%22%5D%0A%20%20%20%20LOOP%5B%22For%20each%20DO%22%5D%0A%0A%20%20%20%20NEW%7B%22Exists%20in%3Cbr%2F%3Ews_orders%3F%22%7D%0A%20%20%20%20META%7B%22metadata%3Cbr%2F%3Ecolumn%20set%3F%22%7D%0A%20%20%20%20STATUS%7B%22order_status_id%20%3D%3Cbr%2F%3ECANCELED%20or%20FULFILLED%3F%22%7D%0A%20%20%20%20CHANGED%7B%22metadata%3Cbr%2F%3Echanged%3F%22%7D%0A%0A%20%20%20%20UPDATE_META%5B%22updateOrderMetadata()%3Cbr%2F%3Eno%20event%20emitted%22%5D%0A%20%20%20%20SKIP(%5B%22Skip%20%E2%80%94%20no%20action%22%5D)%0A%0A%20%20%20%20CANCEL%5B%22cancelSmileOrder()%3Cbr%2F%3EBiofarmaGateway%20%E2%86%92%20PUT%20%2Forder%2F%3Aid%2Fcancel%22%5D%0A%20%20%20%20CREATE%5B%22createSmileOrder()%3Cbr%2F%3EBiofarmaGateway%20%E2%86%92%20POST%20%2Fv2%2Forder%2Fdropping%22%5D%0A%0A%20%20%20%20PUB_CANCEL(%5B%22%F0%9F%93%A4%20Publish%3Cbr%2F%3Ebiofarma.order.cancelled%22%5D)%0A%20%20%20%20PUB_CREATE(%5B%22%F0%9F%93%A4%20Publish%3Cbr%2F%3Ebiofarma.order.created%22%5D)%0A%0A%20%20%20%20UPSERT%5B%22insertBiofarmaOrders()%3Cbr%2F%3EUpsert%20%E2%86%92%20integration_biofarma_orders%22%5D%0A%0A%20%20%20%20START%20--%3E%20RESOLVE%20--%3E%20LOOP%0A%20%20%20%20LOOP%20--%3E%20NEW%0A%0A%20%20%20%20NEW%20--%20%22no%20%C2%B7%20new%20DO%22%20--%3E%20CREATE%20--%3E%20PUB_CREATE%0A%20%20%20%20NEW%20--%20%22yes%20%C2%B7%20existing%22%20--%3E%20META%0A%20%20%20%20META%20--%20%22no%22%20--%3E%20UPDATE_META%20--%3E%20SKIP%0A%20%20%20%20META%20--%20%22yes%22%20--%3E%20STATUS%0A%20%20%20%20STATUS%20--%20%22cancelled%20%2F%20fulfilled%22%20--%3E%20SKIP%0A%20%20%20%20STATUS%20--%20%22active%22%20--%3E%20CHANGED%0A%20%20%20%20CHANGED%20--%20%22no%22%20--%3E%20SKIP%0A%20%20%20%20CHANGED%20--%20%22yes%22%20--%3E%20CANCEL%20--%3E%20PUB_CANCEL%20--%3E%20CREATE%20--%3E%20PUB_CREATE%0A%0A%20%20%20%20PUB_CREATE%20--%3E%20UPSERT%0A%20%20%20%20SKIP%20--%3E%20UPSERT%0A%0A%20%20%20%20classDef%20pub%20fill%3A%23d4edda%2Cstroke%3A%2328a745%2Ccolor%3A%23155724%0A%20%20%20%20classDef%20skip%20fill%3A%23f8f9fa%2Cstroke%3A%23adb5bd%2Ccolor%3A%236c757d%0A%20%20%20%20classDef%20action%20fill%3A%23cce5ff%2Cstroke%3A%23004085%2Ccolor%3A%23004085%0A%20%20%20%20class%20PUB_CANCEL%2CPUB_CREATE%20pub%0A%20%20%20%20class%20SKIP%2CUPDATE_META%20skip%0A%20%20%20%20class%20CANCEL%2CCREATE%20action%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="key-data-lookups-inside-syncorders" tabindex="-1">Key data lookups inside <code>syncOrders()</code> <a class="header-anchor" href="#key-data-lookups-inside-syncorders" aria-label="Permalink to &quot;Key data lookups inside \`syncOrders()\`&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Lookup</th><th>Source</th><th>Used for</th></tr></thead><tbody><tr><td><code>getMapOrderByNomorDO()</code></td><td><code>ws_orders</code></td><td>Detect new vs. existing DOs</td></tr><tr><td><code>getMapEntityIdByCode()</code></td><td>entity table</td><td>Resolve <code>customer_id</code> and <code>vendor_id</code> from <code>kode_area</code></td></tr><tr><td><code>getMapMaterialByCode()</code></td><td>materials table</td><td>Resolve <code>material_id</code> and <code>program_id</code> from product name</td></tr><tr><td><code>getMapActivityByProgramId()</code></td><td>activity table</td><td>Resolve <code>activity_id</code> per program</td></tr><tr><td><code>getMapBudgetSourceByProgramId()</code></td><td>budget source table</td><td>Resolve <code>budget_source_id</code> per program</td></tr><tr><td><code>getMaterialManufactureGroup()</code></td><td>manufacture table</td><td>Find &quot;Biofarma&quot; manufacture record for batch creation</td></tr></tbody></table><h3 id="biofarmacron-syncdashboard-—-per-type-province-hub" tabindex="-1"><code>BiofarmaCron.syncDashboard()</code> — per type (province / hub) <a class="header-anchor" href="#biofarmacron-syncdashboard-—-per-type-province-hub" aria-label="Permalink to &quot;\`BiofarmaCron.syncDashboard()\` — per type (province / hub)&quot;">​</a></h3><p>Fetches SMDV distribution data from:</p><ul><li><code>get_province_dashboard</code> → <code>getProvinceDashboard()</code></li><li><code>get_hub_dashboard</code> → <code>getHubDashboard()</code></li></ul><p>Maps to <code>integration_biofarma_smdv_orders</code> table in batches of 10,000 rows. Publishes <code>biofarma.order.smdv.synced</code> after each successful batch insert.</p><hr><h2 id="events-published-to-rabbitmq" tabindex="-1">Events Published to RabbitMQ <a class="header-anchor" href="#events-published-to-rabbitmq" aria-label="Permalink to &quot;Events Published to RabbitMQ&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Topic</th><th>Trigger</th><th>Published by</th></tr></thead><tbody><tr><td><code>biofarma.order.created</code></td><td>New DO successfully created in SMILE via <code>createSmileOrder()</code></td><td><code>BiofarmaCron.syncOrders()</code></td></tr><tr><td><code>biofarma.order.cancelled</code></td><td>Existing DO cancelled due to changed batch data via <code>cancelSmileOrder()</code></td><td><code>BiofarmaCron.syncOrders()</code></td></tr><tr><td><code>biofarma.order.smdv.synced</code></td><td>SMDV dashboard data inserted into <code>integration_biofarma_smdv_orders</code></td><td><code>BiofarmaCron.syncDashboard()</code></td></tr></tbody></table><blockquote><p><strong>Volume per run</strong>: equals the number of new/changed DOs in the date range. Daily incremental runs typically emit a small number; a full historical backfill (<code>--startDate BIOFARMA_STARTDATE</code>) may emit hundreds.</p></blockquote><hr><h2 id="idempotency" tabindex="-1">Idempotency <a class="header-anchor" href="#idempotency" aria-label="Permalink to &quot;Idempotency&quot;">​</a></h2><p>The sync re-fetches data daily, so the same DO can appear on multiple runs. <code>interop-service</code> does not deduplicate — <strong>downstream adapters must handle idempotent processing</strong> using <code>delivery_number</code> (<code>no_do</code>) as the upsert key.</p><hr><h2 id="interop-layer-wiring-guide" tabindex="-1">Interop Layer Wiring Guide <a class="header-anchor" href="#interop-layer-wiring-guide" aria-label="Permalink to &quot;Interop Layer Wiring Guide&quot;">​</a></h2><p>Follow <a href="./../../architecture/interop-layer/adding-new-event.html">adding-new-event.md</a> Scenario A. The steps below provide Biofarma-specific SQL values. <strong>Replace placeholder adapter URLs with real targets once downstream systems are confirmed.</strong></p><h3 id="step-1-—-confirm-the-rabbitmq-topic-name" tabindex="-1">Step 1 — Confirm the RabbitMQ Topic Name <a class="header-anchor" href="#step-1-—-confirm-the-rabbitmq-topic-name" aria-label="Permalink to &quot;Step 1 — Confirm the RabbitMQ Topic Name&quot;">​</a></h3><p>Topic: <strong><code>biofarma.order.created</code></strong></p><p>Published inside <code>BiofarmaCron.syncOrders()</code> <code>apps/main/src/modules/order-integration/biofarma/biofarma.cron.ts</code> <em>(dihapus)</em> once per DO after <code>createSmileOrder()</code> succeeds. <strong>Publish timing: 07:00 WIB daily</strong> (cron: <code>0 0 * * *</code> UTC).</p><hr><h3 id="step-2-—-insert-route-mapping" tabindex="-1">Step 2 — Insert Route Mapping <a class="header-anchor" href="#step-2-—-insert-route-mapping" aria-label="Permalink to &quot;Step 2 — Insert Route Mapping&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">INSERT INTO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> openhim_route_mappings (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  rabbitmq_topic,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  enabled</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  openhim_channel_id,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  openhim_channel_name,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  http_method,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  request_path,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  headers_json,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  include_context,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  auth_type,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  max_retries,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  retry_backoff_ms,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  retry_backoff_multiplier,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  expected_status_codes,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  created_by</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">VALUES</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;biofarma.order.created&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;smile-biofarma-order-created-channel&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;SMILE Biofarma Order Created Channel&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;POST&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;/pub/smile/biofarma/order-created&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  JSON_OBJECT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Content-Type&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;application/json&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;Accept&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;application/json&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,        </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- include program_id, user_id, workspace_id as CloudEvent extensions</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;basic&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  3</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,        </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- max retries</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  1000</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,     </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- initial backoff ms</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,        </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- backoff multiplier (1s → 2s → 4s)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;200,201,202,204&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">  &#39;system&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">);</span></span></code></pre></div><p>Add to <a href="https://github.com/smile-health/platform/blob/main/apps/interop-service/db-scripts/route-mapping-insert.sql" target="_blank" rel="noreferrer">apps/interop-service/db-scripts/route-mapping-insert.sql</a>.</p><hr><h3 id="step-3-—-create-the-openhim-channel" tabindex="-1">Step 3 — Create the OpenHIM Channel <a class="header-anchor" href="#step-3-—-create-the-openhim-channel" aria-label="Permalink to &quot;Step 3 — Create the OpenHIM Channel&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td>Name</td><td><code>SMILE Biofarma Order Created Channel</code></td></tr><tr><td>URL Pattern</td><td><code>/pub/smile/biofarma/order-created</code></td></tr><tr><td>Type</td><td>HTTP</td></tr><tr><td>Status</td><td>Enabled</td></tr><tr><td>Allowed clients</td><td><code>smile-app</code></td></tr><tr><td>Route</td><td><code>rule-router</code> host:4005 path <code>/route</code></td></tr></tbody></table><hr><h3 id="step-4-—-insert-routing-rules" tabindex="-1">Step 4 — Insert Routing Rules <a class="header-anchor" href="#step-4-—-insert-routing-rules" aria-label="Permalink to &quot;Step 4 — Insert Routing Rules&quot;">​</a></h3><blockquote><p>⚠️ The filter keys and target URLs below are <strong>placeholders</strong>. Replace <code>program_id</code> values and <code>/adapter/&lt;system&gt;/...</code> paths with the actual confirmed targets.</p></blockquote><p>The <code>program_id</code> available in the CloudEvent is resolved by <code>mapMaterial[produk].program_id</code> inside <code>BiofarmaCron</code>. The <code>biofarma_type</code> field (<code>&quot;province&quot;</code> or <code>&quot;hub&quot;</code>) is available as <code>data.biofarma_type</code> for field-level filtering.</p>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-560",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20%20%20CE%5B%2F%22CloudEvent%20arrives%20at%20rule-router%3Cbr%2F%3Etopic%3A%20biofarma.order.created%22%2F%5D%0A%20%20%20%20LOAD%5B%22Load%20rules%20from%20cache%3Cbr%2F%3Eis_default%20%3D%20FALSE%20evaluated%20first%22%5D%0A%0A%20%20%20%20PID%7B%22filter%20by%3Cbr%2F%3Eprogram_id%3F%22%7D%0A%20%20%20%20BTYPE%7B%22filter%20by%3Cbr%2F%3Edata.biofarma_type%3F%22%7D%0A%20%20%20%20OTHER%7B%22other%3Cbr%2F%3Ecustom%20filter%3F%22%7D%0A%0A%20%20%20%20TARGET1%5B%22%E2%9A%A0%EF%B8%8F%20Target%20System%20A%3Cbr%2F%3E%2Fadapter%2F%3Csystem-a%3E%2Fbiofarma%2Forders%3Cbr%2F%3ETBD%20%E2%80%94%20confirm%20with%20business%20team%22%5D%0A%20%20%20%20TARGET2%5B%22%E2%9A%A0%EF%B8%8F%20Target%20System%20B%3Cbr%2F%3E%2Fadapter%2F%3Csystem-b%3E%2Fbiofarma%2Forders%3Cbr%2F%3ETBD%20%E2%80%94%20confirm%20with%20business%20team%22%5D%0A%0A%20%20%20%20MATCHED%7B%22Any%20specific%3Cbr%2F%3Erule%20matched%3F%22%7D%0A%20%20%20%20DEFAULT%5B%22Default%20Adapter%3Cbr%2F%3E%2Fadapter%2Fdefault%2Fbiofarma%2Forders%3Cbr%2F%3Eis_default%20%3D%20TRUE%22%5D%0A%20%20%20%20NONE%5B%22Return%20200%3Cbr%2F%3E'no%20routing%20configured'%22%5D%0A%0A%20%20%20%20FANOUT%5B%22Fan-out%20in%20parallel%3Cbr%2F%3Eto%20all%20matched%20targets%22%5D%0A%20%20%20%20RESP%5B%22Return%20OpenHIM%20mediator%20response%3Cbr%2F%3Ewith%20orchestrations%20array%22%5D%0A%0A%20%20%20%20CE%20--%3E%20LOAD%20--%3E%20PID%20%26%20BTYPE%20%26%20OTHER%0A%20%20%20%20PID%20--%20yes%20--%3E%20TARGET1%0A%20%20%20%20BTYPE%20--%20yes%20--%3E%20TARGET2%0A%20%20%20%20OTHER%20--%20yes%20--%3E%20TARGET2%0A%20%20%20%20TARGET1%20%26%20TARGET2%20--%3E%20MATCHED%0A%20%20%20%20PID%20%26%20BTYPE%20%26%20OTHER%20--%20no%20--%3E%20MATCHED%0A%20%20%20%20MATCHED%20--%20%22one%20or%20more%20matched%22%20--%3E%20FANOUT%0A%20%20%20%20MATCHED%20--%20%22no%20specific%20match%22%20--%3E%20DEFAULT%20--%3E%20FANOUT%0A%20%20%20%20MATCHED%20--%20%22no%20rules%20exist%22%20--%3E%20NONE%0A%20%20%20%20FANOUT%20--%3E%20RESP%0A%0A%20%20%20%20classDef%20tbd%20fill%3A%23fdf3e8%2Cstroke%3A%23c8843a%2Ccolor%3A%237a3a00%0A%20%20%20%20classDef%20decision%20fill%3A%23fff3cd%2Cstroke%3A%23ffc107%2Ccolor%3A%23856404%0A%20%20%20%20class%20TARGET1%2CTARGET2%2CDEFAULT%20tbd%0A%20%20%20%20class%20MATCHED%2CPID%2CBTYPE%2COTHER%20decision%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<p><strong>Template SQL — replace placeholders before running:</strong></p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- Rule 1: filter by program_id (replace value and target_url)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">INSERT INTO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> integration_routing_rules</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">enabled</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">VALUES</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;biofarma.order.created&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;program_id&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;eq&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;&lt;PROGRAM_ID&gt;&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,          </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- e.g. the program_id of your vaccine program</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;/adapter/&lt;your-system&gt;/biofarma/orders&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,     </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- confirm with your adapter team</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;&lt;System Name&gt; - Biofarma Order Created&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    FALSE, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, TRUE</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  );</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- Rule 2: filter by delivery type (province or hub)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">INSERT INTO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> integration_routing_rules</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">enabled</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">VALUES</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;biofarma.order.created&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;data.biofarma_type&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;eq&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;province&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;/adapter/&lt;your-system&gt;/biofarma/orders/province&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;&lt;System Name&gt; - Biofarma Province Order Created&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    FALSE, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, TRUE</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  );</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">-- Default fallback: catch-all when no specific rule matches</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">INSERT INTO</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> integration_routing_rules</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">enabled</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">VALUES</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;biofarma.order.created&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;program_id&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;eq&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&#39;&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;/adapter/default/biofarma/orders&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">    &#39;Default - Biofarma Order Created&#39;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    TRUE, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">99</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, TRUE</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  );</span></span></code></pre></div><p>Add to <a href="https://github.com/smile-health/platform/blob/main/apps/openhim-mediators/rule-router/db-scripts/routing-rules-insert.sql" target="_blank" rel="noreferrer">apps/openhim-mediators/rule-router/db-scripts/routing-rules-insert.sql</a>.</p><hr><h3 id="step-5-—-custom-transformer-required" tabindex="-1">Step 5 — Custom Transformer (Required) <a class="header-anchor" href="#step-5-—-custom-transformer-required" aria-label="Permalink to &quot;Step 5 — Custom Transformer (Required)&quot;">​</a></h3><p>The Biofarma payload uses Indonesian field names (<code>no_do</code>, <code>kode_area</code>, <code>jm_dosis</code>, etc.). A <code>BiofarmaOrderTransformer</code> normalises them to English before forwarding.</p><p><strong>Create</strong> in <code>apps/interop-service/src/modules/transformers/biofarma-order.transformer.ts</code>:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">export</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> class</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> BiofarmaOrderTransformer</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> extends</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> BaseTransformer</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  readonly</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}"> topic</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;biofarma.order.created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  readonly</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}"> cloudEventType</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &quot;com.smile.biofarma.order.created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  transform</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">    payload</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> unknown</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">    context</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> MessageContext</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  )</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> CloudEvent</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">Record</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">unknown</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;&gt; {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">requireFields</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(payload, [</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">      &quot;no_do&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;kode_area&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;produk&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;no_batch&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;jm_dosis&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;biofarma_type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    ]);</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> obj</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> payload </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">as</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Record</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">unknown</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">&gt;;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    return</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">createCloudEvent</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        delivery_number:          obj.no_do,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        delivery_date:            obj.tanggal_do </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        purchase_order_number:    obj.no_po </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        area_code:                </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">String</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(obj.kode_area),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        sender:                   obj.pengirim </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        destination:              obj.tujuan </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        product_name:             obj.produk,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        product_code_kemenkes:    obj.code_product_kemenkes </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        batch_number:             obj.no_batch,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        expiry_date:              obj.expired_date </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        quantity_vials:           obj.jm_vial </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        quantity_doses:           obj.jm_dosis,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        quantity_vials_received:  obj.jm_vial_terima </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        quantity_doses_received:  obj.jm_dosis_terima </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        status:                   obj.status </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        ship_date:                obj.tanggal_kirim </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        receive_date:             obj.tanggal_terima </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        delivery_type:            obj.biofarma_type,   </span><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// &quot;province&quot; | &quot;hub&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        service_type:             obj.service_type </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        document_number:          obj.no_document </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        released_date:            obj.released_date </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        notes:                    obj.notes </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        entrance_type:            obj.entrance_type </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        grant_country:            obj.grant_country </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        manufacture_country:      obj.manufacture_country </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">        unit_price:               obj.unit_price </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">??</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">      this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">extractSubject</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(payload),</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">      context,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    );</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">  extractSubject</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">payload</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> unknown</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> string</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> undefined</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> noDo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">getField</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(payload, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;no_do&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">);</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">    return</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> noDo </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">!==</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> undefined</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> ?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> \`biofarma_do_\${</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">noDo</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">}\`</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> :</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> undefined</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><p><strong>Register</strong> in <code>apps/interop-service/src/modules/transformers/registry.ts</code>:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Inside initializeDefaultTransformers():</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">this</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">register</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;biofarma.order.created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">new</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> BiofarmaOrderTransformer</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">());</span></span></code></pre></div><p>Set <code>ENABLE_PAYLOAD_TRANSFORMATION=true</code> in the <code>interop-service</code> environment to activate.</p><hr><h3 id="step-6-—-reload-caches" tabindex="-1">Step 6 — Reload Caches <a class="header-anchor" href="#step-6-—-reload-caches" aria-label="Permalink to &quot;Step 6 — Reload Caches&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -X</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> POST</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:4004/admin/refresh-routes</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> -X</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> POST</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:4005/admin/refresh-rules</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Verify</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:4004/admin/routes</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> jq</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;[.routes[] | .rabbitmq_topic]&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">curl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> http://localhost:4005/admin/rules</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> |</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> jq</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;[.rules[] | {topic: .topic, target: .target_name}]&#39;</span></span></code></pre></div><h3 id="step-7-—-redeploy" tabindex="-1">Step 7 — Redeploy <a class="header-anchor" href="#step-7-—-redeploy" aria-label="Permalink to &quot;Step 7 — Redeploy&quot;">​</a></h3><p>Required because a transformer was added:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Docker Compose</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">docker</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> compose</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> up</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --build</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> interop-service</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}"># Kubernetes</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">kubectl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> set</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> image</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> deployment/interop-service</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> interop-service=your-registry/interop-service:v1.x</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">kubectl</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> rollout</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> status</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> deployment/interop-service</span></span></code></pre></div><hr><h2 id="sample-payloads" tabindex="-1">Sample Payloads <a class="header-anchor" href="#sample-payloads" aria-label="Permalink to &quot;Sample Payloads&quot;">​</a></h2><h3 id="rabbitmq-message-biofarma-order-created" tabindex="-1">RabbitMQ Message (<code>biofarma.order.created</code>) <a class="header-anchor" href="#rabbitmq-message-biofarma-order-created" aria-label="Permalink to &quot;RabbitMQ Message (\`biofarma.order.created\`)&quot;">​</a></h3><blockquote><p><code>user_id</code> and <code>user_email</code> are <code>null</code> — this is a system-scheduled job with no user session. <code>client_key</code> comes from <code>integration_clients</code> where <code>key = &#39;biofarma&#39;</code>. <code>program_id</code> is resolved per material by <code>mapMaterial[produk].program_id</code>.</p></blockquote><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;topic&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;biofarma.order.created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;payload&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;no_do&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;DO-2025-BF-00123&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;tanggal_do&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;no_po&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;PO-2025-00456&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;kode_area&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;3201&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;pengirim&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;PT Bio Farma (Persero)&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;tujuan&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Dinas Kesehatan Provinsi Jawa Barat&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;alamat&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Jl. Pasteur No. 25, Bandung&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;produk&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;VAKSIN BCG (KERING) AMP 10 DOS&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;no_batch&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;BCG20250201A&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;expired_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2026-08-31&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;jm_vial&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">500</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;jm_dosis&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">5000</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;jm_vial_terima&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">500</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;jm_dosis_terima&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">5000</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;status&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;TERIMA&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;tanggal_kirim&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;tanggal_terima&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-03&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;biofarma_type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;province&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;service_type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;REGULER&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;no_document&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;SURAT-2025-001&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;released_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-02-28&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;notes&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;code_product_kemenkes&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;BCG-001&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;entrance_type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;grant_country&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;manufacture_country&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Indonesia&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;unit_price&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">0</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;context&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;program_id&quot;</span><span style="${ssrRenderStyle({
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
	})}">    &quot;workspace_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;user_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;user_email&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;request_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;bf-sync-2025-03-09T00:00:00Z-DO-2025-BF-00123&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;trace_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;client_key&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;biofarma&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;headers&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;traceparent&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h3 id="cloudevent-after-biofarmaordertransformer" tabindex="-1">CloudEvent (after <code>BiofarmaOrderTransformer</code>) <a class="header-anchor" href="#cloudevent-after-biofarmaordertransformer" aria-label="Permalink to &quot;CloudEvent (after \`BiofarmaOrderTransformer\`)&quot;">​</a></h3><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">{</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;specversion&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;1.0&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;com.smile.biofarma.order.created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;source&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;urn:smile:biofarma&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;550e8400-e29b-41d4-a716-446655440001&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;time&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-09T00:00:01.000Z&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;datacontenttype&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;application/json&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;subject&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;biofarma_do_DO-2025-BF-00123&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;program_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;1&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;workspace_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;user_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;user_email&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;request_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;bf-sync-2025-03-09T00:00:00Z-DO-2025-BF-00123&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;trace_id&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;client_key&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;biofarma&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">  &quot;data&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;delivery_number&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;DO-2025-BF-00123&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;delivery_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;purchase_order_number&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;PO-2025-00456&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;area_code&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;3201&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;sender&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;PT Bio Farma (Persero)&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;destination&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Dinas Kesehatan Provinsi Jawa Barat&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;product_name&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;VAKSIN BCG (KERING) AMP 10 DOS&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;product_code_kemenkes&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;BCG-001&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;batch_number&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;BCG20250201A&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;expiry_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2026-08-31&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;quantity_vials&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">500</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;quantity_doses&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">5000</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;quantity_vials_received&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">500</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;quantity_doses_received&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">5000</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;status&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;TERIMA&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;ship_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-01&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;receive_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-03-03&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;delivery_type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;province&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;service_type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;REGULER&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;document_number&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;SURAT-2025-001&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;released_date&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2025-02-28&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;notes&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;entrance_type&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;grant_country&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;manufacture_country&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Indonesia&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">    &quot;unit_price&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">0</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  }</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><hr><h2 id="sequence-diagram" tabindex="-1">Sequence Diagram <a class="header-anchor" href="#sequence-diagram" aria-label="Permalink to &quot;Sequence Diagram&quot;">​</a></h2><blockquote><p>Steps inside the <code>loop</code> repeat once per new or changed DO. The cron runs <code>--type province</code> then <code>--type hub</code> sequentially.</p></blockquote>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-624",
				class: "mermaid",
				graph: "sequenceDiagram%0A%20%20%20%20autonumber%0A%20%20%20%20participant%20CRON%20%20as%20Cron%20(07%3A00%20WIB)%0A%20%20%20%20participant%20BFC%20%20%20as%20BiofarmaCron%0A%20%20%20%20participant%20BFAPI%20as%20Biofarma%20API%0A%20%20%20%20participant%20SMILE%20as%20SMILE%20ws_orders%0A%20%20%20%20participant%20MQ%20%20%20%20as%20RabbitMQ%0A%20%20%20%20participant%20IS%20%20%20%20as%20interop-service%0A%20%20%20%20participant%20OHM%20%20%20as%20OpenHIM%20Core%0A%20%20%20%20participant%20RR%20%20%20%20as%20rule-router%0A%20%20%20%20participant%20DS%20%20%20%20as%20Downstream%20System%20(TBD)%0A%0A%20%20%20%20CRON%20%20-%3E%3E%20%20BFC%20%20%20%3A%20sync-biofarma-orders%20--type%20province%2Fhub%0A%20%20%20%20BFC%20%20%20-%3E%3E%20%20BFAPI%20%3A%20GET%20%2Fapi%2Fpublic%2Fget-transaksi-*%0A%20%20%20%20BFAPI%20--%3E%3E%20BFC%20%20%20%3A%20DO%20records%20(Indonesian%20field%20names)%0A%20%20%20%20BFC%20%20%20-%3E%3E%20%20SMILE%20%3A%20lookup%20existing%20orders%20by%20delivery_number%0A%20%20%20%20SMILE%20--%3E%3E%20BFC%20%20%20%3A%20existingOrders%20map%0A%0A%20%20%20%20loop%20For%20each%20new%20or%20changed%20DO%0A%0A%20%20%20%20%20%20%20%20alt%20DO%20is%20new%0A%20%20%20%20%20%20%20%20%20%20%20%20BFC%20-%3E%3E%20SMILE%20%3A%20createSmileOrder()%20POST%20%2Fv2%2Forder%2Fdropping%0A%20%20%20%20%20%20%20%20%20%20%20%20SMILE%20--%3E%3E%20BFC%20%3A%20orderId%0A%20%20%20%20%20%20%20%20else%20DO%20changed%20(metadata%20diff)%0A%20%20%20%20%20%20%20%20%20%20%20%20BFC%20-%3E%3E%20SMILE%20%3A%20cancelSmileOrder()%20PUT%20%2Forder%2F%3Aid%2Fcancel%0A%20%20%20%20%20%20%20%20%20%20%20%20SMILE%20--%3E%3E%20BFC%20%3A%20200%20OK%0A%20%20%20%20%20%20%20%20%20%20%20%20BFC%20-%3E%3E%20MQ%20%20%20%20%3A%20publish%20biofarma.order.cancelled%0A%20%20%20%20%20%20%20%20%20%20%20%20BFC%20-%3E%3E%20SMILE%20%3A%20createSmileOrder()%20POST%20%2Fv2%2Forder%2Fdropping%0A%20%20%20%20%20%20%20%20%20%20%20%20SMILE%20--%3E%3E%20BFC%20%3A%20new%20orderId%0A%20%20%20%20%20%20%20%20end%0A%0A%20%20%20%20%20%20%20%20BFC%20-%3E%3E%20MQ%20%3A%20publish%20biofarma.order.created%0A%0A%20%20%20%20%20%20%20%20MQ%20%20-%3E%3E%20IS%20%3A%20consume%20message%0A%20%20%20%20%20%20%20%20IS%20%20-%3E%3E%20IS%20%3A%20validate%20%2B%20BiofarmaOrderTransformer%0A%20%20%20%20%20%20%20%20IS%20%20-%3E%3E%20OHM%20%3A%20POST%20%2Fpub%2Fsmile%2Fbiofarma%2Forder-created%20(CloudEvent)%0A%20%20%20%20%20%20%20%20OHM%20-%3E%3E%20RR%20%20%3A%20POST%20%2Froute%0A%20%20%20%20%20%20%20%20RR%20%20-%3E%3E%20RR%20%20%3A%20evaluate%20routing%20rules%20(TBD)%0A%20%20%20%20%20%20%20%20RR%20%20-%3E%3E%20DS%20%20%3A%20POST%20%2Fadapter%2F%3Csystem%3E%2Fbiofarma%2Forders%0A%20%20%20%20%20%20%20%20DS%20%20--%3E%3E%20RR%20%3A%20200%20OK%0A%20%20%20%20%20%20%20%20RR%20%20--%3E%3E%20OHM%20%3A%20200%20Successful%20%2B%20orchestrations%0A%20%20%20%20%20%20%20%20OHM%20--%3E%3E%20IS%20%20%3A%20200%20OK%0A%20%20%20%20%20%20%20%20IS%20%20-%3E%3E%20IS%20%20%20%3A%20write%20audit%20log%0A%0A%20%20%20%20end%0A%0A%20%20%20%20BFC%20-%3E%3E%20SMILE%20%3A%20insertBiofarmaOrders()%20upsert%20integration_biofarma_orders%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="testing-end-to-end" tabindex="-1">Testing End-to-End <a class="header-anchor" href="#testing-end-to-end" aria-label="Permalink to &quot;Testing End-to-End&quot;">​</a></h2><h3 id="option-a-—-trigger-the-actual-cron-manually" tabindex="-1">Option A — Trigger the Actual Cron Manually <a class="header-anchor" href="#option-a-—-trigger-the-actual-cron-manually" aria-label="Permalink to &quot;Option A — Trigger the Actual Cron Manually&quot;">​</a></h3><p>Run for a narrow date range to avoid bulk data:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> ./src/cli.ts</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> sync-biofarma-orders</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> province</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --startDate</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> 2025-03-08</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --endDate</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> 2025-03-08</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">bun</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> ./src/cli.ts</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> sync-biofarma-orders</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> hub</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">     --startDate</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> 2025-03-08</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --endDate</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> 2025-03-08</span></span></code></pre></div><h3 id="option-b-—-publish-a-test-message-directly-to-rabbitmq" tabindex="-1">Option B — Publish a Test Message Directly to RabbitMQ <a class="header-anchor" href="#option-b-—-publish-a-test-message-directly-to-rabbitmq" aria-label="Permalink to &quot;Option B — Publish a Test Message Directly to RabbitMQ&quot;">​</a></h3><p>Use when Biofarma API is unavailable or testing the interop pipeline in isolation:</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> message</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  topic: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;biofarma.order.created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  payload: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    no_do: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;DO-TEST-001&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    kode_area: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;3201&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    produk: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;VAKSIN BCG (KERING) AMP 10 DOS&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    no_batch: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;BCG-TEST-BATCH&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    expired_date: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2026-08-31&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    jm_vial: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">10</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    jm_dosis: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">100</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    biofarma_type: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;province&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    unit_price: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">0</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  context: {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    program_id: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">1</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    workspace_id: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    user_id: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    user_email: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">null</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    request_id: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;test-bf-001&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">    client_key: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;biofarma&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">,</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  },</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  headers: {},</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">};</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">channel.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">publish</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;smile.events&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;biofarma.order.created&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, Buffer.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">from</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">JSON</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">stringify</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(message)));</span></span></code></pre></div><h3 id="verify" tabindex="-1">Verify <a class="header-anchor" href="#verify" aria-label="Permalink to &quot;Verify&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">SELECT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> status</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, http_status_code, execution_time_ms, error_message, created_at</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">FROM</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> openhim_route_execution_logs</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">WHERE</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> rabbitmq_topic </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> &#39;biofarma.order.created&#39;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">ORDER BY</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> created_at </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">DESC</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">LIMIT</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 10</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">;</span></span></code></pre></div><hr><h2 id="implementation-checklist" tabindex="-1">Implementation Checklist <a class="header-anchor" href="#implementation-checklist" aria-label="Permalink to &quot;Implementation Checklist&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>□ Confirm downstream target systems with business/integration team</span></span>
<span class="line"><span>□ Confirm filter criteria (program_id values, biofarma_type, etc.) per system</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ biofarma.order.created</span></span>
<span class="line"><span>  □ Insert into openhim_route_mappings → apps/interop-service/db-scripts/route-mapping-insert.sql</span></span>
<span class="line"><span>  □ Create OpenHIM channel (URL: /pub/smile/biofarma/order-created, client: smile-app)</span></span>
<span class="line"><span>  □ Insert routing rules with confirmed targets → apps/openhim-mediators/rule-router/db-scripts/routing-rules-insert.sql</span></span>
<span class="line"><span>  □ Write BiofarmaOrderTransformer (extends BaseTransformer, maps Indonesian fields)</span></span>
<span class="line"><span>  □ Register transformer in TransformerRegistry.initializeDefaultTransformers()</span></span>
<span class="line"><span>  □ Set ENABLE_PAYLOAD_TRANSFORMATION=true in interop-service env</span></span>
<span class="line"><span>  □ POST /admin/refresh-routes + POST /admin/refresh-rules</span></span>
<span class="line"><span>  □ Rebuild and redeploy interop-service</span></span>
<span class="line"><span>  □ Verify via GET /admin/routes and GET /admin/rules</span></span>
<span class="line"><span>  □ Test end-to-end, check openhim_route_execution_logs for success</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ biofarma.order.cancelled</span></span>
<span class="line"><span>  □ Insert into openhim_route_mappings (path: /pub/smile/biofarma/order-cancelled)</span></span>
<span class="line"><span>  □ Create OpenHIM channel</span></span>
<span class="line"><span>  □ Insert routing rules (same pattern as order.created, no transformer needed)</span></span>
<span class="line"><span>  □ Reload caches + verify + test</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ biofarma.order.smdv.synced</span></span>
<span class="line"><span>  □ Insert into openhim_route_mappings (path: /pub/smile/biofarma/smdv-synced)</span></span>
<span class="line"><span>  □ Create OpenHIM channel</span></span>
<span class="line"><span>  □ Insert routing rules (filter by data.biofarma_type: province / hub)</span></span>
<span class="line"><span>  □ Reload caches + verify + test</span></span></code></pre></div><hr><h2 id="related-documents" tabindex="-1">Related Documents <a class="header-anchor" href="#related-documents" aria-label="Permalink to &quot;Related Documents&quot;">​</a></h2><ul><li><a href="./../../architecture/interop-layer/architecture.html">Architecture</a> — Full interop layer architecture</li><li><a href="./../../architecture/interop-layer/adding-new-event.html">Adding a New Event</a> — Generic step-by-step guide</li><li><a href="./../../architecture/interop-layer/configuration-reference.html">Configuration Reference</a> — Environment variables and DB schemas</li><li><a href="./../../architecture/interop-layer/operations.html">Operations</a> — Running locally, Docker Compose, Kubernetes</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/biofarma-order-v3/biofarma-order-interop.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var biofarma_order_interop_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, biofarma_order_interop_default as default };
