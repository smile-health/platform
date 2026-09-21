import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region index.md
var __pageData = JSON.parse("{\"title\":\"\",\"description\":\"\",\"frontmatter\":{\"layout\":\"home\",\"hero\":{\"name\":\"SMILE Platform\",\"text\":\"Documentation\",\"tagline\":\"Architecture, data model, and design documents for the SMILE healthcare supply chain platform.\",\"actions\":[{\"theme\":\"brand\",\"text\":\"Platform Architecture\",\"link\":\"/architecture/platform-overview\"},{\"theme\":\"alt\",\"text\":\"Entity Relationship Diagram\",\"link\":\"/ERD\"}]},\"features\":[{\"title\":\"Architecture\",\"details\":\"Platform overview, service components, authentication and RBAC, interop layer, feature flags, and the SMILE 3.0 to 5.0 data migration.\",\"link\":\"/architecture/platform-overview\"},{\"title\":\"Data Model\",\"details\":\"Full ERD generated from the migration files, grouped by feature — core auth, inventory, orders, transactions, and reporting.\",\"link\":\"/ERD\"},{\"title\":\"Operations\",\"details\":\"Infrastructure monitoring, version control workflow, database migration notes, and API testing guidelines.\",\"link\":\"/architecture/operations/infrastructure-monitoring\"},{\"title\":\"Archive\",\"details\":\"Superseded documents kept for reference — SMILE 3.0 integrations, Sequelize-era database models, and past audits.\",\"link\":\"/archive/documentation-audit-2025\"}]},\"headers\":[],\"relativePath\":\"index.md\",\"filePath\":\"index.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var docs_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, docs_default as default };
