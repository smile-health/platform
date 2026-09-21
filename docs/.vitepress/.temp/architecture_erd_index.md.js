import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttr, ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region architecture/erd/smile5-order-20250902-065950.png
var smile5_order_20250902_065950_default = "/docs/assets/smile5-order-20250902-065950.vQi3zIhB.png";
//#endregion
//#region architecture/erd/smile5-stock-20250902-070135.png
var smile5_stock_20250902_070135_default = "/docs/assets/smile5-stock-20250902-070135.D8mGqDPD.png";
//#endregion
//#region architecture/erd/smile5-transactions-20250902-072906.png
var smile5_transactions_20250902_072906_default = "/docs/assets/smile5-transactions-20250902-072906.RHv-ucKF.png";
//#endregion
//#region architecture/erd/consumption.png
var consumption_default = "/docs/assets/consumption.BnVmVx_2.png";
//#endregion
//#region architecture/erd/annual-planning.png
var annual_planning_default = "/docs/assets/annual-planning.CEUOlM2m.png";
//#endregion
//#region architecture/erd/notification.png
var notification_default = "/docs/assets/notification.Bg8VfqOw.png";
//#endregion
//#region architecture/erd/dashboard-acvr.png
var dashboard_acvr_default = "/docs/assets/dashboard-acvr.CM421lxp.png";
//#endregion
//#region architecture/erd/dashboard-rabies.png
var dashboard_rabies_default = "/docs/assets/dashboard-rabies.CXIWqHBN.png";
//#endregion
//#region architecture/erd/ticketing-system-20250902-092854.png
var ticketing_system_20250902_092854_default = "/docs/assets/ticketing-system-20250902-092854.Bw0pcsn6.png";
//#endregion
//#region architecture/erd/index.md
var __pageData = JSON.parse("{\"title\":\"ERD Snapshots\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/erd/index.md\",\"filePath\":\"architecture/erd/index.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/erd/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="erd-snapshots" tabindex="-1">ERD Snapshots <a class="header-anchor" href="#erd-snapshots" aria-label="Permalink to &quot;ERD Snapshots&quot;">​</a></h1><p>Screenshot dbdiagram per-domain, diambil <strong>2 September 2025</strong>. Berkas PNG, tidak regenerable dari repo.</p><blockquote><p><strong>Sumber kebenaran ada di <a href="./../../ERD.html">ERD lengkap</a></strong>, yang di-generate dari file migrasi dan mencakup 31 domain. Halaman ini hanya pelengkap visual: berguna untuk melihat satu domain sekaligus, tapi bisa sudah bergeser dari skema sekarang.</p></blockquote><table tabindex="0"><thead><tr><th>Domain</th><th>Gambar</th></tr></thead><tbody><tr><td>Order</td><td><img${ssrRenderAttr("src", smile5_order_20250902_065950_default)} alt="Order"></td></tr><tr><td>Stock</td><td><img${ssrRenderAttr("src", smile5_stock_20250902_070135_default)} alt="Stock"></td></tr><tr><td>Transactions</td><td><img${ssrRenderAttr("src", smile5_transactions_20250902_072906_default)} alt="Transactions"></td></tr><tr><td>Consumption</td><td><img${ssrRenderAttr("src", consumption_default)} alt="Consumption"></td></tr><tr><td>Annual planning</td><td><img${ssrRenderAttr("src", annual_planning_default)} alt="Annual planning"></td></tr><tr><td>Notification</td><td><img${ssrRenderAttr("src", notification_default)} alt="Notification"></td></tr><tr><td>Dashboard — ACVR</td><td><img${ssrRenderAttr("src", dashboard_acvr_default)} alt="Dashboard ACVR"></td></tr><tr><td>Dashboard — Rabies</td><td><img${ssrRenderAttr("src", dashboard_rabies_default)} alt="Dashboard Rabies"></td></tr><tr><td>Ticketing system</td><td><img${ssrRenderAttr("src", ticketing_system_20250902_092854_default)} alt="Ticketing"></td></tr></tbody></table></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/erd/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var erd_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, erd_default as default };
