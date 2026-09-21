import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/diagrams/warehouse-service-components.md
var __pageData = JSON.parse("{\"title\":\"Warehouse Service - Component Diagram\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/diagrams/warehouse-service-components.md\",\"filePath\":\"architecture/diagrams/warehouse-service-components.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/diagrams/warehouse-service-components.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="warehouse-service-component-diagram" tabindex="-1">Warehouse Service - Component Diagram <a class="header-anchor" href="#warehouse-service-component-diagram" aria-label="Permalink to &quot;Warehouse Service - Component Diagram&quot;">​</a></h1>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-3",
				class: "mermaid",
				graph: "C4Component%0Atitle%20Warehouse%20Service%20-%20Components%0A%0AContainer(warehouse%2C%20%22Warehouse%20Service%22%2C%20%22Node.js%20%2B%20Hono%22%2C%20%22Handles%20inventory%20operations%2C%20messaging%2C%20and%20monitoring%22)%0A%0AComponent(Wire%2C%20%22Dependency%20Injection%20(wire.ts)%22%2C%20%22Module%20initializer%22%2C%20%22Sets%20up%20MQ%2C%20publisher%2C%20repository%2C%20middlewares%2C%20and%20controllers%22)%0AComponent(CommonMiddleware%2C%20%22Common%20Middleware%22%2C%20%22src%2Fcommon%2Fmiddlewares%2Fcommon.middleware.js%22%2C%20%22Loads%20slave%20DB%20and%20Elasticsearch%20client%22)%0AComponent(AuthKeycloakMiddleware%2C%20%22Auth%20Keycloak%20Middleware%22%2C%20%22src%2Fcommon%2Fmiddlewares%2Fauth.middleware.js%22%2C%20%22Validates%20JWT%20via%20Keycloak%22)%0AComponent(RequestMiddleware%2C%20%22Request%20Middleware%22%2C%20%22%40smile-health%2Flib%2Fmiddlewares%22%2C%20%22Validates%20and%20enriches%20requests%22)%0AComponent(WarehouseRepository%2C%20%22Repository%22%2C%20%22src%2Fmodules%2Fwarehouse%2Fwarehouse.repository.js%22%2C%20%22Data%20access%20for%20warehouse%20entities%22)%0AComponent(WarehouseModule%2C%20%22Warehouse%20Module%22%2C%20%22src%2Fmodules%2Fwarehouse%2Fwarehouse.module.js%22%2C%20%22Business%20logic%20for%20warehouse%20operations%22)%0AComponent(WarehouseController%2C%20%22Warehouse%20Controller%22%2C%20%22src%2Fmodules%2Fwarehouse%2Fwarehouse.controller.js%22%2C%20%22Defines%20HTTP%20routes%20and%20handlers%22)%0AComponent(RoutesLoader%2C%20%22Routes%20Loader%22%2C%20%22src%2Futils%2FloadRoutes.js%22%2C%20%22Auto-imports%20route%20definitions%22)%0AComponent(DashboardMonitoringRoute%2C%20%22Dashboard%20Monitoring%22%2C%20%22src%2Froutes%2FdashboardMonitoring.js%22%2C%20%22Handles%20%2Fdashboard-monitoring%20endpoint%22)%0AComponent(Publisher%2C%20%22Publisher%22%2C%20%22%40smile-health%2Flib%2Frabbitmq%2Fpublisher.js%22%2C%20%22Publishes%20events%20to%20RabbitMQ%22)%0AComponent(MQConnection%2C%20%22MQ%20Connection%22%2C%20%22src%2Fcommon%2Finfrastructure%2Fmq%2Findex.js%22%2C%20%22Initializes%20RabbitMQ%20connection%22)%0A%0ARel(Wire%2C%20MQConnection%2C%20%22Initializes%22)%0ARel(Wire%2C%20Publisher%2C%20%22Creates%22)%0ARel(Wire%2C%20WarehouseRepository%2C%20%22Creates%22)%0ARel(Wire%2C%20CommonMiddleware%2C%20%22Creates%22)%0ARel(Wire%2C%20AuthKeycloakMiddleware%2C%20%22Creates%22)%0ARel(Wire%2C%20RequestMiddleware%2C%20%22Creates%22)%0ARel(Wire%2C%20WarehouseModule%2C%20%22Creates%22)%0ARel(Wire%2C%20WarehouseController%2C%20%22Creates%22)%0A%0ARel(CommonMiddleware%2C%20WarehouseRepository%2C%20%22Injects%20DB%20connection%22)%0ARel(AuthKeycloakMiddleware%2C%20WarehouseController%2C%20%22Applies%20to%20endpoints%22)%0ARel(RequestMiddleware%2C%20WarehouseController%2C%20%22Applies%20to%20endpoints%22)%0ARel(WarehouseController%2C%20WarehouseModule%2C%20%22Invokes%22)%0ARel(WarehouseModule%2C%20WarehouseRepository%2C%20%22Uses%22)%0ARel(WarehouseController%2C%20Publisher%2C%20%22Publishes%20events%22)%0ARel(WarehouseController%2C%20DashboardMonitoringRoute%2C%20%22Handles%20monitoring%22)%0ARel(RoutesLoader%2C%20WarehouseController%2C%20%22Registers%20routes%22)%0A"
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/diagrams/warehouse-service-components.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var warehouse_service_components_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, warehouse_service_components_default as default };
