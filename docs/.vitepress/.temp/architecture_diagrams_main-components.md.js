import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/diagrams/main-components.md
var __pageData = JSON.parse("{\"title\":\"Main Service - Component Diagram\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/diagrams/main-components.md\",\"filePath\":\"architecture/diagrams/main-components.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/diagrams/main-components.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="main-service-component-diagram" tabindex="-1">Main Service - Component Diagram <a class="header-anchor" href="#main-service-component-diagram" aria-label="Permalink to &quot;Main Service - Component Diagram&quot;">​</a></h1>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-3",
				class: "mermaid",
				graph: "C4Component%0Atitle%20Main%20Service%20-%20Components%0A%0AContainer(main%2C%20%22Main%20Service%22%2C%20%22Node.js%20%2B%20Bun%22%2C%20%22Manages%20workspaces%2C%20data%20migrations%2C%20and%20view%20generation%22)%0A%0AComponent(API%2C%20%22HTTP%20API%22%2C%20%22Hono%20router%22%2C%20%22Exposes%20REST%20endpoints%20for%20main%20functionality%22)%0AComponent(Controllers%2C%20%22Controllers%22%2C%20%22Classes%20in%20src%2Fcontrollers%22%2C%20%22Handle%20request%20routing%20and%20responses%22)%0AComponent(WorkspaceModule%2C%20%22Workspace%20Module%22%2C%20%22Classes%20in%20src%2Fmodules%2Fworkspace%22%2C%20%22Business%20logic%20for%20workspace%20management%22)%0AComponent(DatabaseModule%2C%20%22Database%20Module%22%2C%20%22Kysely%20%26%20MySQL%22%2C%20%22Executes%20migrations%20and%20runs%20queries%22)%0AComponent(MigrationCLI%2C%20%22Migration%20CLI%22%2C%20%22bun%20src%2Fcli.ts%20run-migrate%22%2C%20%22Runs%20database%20migrations%22)%0AComponent(ViewCLI%2C%20%22View%20CLI%22%2C%20%22pnpm%20kysely%20seed%3Arun%22%2C%20%22Generates%20and%20runs%20database%20view%20scripts%22)%0AComponent(Scheduler%2C%20%22Scheduler%22%2C%20%22tsx%20watch%20src%2Fscheduler.ts%22%2C%20%22Schedules%20recurring%20tasks%22)%0AComponent(EmailPreview%2C%20%22Email%20Preview%22%2C%20%22email%20preview%22%2C%20%22Renders%20and%20previews%20email%20templates%20locally%22)%0AComponent(LoggerMiddleware%2C%20%22Logging%20Middleware%22%2C%20%22%40smile-health%2Flib%2Flogger%22%2C%20%22Logs%20HTTP%20requests%20and%20events%22)%0AComponent(RequestMiddleware%2C%20%22Request%20Middleware%22%2C%20%22%40smile-health%2Flib%2Fmiddlewares%22%2C%20%22Validates%20and%20enriches%20requests%22)%0A%0ARel(API%2C%20Controllers%2C%20%22Invokes%22)%0ARel(Controllers%2C%20WorkspaceModule%2C%20%22Uses%22)%0ARel(Controllers%2C%20DatabaseModule%2C%20%22Reads%20from%20and%20writes%20to%22%2C%20%22SQL%22)%0ARel(MigrationCLI%2C%20DatabaseModule%2C%20%22Performs%20migrations%22)%0ARel(ViewCLI%2C%20DatabaseModule%2C%20%22Runs%20view%20scripts%22)%0ARel(Scheduler%2C%20Controllers%2C%20%22Triggers%20scheduled%20endpoints%22)%0ARel(API%2C%20LoggerMiddleware%2C%20%22Uses%22)%0ARel(Controllers%2C%20RequestMiddleware%2C%20%22Uses%22)%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`</div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/diagrams/main-components.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var main_components_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, main_components_default as default };
