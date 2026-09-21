import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/migration/workspace/migrate-stock-opnames.md
var __pageData = JSON.parse("{\"title\":\"migrate-stock-opnames.ts\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/workspace/migrate-stock-opnames.md\",\"filePath\":\"architecture/migration/workspace/migrate-stock-opnames.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/workspace/migrate-stock-opnames.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="migrate-stock-opnames-ts" tabindex="-1">migrate-stock-opnames.ts <a class="header-anchor" href="#migrate-stock-opnames-ts" aria-label="Permalink to &quot;migrate-stock-opnames.ts&quot;">​</a></h1><p><strong>Purpose</strong><br> Migrates stock opname (inventory count) records from SMILE 3.0 (<code>new_opnames</code>, <code>new_opname_items</code>, <code>new_opname_stocks</code>) into SMILE 5.0 workspace stock opnames (<code>ws_stock_opnames</code>), preserving core fields and updating on-duplicate key, then records mappings.</p><p><strong>Associated CLI Command</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">app-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate-ws-stock-opnames</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --batchSize</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">numbe</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">r</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> [--programId </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">programI</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">d</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">]</span></span></code></pre></div><hr><h2 id="source-tables-before-–-smile-3-0" tabindex="-1">Source Tables (Before – SMILE 3.0) <a class="header-anchor" href="#source-tables-before-–-smile-3-0" aria-label="Permalink to &quot;Source Tables (Before – SMILE 3.0)&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Table</th><th>Notes</th></tr></thead><tbody><tr><td><code>new_opnames</code></td><td>Master opname header: <code>id</code>, <code>entity_id</code>, <code>activity_id</code>, <code>period_id</code>, <code>status</code>, <code>created_at</code>, <code>updated_at</code>, <code>created_by</code></td></tr><tr><td><code>new_opname_items</code></td><td>Item lines: <code>id</code>, <code>new_opname_id</code>, <code>master_material_id</code></td></tr><tr><td><code>new_opname_stocks</code></td><td>Stock details: <code>id</code>, <code>new_opname_item_id</code>, <code>batch_id</code>, <code>batch_code</code>, <code>expired_date</code>, <code>real_qty</code>, <code>smile_qty</code>, <code>unsubmit_distribution_qty</code>, <code>unsubmit_return_qty</code></td></tr><tr><td>Joined on IDs</td><td>Data is joined across these three tables</td></tr></tbody></table><hr><h2 id="target-table-after-–-smile-5-0" tabindex="-1">Target Table (After – SMILE 5.0) <a class="header-anchor" href="#target-table-after-–-smile-5-0" aria-label="Permalink to &quot;Target Table (After – SMILE 5.0)&quot;">​</a></h2><p>Table: <code>ws_stock_opnames</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code> (auto-generated)</td><td>Platform workbook record ID</td></tr><tr><td><code>entity_id</code></td><td>Platform entity ID (mapped via <code>getMapEntityIds</code>)</td></tr><tr><td><code>activity_id</code></td><td>Platform activity ID (mapped via <code>getMapActivityIds</code>)</td></tr><tr><td><code>period_id</code></td><td>Original period identifier</td></tr><tr><td><code>material_id</code></td><td>Platform material ID (mapped via <code>getMapMaterialIds</code>)</td></tr><tr><td><code>parent_material_id</code></td><td>Parent material ID if hierarchy (mapped via same helper)</td></tr><tr><td><code>stock_id</code></td><td>Platform stock ID (mapped via <code>getMapStockIds</code>)</td></tr><tr><td><code>batch_code</code></td><td>Batch code</td></tr><tr><td><code>expired_date</code></td><td>Expiry date</td></tr><tr><td><code>recorded_qty</code></td><td><code>smile_qty</code> from source</td></tr><tr><td><code>actual_qty</code></td><td><code>real_qty</code> from source</td></tr><tr><td><code>in_transit_qty</code></td><td>Computed <code>GREATEST(unsubmit_distribution_qty, unsubmit_return_qty)</code></td></tr><tr><td><code>is_within_period</code></td><td>Original <code>status</code></td></tr><tr><td><code>created_at</code>, <code>updated_at</code></td><td>Preserved timestamps</td></tr><tr><td><code>created_by</code></td><td>Mapped via <code>getMapUserIds</code></td></tr></tbody></table><hr><h2 id="mapping-table" tabindex="-1">Mapping Table <a class="header-anchor" href="#mapping-table" aria-label="Permalink to &quot;Mapping Table&quot;">​</a></h2><p>Helper <code>insertTableMapping(&quot;stock_opnames&quot;, programId, mapLegacyToPlatform)</code> populates <code>mapping_stock_opnames</code>:</p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>existing_stock_opname_id</code></td><td>Legacy <code>new_opnames.id</code></td></tr><tr><td><code>platform_stock_opname_id</code></td><td>New <code>ws_stock_opnames.id</code></td></tr><tr><td><code>program_id</code></td><td>Workspace/program ID</td></tr></tbody></table><hr><h2 id="parameters-options" tabindex="-1">Parameters &amp; Options <a class="header-anchor" href="#parameters-options" aria-label="Permalink to &quot;Parameters &amp; Options&quot;">​</a></h2><ul><li><code>--batchSize &lt;number&gt;</code>: Number of opname rows per batch.</li><li><code>--programId &lt;programId&gt;</code>: Legacy program ID (default = 1).</li></ul><hr><h2 id="dependencies" tabindex="-1">Dependencies <a class="header-anchor" href="#dependencies" aria-label="Permalink to &quot;Dependencies&quot;">​</a></h2><ul><li><strong>Constants</strong>: <ul><li><code>MAP_EXISTING_ACTIVITY_IDS</code></li><li><code>MAP_EXISTING_TO_PLATFORM</code></li></ul></li><li><strong>Helpers &amp; Libraries</strong>: <ul><li><code>getMigrationDB(programId)</code></li><li><code>db.transaction()</code> for batch inserts</li><li><code>getMapEntityIds()</code>, <code>getMapActivityIds()</code>, <code>getMapMaterialIds()</code>, <code>getMapStockIds()</code>, <code>getMapUserIds()</code></li><li><code>insertTableMapping()</code></li><li><code>collect()</code>, <code>getUniqueIdsFromFields()</code></li></ul></li></ul><hr><h2 id="key-logic-summary" tabindex="-1">Key Logic Summary <a class="header-anchor" href="#key-logic-summary" aria-label="Permalink to &quot;Key Logic Summary&quot;">​</a></h2><ol><li><p><strong>Batch Loop</strong><br> Page through <code>new_opnames.id</code> in batches until exhausted.</p></li><li><p><strong>Per-Batch Transaction</strong></p><ul><li>Join <code>new_opnames</code> → <code>new_opname_items</code> → <code>new_opname_stocks</code>.</li><li>Extract fields and compute <code>in_transit_qty</code>.</li><li>Preload all required platform ID maps in parallel.</li><li>Bulk-insert into <code>ws_stock_opnames</code> with <code>onDuplicateKeyUpdate</code> on quantities.</li><li>Do not exit process explicitly (returns to loop).</li></ul></li><li><p><strong>Exit</strong><br> Completes when no more batches.</p></li></ol><hr><h2 id="data-flow-diagram" tabindex="-1">Data Flow Diagram <a class="header-anchor" href="#data-flow-diagram" aria-label="Permalink to &quot;Data Flow Diagram&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-369",
				class: "mermaid",
				graph: "graph%20TD%0A%20%20subgraph%20SMILE3%20DB%0A%20%20%20%20NO%5B%22new_opnames%22%5D%0A%20%20%20%20NOI%5B%22new_opname_items%22%5D%0A%20%20%20%20NOS%5B%22new_opname_stocks%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Helpers%0A%20%20%20%20E%5B%22getMapEntityIds%22%5D%0A%20%20%20%20A%5B%22getMapActivityIds%22%5D%0A%20%20%20%20M%5B%22getMapMaterialIds%22%5D%0A%20%20%20%20S%5B%22getMapStockIds%22%5D%0A%20%20%20%20U%5B%22getMapUserIds%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Script%20Logic%0A%20%20%20%20F%5B%22Fetch%20joined%20rows%22%5D%0A%20%20%20%20P%5B%22Parallel%20preload%20maps%20(E%2CA%2CM%2CS%2CU)%22%5D%0A%20%20%20%20I%5B%22Bulk%20insert%20ws_stock_opnames%20(onDuplicate)%22%5D%0A%20%20%20%20L%5B%22insertTableMapping%22%5D%0A%20%20end%0A%0A%20%20subgraph%20SMILE5%20DB%0A%20%20%20%20WSO%5B%22ws_stock_opnames%22%5D%0A%20%20%20%20MSO%5B%22mapping_stock_opnames%22%5D%0A%20%20end%0A%0A%20%20NO%20--%3E%20NOI%20--%3E%20NOS%20--%3E%20F%20--%3E%20I%20--%3E%20WSO%0A%20%20F%20--%3E%20P%0A%20%20I%20--%3E%20L%20--%3E%20MSO%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="before-after-tables" tabindex="-1">Before &amp; After Tables <a class="header-anchor" href="#before-after-tables" aria-label="Permalink to &quot;Before &amp; After Tables&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Stage</th><th>Table</th><th>Key Columns</th></tr></thead><tbody><tr><td>Before</td><td><code>new_opnames</code> + joins</td><td><code>id</code>, <code>entity_id</code>, <code>activity_id</code>, <code>batch_id</code>, …</td></tr><tr><td>After</td><td><code>ws_stock_opnames</code></td><td><code>id</code>, <code>entity_id</code>, <code>activity_id</code>, <code>batch_code</code>, <code>recorded_qty</code>, etc.</td></tr><tr><td>Mapping</td><td><code>mapping_stock_opnames</code></td><td><code>existing_stock_opname_id</code>, <code>platform_stock_opname_id</code>, <code>program_id</code></td></tr></tbody></table></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/workspace/migrate-stock-opnames.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var migrate_stock_opnames_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, migrate_stock_opnames_default as default };
