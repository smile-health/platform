import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/migration/global/migrate-activity.md
var __pageData = JSON.parse("{\"title\":\"migrate-activity.ts\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/global/migrate-activity.md\",\"filePath\":\"architecture/migration/global/migrate-activity.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/global/migrate-activity.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="migrate-activity-ts" tabindex="-1">migrate-activity.ts <a class="header-anchor" href="#migrate-activity-ts" aria-label="Permalink to &quot;migrate-activity.ts&quot;">​</a></h1><p><strong>Purpose</strong><br> Migrates core “activity” records from the SMILE 3.0 database (<code>master_activities</code>) into SMILE 5.0 workspace activities (<code>ws_activities</code>), and records ID mappings in <code>mapping_activities</code>.</p><p><strong>Associated CLI Command</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">app-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate-activity</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> [--reset] [--limit </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">] [--programId </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&lt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">programId</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]</span></span></code></pre></div><hr><h2 id="source-table-before-–-smile-3-0" tabindex="-1">Source Table (Before – SMILE 3.0) <a class="header-anchor" href="#source-table-before-–-smile-3-0" aria-label="Permalink to &quot;Source Table (Before – SMILE 3.0)&quot;">​</a></h2><p>Table: <code>master_activities</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Primary key of the source activity</td></tr><tr><td><code>code</code></td><td>Activity code used to infer default program mapping</td></tr><tr><td><code>name</code></td><td>Human-readable activity name</td></tr><tr><td><code>is_ordered_purchase</code></td><td>Boolean flag</td></tr><tr><td><code>is_ordered_sales</code></td><td>Boolean flag</td></tr><tr><td><code>created_at</code>, <code>updated_at</code></td><td>Timestamps</td></tr><tr><td><code>deleted_at</code></td><td>Null indicates active records</td></tr></tbody></table><hr><h2 id="target-table-after-–-smile-5-0" tabindex="-1">Target Table (After – SMILE 5.0) <a class="header-anchor" href="#target-table-after-–-smile-5-0" aria-label="Permalink to &quot;Target Table (After – SMILE 5.0)&quot;">​</a></h2><ol><li><p><strong>Workspace Activities</strong><br> Table: <code>ws_activities</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>insertId</code></td><td>Auto-generated primary key (platform_activity_id)</td></tr><tr><td><code>name</code></td><td>Migrated <code>name</code></td></tr><tr><td><code>program_id</code></td><td>Mapped program ID</td></tr><tr><td><code>is_ordered_purchase</code></td><td>Migrated flag</td></tr><tr><td><code>is_ordered_sales</code></td><td>Migrated flag</td></tr><tr><td><code>created_at</code>, <code>updated_at</code></td><td>Preserved timestamps</td></tr></tbody></table></li><li><p><strong>Activity Mapping</strong><br> Table: <code>mapping_activities</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>existing_activity_id</code></td><td>Original <code>master_activities.id</code></td></tr><tr><td><code>platform_activity_id</code></td><td>New <code>ws_activities.insertId</code></td></tr><tr><td><code>program_id</code></td><td>Program under which activity was migrated</td></tr><tr><td><code>existing_program_id</code></td><td>Source program ID from SMILE 3.0</td></tr></tbody></table></li></ol><hr><h2 id="parameters-options" tabindex="-1">Parameters &amp; Options <a class="header-anchor" href="#parameters-options" aria-label="Permalink to &quot;Parameters &amp; Options&quot;">​</a></h2><ul><li><code>--reset</code>: Clears Redis cursor (<code>current_activity_id</code>) before migration.</li><li><code>--limit &lt;number&gt;</code>: Maximum rows to migrate in this batch; default is all.</li><li><code>--programId &lt;programId&gt;</code>: Source SMILE 3.0 program ID; default = 1.</li></ul><hr><h2 id="dependencies" tabindex="-1">Dependencies <a class="header-anchor" href="#dependencies" aria-label="Permalink to &quot;Dependencies&quot;">​</a></h2><ul><li><strong>Constants</strong>: <ul><li><code>MAP_EXISTING_TO_PLATFORM</code> (for program IDs)</li><li><code>MAP_EXISTING_ACTIVITY_IDS</code> (not used here, but available)</li></ul></li><li><strong>Helpers</strong>: <ul><li><code>getMigrationDB(programId)</code> for source DB connection</li><li><code>db</code> for target DB (<code>ws_activities</code> inserts)</li><li><code>syncDB</code> for <code>mapping_activities</code> inserts</li><li><code>redis</code> for cursor management</li></ul></li></ul><hr><h2 id="key-logic-summary" tabindex="-1">Key Logic Summary <a class="header-anchor" href="#key-logic-summary" aria-label="Permalink to &quot;Key Logic Summary&quot;">​</a></h2><ol><li><p><strong>Cursor Reset</strong> (if <code>--reset</code>):<br> Clears Redis key <code>current_activity_id</code>.</p></li><li><p><strong>Fetch Batches</strong>:</p><ul><li>Reads next batch of IDs from <code>master_activities</code> where <code>id &gt; current_cursor</code> and not deleted.</li><li>Applies <code>limit</code> if provided.</li></ul></li><li><p><strong>Row-by-Row Migration</strong>:<br> For each source row:</p><ul><li>Fetch full record by <code>id</code>.</li><li>Determine <code>program_id</code>: <ul><li>Use hard-coded <code>MAP_ACTIVITY_TO_PROGRAM_ID</code> map (per activity <code>code</code>) or CLI <code>programId</code>.</li></ul></li><li>Insert into <code>ws_activities</code>, capturing new <code>insertId</code>.</li><li>Insert into <code>mapping_activities</code> to record ID mapping.</li><li>Update Redis cursor to <code>row.id</code>.</li></ul></li><li><p><strong>Exit</strong>:<br> Ends process after all rows or batch completed.</p></li></ol><hr><h2 id="data-flow-diagram" tabindex="-1">Data Flow Diagram <a class="header-anchor" href="#data-flow-diagram" aria-label="Permalink to &quot;Data Flow Diagram&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-358",
				class: "mermaid",
				graph: "graph%20TD%0A%20%20subgraph%20SMILE%203.0%20DB%0A%20%20%20%20S3_OldActivities%5B%22master_activities%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Constants%0A%20%20%20%20CONST%5B%22MAP_ACTIVITY_TO_PROGRAM_ID%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Script%20Logic%0A%20%20%20%20A%5B%22Fetch%20IDs%20%3E%20cursor%22%5D%0A%20%20%20%20B%5B%22Fetch%20full%20record%20by%20ID%22%5D%0A%20%20%20%20C%5B%22Map%20program%20ID%20(CONST%20or%20CLI)%22%5D%0A%20%20%20%20D%5B%22Insert%20into%20ws_activities%22%5D%0A%20%20%20%20E%5B%22Insert%20into%20mapping_activities%22%5D%0A%20%20%20%20F%5B%22Update%20Redis%20cursor%22%5D%0A%20%20end%0A%0A%20%20subgraph%20SMILE%205.0%20DB%0A%20%20%20%20S5_WorkspaceActivities%5B%22ws_activities%22%5D%0A%20%20%20%20S5_MappingActivities%5B%22mapping_activities%22%5D%0A%20%20end%0A%0A%20%20S3_OldActivities%20--%3E%20A%0A%20%20A%20--%3E%20B%0A%20%20B%20--%3E%20C%0A%20%20C%20--%3E%20D%0A%20%20D%20--%3E%20S5_WorkspaceActivities%0A%20%20D%20--%3E%20E%0A%20%20E%20--%3E%20S5_MappingActivities%0A%20%20E%20--%3E%20F%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/global/migrate-activity.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var migrate_activity_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, migrate_activity_default as default };
