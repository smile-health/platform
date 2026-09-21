import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/migration/workspace/migrate-patients.md
var __pageData = JSON.parse("{\"title\":\"migrate-patients.ts\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/migration/workspace/migrate-patients.md\",\"filePath\":\"architecture/migration/workspace/migrate-patients.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/migration/workspace/migrate-patients.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="migrate-patients-ts" tabindex="-1">migrate-patients.ts <a class="header-anchor" href="#migrate-patients-ts" aria-label="Permalink to &quot;migrate-patients.ts&quot;">​</a></h1><p><strong>Purpose</strong><br> Migrates patient records from SMILE 3.0 (<code>patients</code> table) into SMILE 5.0 workspace patients (<code>ws_patients</code>) and records ID mappings.</p><p><strong>Associated CLI Command</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">app-cli</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> migrate-ws-patients</span><span style="${ssrRenderStyle({
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
	})}">]</span></span></code></pre></div><hr><h2 id="source-table-before-–-smile-3-0" tabindex="-1">Source Table (Before – SMILE 3.0) <a class="header-anchor" href="#source-table-before-–-smile-3-0" aria-label="Permalink to &quot;Source Table (Before – SMILE 3.0)&quot;">​</a></h2><p>Table: <code>patients</code> (aliased <code>p</code>)</p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code></td><td>Legacy patient primary key</td></tr><tr><td><code>entity_id</code></td><td>FK to <code>entities</code></td></tr><tr><td><code>nik</code></td><td>National ID</td></tr><tr><td><code>vaccine_sequence</code></td><td>Vaccination sequence number</td></tr><tr><td><code>last_vaccine_at</code></td><td>Last vaccination timestamp</td></tr><tr><td><code>identity_type</code></td><td>ID document type</td></tr><tr><td><code>preexposure_sequence</code></td><td>Pre-exposure sequence number</td></tr><tr><td><code>last_preexposure_at</code></td><td>Last pre-exposure timestamp</td></tr><tr><td><code>stop_notification</code></td><td>Boolean flag</td></tr><tr><td><code>phone_number</code></td><td>Contact number</td></tr><tr><td><code>vaccine_method</code></td><td>Delivery method</td></tr><tr><td><code>created_at</code>, <code>updated_at</code>, <code>deleted_at</code></td><td>Timestamps</td></tr></tbody></table><hr><h2 id="target-table-after-–-smile-5-0" tabindex="-1">Target Table (After – SMILE 5.0) <a class="header-anchor" href="#target-table-after-–-smile-5-0" aria-label="Permalink to &quot;Target Table (After – SMILE 5.0)&quot;">​</a></h2><ol><li><p><strong>Workspace Patients</strong><br> Table: <code>ws_patients</code></p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>id</code> (auto-generated)</td><td>Platform record ID</td></tr><tr><td><code>nik</code></td><td>Migrated <code>nik</code></td></tr><tr><td><code>vaccine_sequence</code></td><td>Migrated</td></tr><tr><td><code>last_vaccine_at</code></td><td>Migrated</td></tr><tr><td><code>identity_type</code></td><td>Migrated</td></tr><tr><td><code>preexposure_sequence</code></td><td>Migrated</td></tr><tr><td><code>last_preexposure_at</code></td><td>Migrated</td></tr><tr><td><code>stop_notification</code></td><td>Migrated</td></tr><tr><td><code>phone_number</code></td><td>Migrated</td></tr><tr><td><code>vaccine_method</code></td><td>Migrated</td></tr><tr><td><code>entity_id</code></td><td>Platform entity ID (mapped)</td></tr><tr><td><code>created_at</code>, <code>updated_at</code>, <code>deleted_at</code></td><td>Preserved</td></tr></tbody></table></li><li><p><strong>Mapping Table</strong><br> Uses helper <code>insertTableMapping(&quot;patients&quot;, progId, mapLegacyToPlatform)</code><br> Records in <code>mapping_patients</code>:</p><table tabindex="0"><thead><tr><th>Column</th><th>Notes</th></tr></thead><tbody><tr><td><code>existing_patient_id</code></td><td>Legacy <code>patients.id</code></td></tr><tr><td><code>platform_patient_id</code></td><td>New <code>ws_patients.id</code></td></tr><tr><td><code>program_id</code></td><td>Workspace/program ID</td></tr></tbody></table></li></ol><hr><h2 id="parameters-options" tabindex="-1">Parameters &amp; Options <a class="header-anchor" href="#parameters-options" aria-label="Permalink to &quot;Parameters &amp; Options&quot;">​</a></h2><ul><li><code>--batchSize &lt;number&gt;</code>: Rows per batch (required)</li><li><code>--programId &lt;programId&gt;</code>: Legacy program ID (default = 1)</li></ul><hr><h2 id="dependencies" tabindex="-1">Dependencies <a class="header-anchor" href="#dependencies" aria-label="Permalink to &quot;Dependencies&quot;">​</a></h2><ul><li><strong>Helpers &amp; Libraries</strong>: <ul><li><code>getMigrationDB(programId)</code> for source DB</li><li><code>db.transaction()</code> for batch insert</li><li><code>insertTableMapping()</code> for mapping writes</li><li><code>collect()</code> to extract legacy IDs</li><li><code>getMapEntityIds()</code> for mapping entity FK to platform IDs</li></ul></li></ul><hr><h2 id="key-logic-summary" tabindex="-1">Key Logic Summary <a class="header-anchor" href="#key-logic-summary" aria-label="Permalink to &quot;Key Logic Summary&quot;">​</a></h2><ol><li><p><strong>Batch Loop</strong></p><ul><li>Page through <code>patients.id</code> in batches of <code>batchSize</code> until none remain.</li></ul></li><li><p><strong>Per-Batch Transaction</strong></p><ul><li>Fetch detailed rows for patient IDs.</li><li>Map <code>entity_id</code> to platform via <code>getMapEntityIds()</code>.</li><li>Bulk-insert into <code>ws_patients</code> with mapped <code>entity_id</code>.</li><li>Compute new IDs and build legacy→platform map.</li><li>Call <code>insertTableMapping(&quot;patients&quot;, programId, mapLegacyToPlatform)</code>.</li></ul></li><li><p><strong>Exit</strong></p><ul><li>Logs finish and returns (no explicit exit).</li></ul></li></ol><hr><h2 id="data-flow-diagram" tabindex="-1">Data Flow Diagram <a class="header-anchor" href="#data-flow-diagram" aria-label="Permalink to &quot;Data Flow Diagram&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-411",
				class: "mermaid",
				graph: "graph%20TD%0A%20%20subgraph%20SMILE3%20DB%0A%20%20%20%20P3%5B%22patients%20(batch)%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Preparations%0A%20%20%20%20EM%5B%22getMapEntityIds%22%5D%0A%20%20end%0A%0A%20%20subgraph%20Script%20Logic%0A%20%20%20%20A%5B%22Fetch%20batch%20IDs%22%5D%0A%20%20%20%20B%5B%22Fetch%20full%20patient%20rows%22%5D%0A%20%20%20%20C%5B%22Map%20entity_id%20via%20EM%22%5D%0A%20%20%20%20D%5B%22Insert%20into%20ws_patients%22%5D%0A%20%20%20%20E%5B%22insertTableMapping%22%5D%0A%20%20end%0A%0A%20%20subgraph%20SMILE5%20DB%0A%20%20%20%20WP%5B%22ws_patients%22%5D%0A%20%20%20%20MP%5B%22mapping_patients%22%5D%0A%20%20end%0A%0A%20%20P3%20--%3E%20A%20--%3E%20B%0A%20%20B%20--%3E%20C%20--%3E%20D%20--%3E%20WP%0A%20%20D%20--%3E%20E%20--%3E%20MP%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="before-after-tables" tabindex="-1">Before &amp; After Tables <a class="header-anchor" href="#before-after-tables" aria-label="Permalink to &quot;Before &amp; After Tables&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Stage</th><th>Table</th><th>Key Columns</th></tr></thead><tbody><tr><td>Before</td><td><code>patients</code></td><td><code>id</code>, <code>entity_id</code>, <code>nik</code>, <code>vaccine_sequence</code>, <code>phone_number</code></td></tr><tr><td>After</td><td><code>ws_patients</code></td><td><code>id</code>, <code>entity_id</code>, <code>nik</code>, <code>vaccine_sequence</code>, <code>phone_number</code></td></tr><tr><td>Mapping</td><td><code>mapping_patients</code></td><td><code>existing_patient_id</code>, <code>platform_patient_id</code>, <code>program_id</code></td></tr></tbody></table></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/migration/workspace/migrate-patients.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var migrate_patients_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, migrate_patients_default as default };
