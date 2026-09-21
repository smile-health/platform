import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region archive/biofarma-order-v3/biofarma-order-v3-to-v5.id.md
var __pageData = JSON.parse("{\"title\":\"Panduan Migrasi: Implementasi Biofarma Order Controller v3.0 ke v5.0\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/biofarma-order-v3/biofarma-order-v3-to-v5.id.md\",\"filePath\":\"archive/biofarma-order-v3/biofarma-order-v3-to-v5.id.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/biofarma-order-v3/biofarma-order-v3-to-v5.id.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="panduan-migrasi-implementasi-biofarma-order-controller-v3-0-ke-v5-0" tabindex="-1">Panduan Migrasi: Implementasi Biofarma Order Controller v3.0 ke v5.0 <a class="header-anchor" href="#panduan-migrasi-implementasi-biofarma-order-controller-v3-0-ke-v5-0" aria-label="Permalink to &quot;Panduan Migrasi: Implementasi Biofarma Order Controller v3.0 ke v5.0&quot;">​</a></h1><blockquote><p><strong>ARSIP — jangan dipakai sebagai acuan implementasi.</strong> Merujuk <code>apps/3.0/main-api/app/controllers/biofarmaOrderController.js</code>, yang tidak ada di repo ini. Disimpan sebagai rujukan historis saja.</p></blockquote><h2 id="ikhtisar" tabindex="-1">Ikhtisar <a class="header-anchor" href="#ikhtisar" aria-label="Permalink to &quot;Ikhtisar&quot;">​</a></h2><p>Dokumen ini menguraikan langkah-langkah untuk memigrasi Biofarma Order Controller dari versi 3.0, yang berada di <code>apps/3.0/main-api/app/controllers/biofarmaOrderController.js</code>, ke versi 5.0 di layanan <code>sync-services</code>. Migrasi ini mencakup penyalinan controller, pembuatan perintah CLI untuk eksekusi harian dan per jam, konfigurasi lingkungan sync-services agar kompatibel, serta penambahan field <code>program_id</code> untuk kompatibilitas program imunisasi.</p><hr><h2 id="langkah-migrasi" tabindex="-1">Langkah Migrasi <a class="header-anchor" href="#langkah-migrasi" aria-label="Permalink to &quot;Langkah Migrasi&quot;">​</a></h2><h3 id="_1-salin-controller-ke-sync-services" tabindex="-1">1. Salin Controller ke Sync-Services <a class="header-anchor" href="#_1-salin-controller-ke-sync-services" aria-label="Permalink to &quot;1. Salin Controller ke Sync-Services&quot;">​</a></h3><ul><li>Salin file <code>biofarmaOrderController.js</code> dari <code>apps/3.0/main-api/app/controllers/</code> ke direktori controller yang sesuai di proyek <code>sync-services</code>.</li><li>Pastikan semua dependensi dan impor disesuaikan dengan konteks proyek baru.</li></ul><h3 id="_2-buat-perintah-cli-untuk-eksekusi-harian-dan-per-jam" tabindex="-1">2. Buat Perintah CLI untuk Eksekusi Harian dan Per Jam <a class="header-anchor" href="#_2-buat-perintah-cli-untuk-eksekusi-harian-dan-per-jam" aria-label="Permalink to &quot;2. Buat Perintah CLI untuk Eksekusi Harian dan Per Jam&quot;">​</a></h3><ul><li>Implementasikan perintah CLI di <code>sync-services</code> untuk menjalankan proses Biofarma Order Controller secara harian dan per jam.</li><li>Perintah harus menerima parameter untuk menentukan mode eksekusi (misalnya <code>--isV2</code>, <code>--monthly</code>).</li><li>Integrasikan perintah ini dengan framework CLI yang sudah ada di <code>sync-services</code>.</li></ul><h3 id="_3-konfigurasikan-sync-services-agar-kompatibel" tabindex="-1">3. Konfigurasikan Sync-Services agar Kompatibel <a class="header-anchor" href="#_3-konfigurasikan-sync-services-agar-kompatibel" aria-label="Permalink to &quot;3. Konfigurasikan Sync-Services agar Kompatibel&quot;">​</a></h3><ul><li>Sesuaikan variabel lingkungan dan file konfigurasi di <code>sync-services</code> untuk menyertakan kredensial API Biofarma dan Smile yang diperlukan.</li><li>Pastikan model database dan konfigurasi ORM di <code>sync-services</code> mendukung struktur data yang digunakan oleh controller.</li><li>Verifikasi bahwa logging dan penanganan error konsisten dengan standar <code>sync-services</code>.</li></ul><h3 id="_4-tambahkan-program-id-untuk-kompatibilitas-program-imunisasi" tabindex="-1">4. Tambahkan <code>program_id</code> untuk Kompatibilitas Program Imunisasi <a class="header-anchor" href="#_4-tambahkan-program-id-untuk-kompatibilitas-program-imunisasi" aria-label="Permalink to &quot;4. Tambahkan \`program_id\` untuk Kompatibilitas Program Imunisasi&quot;">​</a></h3><ul><li>Modifikasi controller dan model data terkait untuk menyertakan field <code>program_id</code> yang merepresentasikan program imunisasi.</li><li>Pastikan field ini diisi dengan benar selama pemrosesan pesanan dan disimpan di database.</li><li>Perbarui payload API atau integrasi lain untuk menyertakan <code>program_id</code> jika diperlukan.</li></ul><hr><h2 id="diagram-alur-flowchart" tabindex="-1">Diagram Alur (Flowchart) <a class="header-anchor" href="#diagram-alur-flowchart" aria-label="Permalink to &quot;Diagram Alur (Flowchart)&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-97",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20A%5BMulai%20Migrasi%5D%20--%3E%20B%5BSalin%20biofarmaOrderController.js%20ke%20sync-services%5D%0A%20%20B%20--%3E%20C%5BBuat%20perintah%20CLI%20untuk%20eksekusi%20harian%20dan%20per%20jam%5D%0A%20%20C%20--%3E%20D%5BKonfigurasikan%20lingkungan%20dan%20dependensi%20sync-services%5D%0A%20%20D%20--%3E%20E%5BModifikasi%20controller%20dan%20model%20untuk%20menambahkan%20program_id%5D%0A%20%20E%20--%3E%20F%5BUji%20dan%20validasi%20migrasi%5D%0A%20%20F%20--%3E%20G%5BSelesaikan%20Migrasi%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="diagram-urutan-sequence-diagram" tabindex="-1">Diagram Urutan (Sequence Diagram) <a class="header-anchor" href="#diagram-urutan-sequence-diagram" aria-label="Permalink to &quot;Diagram Urutan (Sequence Diagram)&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-102",
				class: "mermaid",
				graph: "sequenceDiagram%0A%20%20participant%20Dev%20as%20Developer%0A%20%20participant%20Sync%20as%20Sync-Services%0A%20%20participant%20BioCtrl%20as%20BiofarmaOrderController%0A%20%20participant%20DB%20as%20Database%0A%20%20participant%20CLI%20as%20Perintah%20CLI%0A%0A%20%20Dev-%3E%3ESync%3A%20Salin%20biofarmaOrderController.js%0A%20%20Dev-%3E%3ECLI%3A%20Buat%20perintah%20CLI%20harian%20dan%20per%20jam%0A%20%20CLI-%3E%3ESync%3A%20Integrasikan%20perintah%20CLI%0A%20%20Dev-%3E%3ESync%3A%20Konfigurasikan%20variabel%20lingkungan%20dan%20dependensi%0A%20%20Dev-%3E%3EBioCtrl%3A%20Modifikasi%20controller%20untuk%20menambahkan%20program_id%0A%20%20BioCtrl-%3E%3EDB%3A%20Perbarui%20model%20data%20dengan%20program_id%0A%20%20Dev-%3E%3ESync%3A%20Uji%20migrasi%0A%20%20Sync-%3E%3EDev%3A%20Laporkan%20hasil%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<hr><h2 id="ringkasan" tabindex="-1">Ringkasan <a class="header-anchor" href="#ringkasan" aria-label="Permalink to &quot;Ringkasan&quot;">​</a></h2><p>Migrasi Biofarma Order Controller dari v3.0 ke v5.0 melibatkan pemindahan controller ke proyek <code>sync-services</code>, pembuatan perintah CLI untuk eksekusi terjadwal, konfigurasi lingkungan agar kompatibel, dan penambahan field <code>program_id</code> pada model data. Diagram alur dan diagram urutan yang disertakan menggambarkan langkah-langkah proses migrasi dan interaksi yang terjadi.</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/biofarma-order-v3/biofarma-order-v3-to-v5.id.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var biofarma_order_v3_to_v5_id_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, biofarma_order_v3_to_v5_id_default as default };
