import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/diagrams/containers.md
var __pageData = JSON.parse("{\"title\":\"Container Diagram\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/diagrams/containers.md\",\"filePath\":\"architecture/diagrams/containers.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/diagrams/containers.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="container-diagram" tabindex="-1">Container Diagram <a class="header-anchor" href="#container-diagram" aria-label="Permalink to &quot;Container Diagram&quot;">​</a></h1><blockquote><p>Diperbarui saat konsolidasi dokumentasi: versi sebelumnya hanya memodelkan 4 service dan menghilangkan interop-service, rule-router, web, wms-encore, Nginx, ClickHouse, dan MinIO.</p></blockquote>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-8",
				class: "mermaid",
				graph: "C4Container%0Atitle%20SMILE%20Platform%20-%20Container%20Diagram%0A%0APerson(user%2C%20%22User%22%2C%20%22A%20user%20of%20the%20SMILE%20Platform%22)%0A%0AContainer(core%2C%20%22Core%20Service%22%2C%20%22Node.js%20%2B%20Bun%22%2C%20%22Handles%20shared%20business%20logic%2C%20database%20migrations%2C%20background%20tasks%2C%20and%20event%20processing%22)%0AContainer(main%2C%20%22Main%20Service%22%2C%20%22Node.js%20%2B%20Bun%22%2C%20%22Manages%20workspaces%2C%20data%20migrations%2C%20and%20view%20generation%22)%0AContainer(auth%2C%20%22Auth%20Service%22%2C%20%22Node.js%20%2B%20Hono%22%2C%20%22Provides%20authentication%2C%20user%20and%20role%20management%20via%20Keycloak%22)%0AContainer(warehouse%2C%20%22Warehouse%20Service%22%2C%20%22Node.js%20%2B%20Hono%22%2C%20%22Handles%20inventory%20operations%2C%20messaging%2C%20and%20monitoring%22)%0AContainer(db%2C%20%22MySQL%20Database%22%2C%20%22MySQL%22%2C%20%22Stores%20persistent%20data%20for%20all%20services%22)%0AContainer(redis%2C%20%22Redis%20Cache%22%2C%20%22Redis%22%2C%20%22Caches%20frequently%20accessed%20data%20and%20manages%20distributed%20locks%22)%0AContainer(rabbitmq%2C%20%22RabbitMQ%22%2C%20%22RabbitMQ%22%2C%20%22Event%20broker%20for%20decoupled%20communication%22)%0AContainer(elasticsearch%2C%20%22Elasticsearch%22%2C%20%22Elasticsearch%22%2C%20%22Indexes%20logs%20and%20provides%20search%20capabilities%22)%0AContainer(interop%2C%20%22Interop%20Service%22%2C%20%22Node.js%20%2B%20Hono%22%2C%20%22Transforms%20and%20routes%20messages%20to%20external%20systems%22)%0AContainer(ruleRouter%2C%20%22OpenHIM%20Rule%20Router%22%2C%20%22Node.js%20%2B%20Hono%22%2C%20%22OpenHIM%20mediator%3B%20rule-based%20routing%20from%20the%20DB%22)%0AContainer(web%2C%20%22Web%20App%22%2C%20%22Next.js%22%2C%20%22Frontend%3B%20also%20serves%20this%20documentation%20site%20at%20%2Fdocs%22)%0AContainer(wms%2C%20%22WMS%20Encore%22%2C%20%22Encore%22%2C%20%22Waste%20Management%20System%22)%0AContainer(proxy%2C%20%22Nginx%20Proxy%22%2C%20%22Nginx%22%2C%20%22Reverse%20proxy%20in%20front%20of%20every%20service%20(port%208080)%22)%0AContainer(clickhouse%2C%20%22ClickHouse%22%2C%20%22ClickHouse%22%2C%20%22Analytics%20warehouse%20%E2%80%94%20datamart%20and%20read%20replica%22)%0AContainer(minio%2C%20%22MinIO%22%2C%20%22MinIO%22%2C%20%22S3-compatible%20object%20storage%22)%0AContainer(keycloak%2C%20%22Keycloak%22%2C%20%22Keycloak%22%2C%20%22External%20identity%20provider%20(SSO%2C%20OAuth2)%22)%0A%0ARel(user%2C%20auth%2C%20%22Authenticates%20via%22%2C%20%22OIDC%2FREST%22)%0ARel(user%2C%20core%2C%20%22Invokes%20API%22%2C%20%22HTTPS%2FJSON%22)%0ARel(user%2C%20main%2C%20%22Invokes%20API%22%2C%20%22HTTPS%2FJSON%22)%0ARel(user%2C%20warehouse%2C%20%22Invokes%20API%22%2C%20%22HTTPS%2FJSON%22)%0ARel(core%2C%20db%2C%20%22Reads%20from%20and%20writes%20to%22%2C%20%22SQL%22)%0ARel(main%2C%20db%2C%20%22Reads%20from%20and%20writes%20to%22%2C%20%22SQL%22)%0ARel(warehouse%2C%20db%2C%20%22Reads%20from%20and%20writes%20to%22%2C%20%22SQL%22)%0ARel(core%2C%20redis%2C%20%22Reads%20from%20and%20writes%20to%22%2C%20%22Redis%22)%0ARel(core%2C%20rabbitmq%2C%20%22Publishes%20and%20consumes%20events%22%2C%20%22AMQP%22)%0ARel(warehouse%2C%20rabbitmq%2C%20%22Publishes%20and%20consumes%20events%22%2C%20%22AMQP%22)%0ARel(core%2C%20elasticsearch%2C%20%22Indexes%20logs%20and%20metrics%22%2C%20%22HTTP%22)%0ARel(main%2C%20elasticsearch%2C%20%22Indexes%20workspace%20analytics%22%2C%20%22HTTP%22)%0ARel(auth%2C%20keycloak%2C%20%22Delegates%20authentication%20to%22%2C%20%22OIDC%22)%0ARel(user%2C%20proxy%2C%20%22Reaches%20every%20service%20through%22%2C%20%22HTTPS%22)%0ARel(user%2C%20web%2C%20%22Uses%22%2C%20%22HTTPS%22)%0ARel(main%2C%20clickhouse%2C%20%22Writes%20analytics%20to%20and%20reads%20from%22%2C%20%22HTTP%22)%0ARel(warehouse%2C%20clickhouse%2C%20%22Reads%20analytics%20from%22%2C%20%22HTTP%22)%0ARel(core%2C%20minio%2C%20%22Stores%20and%20retrieves%20files%22%2C%20%22S3%22)%0ARel(interop%2C%20rabbitmq%2C%20%22Consumes%20domain%20events%20from%22%2C%20%22AMQP%22)%0ARel(interop%2C%20ruleRouter%2C%20%22Routes%20outbound%20messages%20via%22%2C%20%22HTTP%22)%0A"
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/diagrams/containers.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var containers_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, containers_default as default };
