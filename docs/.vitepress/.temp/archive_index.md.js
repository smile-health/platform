import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region archive/index.md
var __pageData = JSON.parse("{\"title\":\"Archive\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/index.md\",\"filePath\":\"archive/index.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="archive" tabindex="-1">Archive <a class="header-anchor" href="#archive" aria-label="Permalink to &quot;Archive&quot;">​</a></h1><p>Dokumen di folder ini <strong>tidak lagi menggambarkan kode manapun di repo ini</strong>. Disimpan sebagai rujukan historis — jangan dipakai sebagai acuan implementasi.</p><p>Tiga hal yang membuat dokumen-dokumen ini usang:</p><table tabindex="0"><thead><tr><th>Penyebab</th><th>Dokumen</th></tr></thead><tbody><tr><td><code>apps/sync-service</code> dihapus</td><td><a href="./timeout-troubleshooting-sync-service.html">Timeout troubleshooting</a>, <a href="./database-migrations-sync-service.html">migrasi DB sync-service</a></td></tr><tr><td><code>apps/3.0/*</code> (SMILE 3.0, Sequelize) dihapus</td><td><a href="./database-models-sequelize.html">Database models</a>, <a href="./database-models-transaction-sequelize.html">Database models — transaction</a>, <a href="./process-data-coldstorage-analysis.html">processDataColdstorage</a>, <a href="./count-transaction-api.html">Count Transaction API</a>, <a href="./dashboard-routine-api.html">Dashboard Routine API</a>, <a href="./biofarma-order-v3/biofarma-order-v3-to-v5.id.html">Biofarma order v3</a></td></tr><tr><td>Modul Indonesia-only dicabut</td><td><a href="./monev-api.html">Monev API</a>, <a href="./siha-sitb/siha-sitb-api-v1.0.html">SIHA/SITB</a></td></tr></tbody></table><p>Selain itu: <a href="./documentation-audit-2025.html">audit dokumentasi 2025</a> digantikan oleh konsolidasi <code>adr/</code> → <code>docs/</code>, dan <a href="./service-statuses.html">papan status service</a> adalah snapshot manual tanpa sumber kebenaran.</p><p>Jalur SIHA/SITB masih punya sisa yang <strong>aktif</strong> — routing rules di <code>apps/openhim-mediators/rule-router/db-scripts/</code>. Lihat <a href="./../architecture/interop-layer/">interop layer</a>.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var archive_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, archive_default as default };
