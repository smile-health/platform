import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/migration/workspace/migrate-batches.md
var __pageData = JSON.parse("{\"title\":\"migrate-batches.ts\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/workspace/migrate-batches.md\",\"filePath\":\"architecture/migration/workspace/migrate-batches.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/workspace/migrate-batches.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="migrate-batches-ts" tabindex="-1">migrate-batches.ts <a class="header-anchor" href="#migrate-batches-ts" aria-label="Permalink to &quot;migrate-batches.ts&quot;">​</a></h1><p><strong>Purpose</strong><br> Migrates batch metadata from SMILE 3.0 (<code>batches</code> joined with <code>stocks</code>) into SMILE 5.0 workspace batches (<code>ws_batches</code>) and records ID mappings.</p><p><strong>Associated CLI Command</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">app-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate-ws-batch</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> --programId</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> &lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">programI</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">d</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span></span></code></pre></div><hr><h2 id="source-tables-before-–-smile-3-0" tabindex="-1">Source Tables (Before – SMILE 3.0) <a class="header-anchor" href="#source-tables-before-–-smile-3-0" aria-label="Permalink to &quot;Source Tables (Before – SMILE 3.0)&quot;">​</a></h2><ol><li><p><strong><code>batches</code></strong></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Batch primary key</td></tr><tr><td><code>manufacture_id</code></td><td>FK to legacy manufacture</td></tr><tr><td><code>code</code></td><td>Batch code</td></tr><tr><td><code>production_date</code></td><td>Manufacture date</td></tr><tr><td><code>expired_date</code></td><td>Expiration date</td></tr></tbody></table></li><li><p><strong><code>stocks</code></strong> (joined)</p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>batch_id</code></td><td>FK to <code>batches.id</code></td></tr><tr><td><code>activity_id</code></td><td>Filter: must belong to migrated activities</td></tr></tbody></table></li></ol><hr><h2 id="target-table-after-–-smile-5-0" tabindex="-1">Target Table (After – SMILE 5.0) <a class="header-anchor" href="#target-table-after-–-smile-5-0" aria-label="Permalink to &quot;Target Table (After – SMILE 5.0)&quot;">​</a></h2><ol><li><p><strong>Workspace Batches</strong><br> Table: <code>ws_batches</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Auto-generated primary key</td></tr><tr><td><code>code</code></td><td>Migrated <code>batches.code</code></td></tr><tr><td><code>manufacture_id</code></td><td>Platform manufacture ID</td></tr><tr><td><code>production_date</code></td><td>Migrated date</td></tr><tr><td><code>expired_date</code></td><td>Migrated date</td></tr></tbody></table></li><li><p><strong>Mapping Table</strong><br> Table: <code>mapping_batches</code> (via <code>insertTableMapping(&quot;batches&quot;, progId, map)</code>)</p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>existing_batch_id</code></td><td>Legacy <code>batches.id</code></td></tr><tr><td><code>platform_batch_id</code></td><td>New <code>ws_batches.id</code></td></tr><tr><td><code>program_id</code></td><td>Workspace/program ID</td></tr></tbody></table></li></ol><hr><h2 id="parameters-options" tabindex="-1">Parameters &amp; Options <a class="header-anchor" href="#parameters-options" aria-label="Permalink to &quot;Parameters &amp; Options&quot;">​</a></h2><ul><li><code>--programId &lt;programId&gt;</code>: Legacy program ID, determines which activities are considered via <code>MAP_EXISTING_ACTIVITY_IDS</code>.</li></ul><hr><h2 id="dependencies" tabindex="-1">Dependencies <a class="header-anchor" href="#dependencies" aria-label="Permalink to &quot;Dependencies&quot;">​</a></h2><ul><li><strong>Constants</strong>: <ul><li><code>MAP_EXISTING_ACTIVITY_IDS[programId]</code>: List of legacy activity IDs to filter batches.</li><li><code>MAP_EXISTING_TO_PLATFORM[programId]</code>: Target workspace IDs.</li></ul></li><li><strong>Helpers &amp; Libraries</strong>: <ul><li><code>getMigrationDB(programId)</code> for source DB</li><li><code>db.transaction()</code> for atomic insert</li><li><code>insertTableMapping()</code> for mapping writes</li><li><code>collect()</code> to extract legacy IDs</li></ul></li></ul><hr><h2 id="key-logic-summary" tabindex="-1">Key Logic Summary <a class="header-anchor" href="#key-logic-summary" aria-label="Permalink to &quot;Key Logic Summary&quot;">​</a></h2><ol><li><p><strong>Determine Workspaces</strong></p><ul><li>Lookup <code>MAP_EXISTING_TO_PLATFORM[programId]</code> for target workspace IDs.</li></ul></li><li><p><strong>Per-Workspace Transaction</strong><br> For each <code>workspaceId</code>:</p><ul><li><strong>Fetch Batches</strong><ul><li>Query distinct <code>batches</code> having at least one <code>stock.activity_id</code> in <code>MAP_EXISTING_ACTIVITY_IDS[programId]</code>.</li></ul></li><li><strong>Insert ws_batches</strong><ul><li>Bulk-insert batch records into <code>ws_batches</code>.</li><li>Capture returned IDs and map to legacy <code>batches.id</code>.</li></ul></li><li><strong>Record Mappings</strong><ul><li>Call <code>insertTableMapping(&quot;batches&quot;, workspaceId, mapLegacyToPlatform)</code>.</li></ul></li></ul></li><li><p><strong>Exit</strong></p><ul><li>Log finish and <code>process.exit(0)</code>.</li></ul></li></ol><hr><h2 id="data-flow-diagram" tabindex="-1">Data Flow Diagram <a class="header-anchor" href="#data-flow-diagram" aria-label="Permalink to &quot;Data Flow Diagram&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-361",
				class: "mermaid",
				graph: "graph%20TD%0A%20%20subgraph%20SMILE3%20DB%0A%20%20%20%20Batches%5B%22batches%20%E2%A8%9D%20stocks%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Constants%0A%20%20%20%20ACTMAP%5B%22MAP_EXISTING_ACTIVITY_IDS%22%5D%0A%20%20%20%20WS%5B%22MAP_EXISTING_TO_PLATFORM%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Script%20Logic%0A%20%20%20%20A%5B%22Loop%20workspace%20IDs%20from%20WS%22%5D%0A%20%20%20%20B%5B%22Fetch%20filtered%20batches%22%5D%0A%20%20%20%20C%5B%22Insert%20into%20ws_batches%22%5D%0A%20%20%20%20D%5B%22Record%20mapping%22%5D%0A%20%20end%0A%0A%20%20subgraph%20SMILE5%20DB%0A%20%20%20%20WSB%5B%22ws_batches%22%5D%0A%20%20%20%20MB%5B%22mapping_batches%22%5D%0A%20%20end%0A%0A%20%20ACTMAP%20--%3E%20Batches%0A%20%20WS%20--%3E%20A%0A%20%20A%20--%3E%20B%0A%20%20B%20--%3E%20C%20--%3E%20WSB%0A%20%20C%20--%3E%20D%20--%3E%20MB%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="before-after-tables" tabindex="-1">Before &amp; After Tables <a class="header-anchor" href="#before-after-tables" aria-label="Permalink to &quot;Before &amp; After Tables&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Stage</th><th>Table</th><th>Key Columns</th></tr></thead><tbody><tr><td>Before</td><td><code>batches</code> &amp; <code>stocks</code></td><td><code>batches.id</code>, <code>code</code>, <code>manufacture_id</code>, …</td></tr><tr><td>After</td><td><code>ws_batches</code></td><td><code>id</code>, <code>code</code>, <code>manufacture_id</code>, <code>production_date</code>, <code>expired_date</code></td></tr><tr><td>Mapping</td><td><code>mapping_batches</code></td><td><code>existing_batch_id</code>, <code>platform_batch_id</code>, <code>program_id</code></td></tr></tbody></table></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/workspace/migrate-batches.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var migrate_batches_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, migrate_batches_default as default };
