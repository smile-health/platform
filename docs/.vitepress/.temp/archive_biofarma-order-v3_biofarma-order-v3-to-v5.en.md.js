import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region archive/biofarma-order-v3/biofarma-order-v3-to-v5.en.md
var __pageData = JSON.parse("{\"title\":\"Migration Guide: Implementing Biofarma Order Controller v3.0 to v5.0\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/biofarma-order-v3/biofarma-order-v3-to-v5.en.md\",\"filePath\":\"archive/biofarma-order-v3/biofarma-order-v3-to-v5.en.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/biofarma-order-v3/biofarma-order-v3-to-v5.en.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="migration-guide-implementing-biofarma-order-controller-v3-0-to-v5-0" tabindex="-1">Migration Guide: Implementing Biofarma Order Controller v3.0 to v5.0 <a class="header-anchor" href="#migration-guide-implementing-biofarma-order-controller-v3-0-to-v5-0" aria-label="Permalink to &quot;Migration Guide: Implementing Biofarma Order Controller v3.0 to v5.0&quot;">​</a></h1><blockquote><p><strong>ARSIP — jangan dipakai sebagai acuan implementasi.</strong> Merujuk <code>apps/3.0/main-api/app/controllers/biofarmaOrderController.js</code>, yang tidak ada di repo ini. Disimpan sebagai rujukan historis saja.</p></blockquote><h2 id="overview" tabindex="-1">Overview <a class="header-anchor" href="#overview" aria-label="Permalink to &quot;Overview&quot;">​</a></h2><p>This document outlines the steps to migrate the Biofarma Order Controller from version 3.0, located in <code>apps/3.0/main-api/app/controllers/biofarmaOrderController.js</code>, to version 5.0 in the <code>sync-services</code> service. The migration includes copying the controller, creating CLI commands for daily and hourly execution, configuring the sync-services environment for compatibility, and adding the <code>program_id</code> field for immunization program compatibility.</p><hr><h2 id="migration-steps" tabindex="-1">Migration Steps <a class="header-anchor" href="#migration-steps" aria-label="Permalink to &quot;Migration Steps&quot;">​</a></h2><h3 id="_1-copy-controller-to-sync-services" tabindex="-1">1. Copy Controller to Sync-Services <a class="header-anchor" href="#_1-copy-controller-to-sync-services" aria-label="Permalink to &quot;1. Copy Controller to Sync-Services&quot;">​</a></h3><ul><li>Copy the <code>biofarmaOrderController.js</code> file from <code>apps/3.0/main-api/app/controllers/</code> to the appropriate controllers directory in the <code>sync-services</code> project.</li><li>Ensure all dependencies and imports are resolved within the new project context.</li></ul><h3 id="_2-create-cli-commands-for-daily-and-hourly-execution" tabindex="-1">2. Create CLI Commands for Daily and Hourly Execution <a class="header-anchor" href="#_2-create-cli-commands-for-daily-and-hourly-execution" aria-label="Permalink to &quot;2. Create CLI Commands for Daily and Hourly Execution&quot;">​</a></h3><ul><li>Implement CLI commands in <code>sync-services</code> to run the Biofarma Order Controller processes on a daily and hourly schedule.</li><li>The commands should accept parameters to specify execution mode (e.g., <code>--isV2</code>, <code>--monthly</code>).</li><li>Integrate these commands with the existing CLI framework in <code>sync-services</code>.</li></ul><h3 id="_3-configure-sync-services-for-compatibility" tabindex="-1">3. Configure Sync-Services for Compatibility <a class="header-anchor" href="#_3-configure-sync-services-for-compatibility" aria-label="Permalink to &quot;3. Configure Sync-Services for Compatibility&quot;">​</a></h3><ul><li>Adjust environment variables and configuration files in <code>sync-services</code> to include necessary Biofarma and Smile API credentials.</li><li>Ensure the database models and ORM configurations in <code>sync-services</code> support the data structures used by the controller.</li><li>Verify logging and error handling are consistent with <code>sync-services</code> standards.</li></ul><h3 id="_4-add-program-id-for-immunization-program-compatibility" tabindex="-1">4. Add <code>program_id</code> for Immunization Program Compatibility <a class="header-anchor" href="#_4-add-program-id-for-immunization-program-compatibility" aria-label="Permalink to &quot;4. Add \`program_id\` for Immunization Program Compatibility&quot;">​</a></h3><ul><li>Modify the controller and related data models to include the <code>program_id</code> field representing the immunization program.</li><li>Ensure that this field is populated correctly during order processing and persisted in the database.</li><li>Update any API payloads or integrations to include <code>program_id</code> where applicable.</li></ul><hr><h2 id="flowchart" tabindex="-1">Flowchart <a class="header-anchor" href="#flowchart" aria-label="Permalink to &quot;Flowchart&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-97",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20A%5BStart%20Migration%5D%20--%3E%20B%5BCopy%20biofarmaOrderController.js%20to%20sync-services%5D%0A%20%20B%20--%3E%20C%5BCreate%20CLI%20commands%20for%20daily%20and%20hourly%20execution%5D%0A%20%20C%20--%3E%20D%5BConfigure%20sync-services%20environment%20and%20dependencies%5D%0A%20%20D%20--%3E%20E%5BModify%20controller%20and%20models%20to%20add%20program_id%5D%0A%20%20E%20--%3E%20F%5BTest%20and%20validate%20migration%5D%0A%20%20F%20--%3E%20G%5BComplete%20Migration%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="sequence-diagram" tabindex="-1">Sequence Diagram <a class="header-anchor" href="#sequence-diagram" aria-label="Permalink to &quot;Sequence Diagram&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-102",
				class: "mermaid",
				graph: "sequenceDiagram%0A%20%20participant%20Dev%20as%20Developer%0A%20%20participant%20Sync%20as%20Sync-Services%0A%20%20participant%20BioCtrl%20as%20BiofarmaOrderController%0A%20%20participant%20DB%20as%20Database%0A%20%20participant%20CLI%20as%20CLI%20Commands%0A%0A%20%20Dev-%3E%3ESync%3A%20Copy%20biofarmaOrderController.js%0A%20%20Dev-%3E%3ECLI%3A%20Create%20daily%20and%20hourly%20CLI%20commands%0A%20%20CLI-%3E%3ESync%3A%20Integrate%20CLI%20commands%0A%20%20Dev-%3E%3ESync%3A%20Configure%20environment%20variables%20and%20dependencies%0A%20%20Dev-%3E%3EBioCtrl%3A%20Modify%20controller%20to%20add%20program_id%0A%20%20BioCtrl-%3E%3EDB%3A%20Update%20data%20models%20with%20program_id%0A%20%20Dev-%3E%3ESync%3A%20Test%20migration%0A%20%20Sync-%3E%3EDev%3A%20Report%20results%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="summary" tabindex="-1">Summary <a class="header-anchor" href="#summary" aria-label="Permalink to &quot;Summary&quot;">​</a></h2><p>Migrating the Biofarma Order Controller from v3.0 to v5.0 involves relocating the controller to the <code>sync-services</code> project, creating CLI commands for scheduled execution, configuring the environment for compatibility, and enhancing the data model with the <code>program_id</code> field. The included flowchart and sequence diagram illustrate the migration process steps and interactions.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/biofarma-order-v3/biofarma-order-v3-to-v5.en.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var biofarma_order_v3_to_v5_en_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, biofarma_order_v3_to_v5_en_default as default };
