import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/migration/global/migrate-entity-bulk.md
var __pageData = JSON.parse("{\"title\":\"migrate-entity-bulk.ts\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/global/migrate-entity-bulk.md\",\"filePath\":\"architecture/migration/global/migrate-entity-bulk.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/global/migrate-entity-bulk.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="migrate-entity-bulk-ts" tabindex="-1">migrate-entity-bulk.ts <a class="header-anchor" href="#migrate-entity-bulk-ts" aria-label="Permalink to &quot;migrate-entity-bulk.ts&quot;">​</a></h1><p><strong>Purpose</strong><br> Bulk-migrates “entity” records from SMILE 3.0 (<code>entities</code> table) into SMILE 5.0 global <code>entities</code> and workspace <code>entity_workspaces</code>, recording legacy-to-platform ID mappings.</p><p><strong>Associated CLI Command</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">app-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate-entity-bulk</span><span style="${ssrRenderStyle({
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
	})}">]</span></span></code></pre></div><hr><h2 id="source-table-before-–-smile-3-0" tabindex="-1">Source Table (Before – SMILE 3.0) <a class="header-anchor" href="#source-table-before-–-smile-3-0" aria-label="Permalink to &quot;Source Table (Before – SMILE 3.0)&quot;">​</a></h2><p>Table: <code>entities</code> (aliased <code>e</code>)</p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Legacy entity primary key</td></tr><tr><td><code>code</code></td><td>Unique entity code</td></tr><tr><td><code>id_satu_sehat</code></td><td>Alternate unique identifier</td></tr><tr><td><code>type</code>, <code>status</code></td><td>Integer flags</td></tr><tr><td><code>name</code></td><td>Entity name</td></tr><tr><td><code>entity_tag_id</code></td><td>Foreign key to entity tags</td></tr><tr><td><code>address</code>, <code>country</code></td><td>Location info</td></tr><tr><td><code>province_id</code>, <code>regency_id</code>, <code>sub_district_id</code>, <code>village_id</code></td><td>Location IDs</td></tr><tr><td><code>postal_code</code></td><td>Postal code</td></tr><tr><td><code>lat</code>, <code>lng</code></td><td>Coordinates</td></tr><tr><td><code>is_puskesmas</code>, <code>is_vendor</code></td><td>Boolean flags</td></tr><tr><td><code>created_at</code>, <code>updated_at</code></td><td>Timestamps</td></tr><tr><td><code>deleted_at</code></td><td>Null = active</td></tr></tbody></table><hr><h2 id="target-tables-after-–-smile-5-0" tabindex="-1">Target Tables (After – SMILE 5.0) <a class="header-anchor" href="#target-tables-after-–-smile-5-0" aria-label="Permalink to &quot;Target Tables (After – SMILE 5.0)&quot;">​</a></h2><ol><li><p><strong>Global Entities</strong><br> Table: <code>entities</code><br> Migrated columns:<br><code>id_satu_sehat</code>, <code>code</code>, <code>type</code>, <code>status</code>, <code>name</code>, <code>entity_tag_id</code>, <code>address</code>, <code>country</code>, <code>province_id</code>, <code>regency_id</code>, <code>sub_district_id</code>, <code>village_id</code>, <code>postal_code</code>, <code>lat</code>, <code>lng</code>, <code>is_puskesmas</code>, <code>is_vendor</code>, <code>created_at</code>, <code>updated_at</code></p></li><li><p><strong>Workspace Entities</strong><br> Table: <code>entity_workspaces</code><br> Columns: <code>entity_id</code> (platform ID), <code>workspace_id</code></p></li><li><p><strong>Mapping Table</strong><br> Uses helper <code>insertTableMapping(&quot;entities&quot;, progId, mapLegacyToPlatform)</code><br> Records in <code>mapping_entities</code>:</p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id_entitas_smile</code></td><td>Legacy <code>entities.id</code></td></tr><tr><td><code>id_entitas_platform</code></td><td>New platform <code>entities.id</code></td></tr><tr><td><code>program_id</code></td><td>Source program ID</td></tr></tbody></table></li></ol><hr><h2 id="parameters-options" tabindex="-1">Parameters &amp; Options <a class="header-anchor" href="#parameters-options" aria-label="Permalink to &quot;Parameters &amp; Options&quot;">​</a></h2><ul><li><code>--batchSize &lt;number&gt;</code>: Rows per transaction batch (required)</li><li><code>--programId &lt;programId&gt;</code>: Legacy program ID (default = 1)</li></ul><hr><h2 id="dependencies" tabindex="-1">Dependencies <a class="header-anchor" href="#dependencies" aria-label="Permalink to &quot;Dependencies&quot;">​</a></h2><ul><li><strong>Constants</strong>: <ul><li><code>MAP_EXISTING_TO_PLATFORM</code> (maps legacy program to platform workspaces)</li></ul></li><li><strong>Helpers &amp; Libraries</strong>: <ul><li><code>getMigrationDB(programId)</code></li><li><code>db.transaction()</code> (for atomic batch inserts)</li><li><code>insertTableMapping</code></li><li><code>collect</code> (array helper)</li><li><code>partition</code> (split new vs existing)</li></ul></li></ul><hr><h2 id="key-logic-summary" tabindex="-1">Key Logic Summary <a class="header-anchor" href="#key-logic-summary" aria-label="Permalink to &quot;Key Logic Summary&quot;">​</a></h2><ol><li><p><strong>Batch Loop</strong></p><ul><li>Page through legacy IDs from <code>entities</code> in batches of <code>batchSize</code>.</li><li>Stops when no more rows.</li></ul></li><li><p><strong>Per-Batch Transaction</strong></p><ul><li>Fetch full rows plus any existing mapping (<code>mapping_entities</code>) and tags join.</li><li><strong>Detect Existing vs New</strong>: <ul><li>Query platform <code>entities</code> by matching <code>code</code> or <code>id_satu_sehat</code>.</li><li>Partition rows into <code>existingEntities</code> and <code>entities</code> (new).</li></ul></li><li><strong>Insert New Globals</strong>: <ul><li>Bulk-insert new entity records into <code>entities</code>.</li><li>Compute new platform IDs from <code>insertId</code>.</li></ul></li><li><strong>Collect Workspace Rows</strong>: <ul><li>For both existing and new, build <code>entity_workspaces</code> payloads.</li></ul></li><li><strong>Insert Workspaces</strong>: <ul><li>For each platform workspace ID from <code>MAP_EXISTING_TO_PLATFORM[programId]</code>, bulk-insert into <code>entity_workspaces</code>.</li><li>Compute new workspace record IDs.</li></ul></li><li><strong>Record Mappings</strong>: <ul><li>Build <code>legacyId → platformWorkspaceId</code> map and call <code>insertTableMapping</code>.</li></ul></li></ul></li><li><p><strong>Exit</strong><br> Logs and <code>process.exit(0)</code>.</p></li></ol><hr><h2 id="data-flow-diagram" tabindex="-1">Data Flow Diagram <a class="header-anchor" href="#data-flow-diagram" aria-label="Permalink to &quot;Data Flow Diagram&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-379",
				class: "mermaid",
				graph: "graph%20TD%0A%20%20subgraph%20SMILE3%20DB%0A%20%20%20%20LegacyRows%5B%22entities%20(batch)%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Script%0A%20%20%20%20A%5B%22Fetch%20batch%20IDs%22%5D%0A%20%20%20%20B%5B%22Fetch%20full%20rows%20%2B%20joins%22%5D%0A%20%20%20%20C%5B%22Detect%20existing%20vs%20new%22%5D%0A%20%20%20%20D%5B%22Bulk-insert%20new%20entities%22%5D%0A%20%20%20%20E%5B%22Prepare%20workspace%20rows%22%5D%0A%20%20%20%20F%5B%22Insert%20entity_workspaces%22%5D%0A%20%20%20%20G%5B%22insertTableMapping%22%5D%0A%20%20end%0A%0A%20%20subgraph%20SMILE5%20DB%0A%20%20%20%20GlobalEnt%5B%22entities%22%5D%0A%20%20%20%20WorkspaceEnt%5B%22entity_workspaces%22%5D%0A%20%20%20%20MapEnt%5B%22mapping_entities%22%5D%0A%20%20end%0A%0A%20%20LegacyRows%20--%3E%20A%0A%20%20A%20--%3E%20B%0A%20%20B%20--%3E%20C%0A%20%20C%20--%3E%7Cnew%7C%20D%0A%20%20D%20--%3E%20GlobalEnt%0A%20%20C%20--%3E%7Call%7C%20E%0A%20%20E%20--%3E%20F%0A%20%20F%20--%3E%20WorkspaceEnt%0A%20%20F%20--%3E%20G%0A%20%20G%20--%3E%20MapEnt%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="before-after-tables" tabindex="-1">Before &amp; After Tables <a class="header-anchor" href="#before-after-tables" aria-label="Permalink to &quot;Before &amp; After Tables&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Stage</th><th>Table</th><th>Key Columns</th></tr></thead><tbody><tr><td>Before</td><td><code>entities</code></td><td><code>id</code>, <code>code</code>, <code>id_satu_sehat</code>, ..., <code>updated_at</code></td></tr><tr><td>After (Global)</td><td><code>entities</code></td><td><code>id</code>, <code>code</code>, <code>id_satu_sehat</code>, ..., <code>updated_at</code></td></tr><tr><td>After (Workspace)</td><td><code>entity_workspaces</code></td><td><code>entity_id</code>, <code>workspace_id</code></td></tr><tr><td>Mapping</td><td><code>mapping_entities</code></td><td><code>id_entitas_smile</code>, <code>id_entitas_platform</code>, <code>program_id</code></td></tr></tbody></table></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/global/migrate-entity-bulk.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var migrate_entity_bulk_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, migrate_entity_bulk_default as default };
