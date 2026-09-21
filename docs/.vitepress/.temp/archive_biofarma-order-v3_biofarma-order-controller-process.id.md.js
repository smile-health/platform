import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region archive/biofarma-order-v3/biofarma-order-controller-process.id.md
var __pageData = JSON.parse("{\"title\":\"Dokumentasi: Alur Proses Biofarma Order Controller (v3.0)\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/biofarma-order-v3/biofarma-order-controller-process.id.md\",\"filePath\":\"archive/biofarma-order-v3/biofarma-order-controller-process.id.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/biofarma-order-v3/biofarma-order-controller-process.id.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="dokumentasi-alur-proses-biofarma-order-controller-v3-0" tabindex="-1">Dokumentasi: Alur Proses Biofarma Order Controller (v3.0) <a class="header-anchor" href="#dokumentasi-alur-proses-biofarma-order-controller-v3-0" aria-label="Permalink to &quot;Dokumentasi: Alur Proses Biofarma Order Controller (v3.0)&quot;">​</a></h1><blockquote><p><strong>ARSIP — jangan dipakai sebagai acuan implementasi.</strong> Dokumentasi controller Sequelize Biofarma SMILE 3.0; kodenya sudah dicabut. Disimpan sebagai rujukan historis saja.</p></blockquote><h2 id="ikhtisar" tabindex="-1">Ikhtisar <a class="header-anchor" href="#ikhtisar" aria-label="Permalink to &quot;Ikhtisar&quot;">​</a></h2><p>Biofarma Order Controller (<code>biofarmaOrderController.js</code>) bertanggung jawab untuk menyinkronkan data pesanan dari Biofarma dengan platform Smile. Controller ini mengambil data pesanan dari API Biofarma, memproses dan memformat data tersebut, serta membuat atau memperbarui pesanan di Smile melalui panggilan API. Proses ini dirancang untuk dijalankan secara berkala melalui cron job.</p><hr><h2 id="alur-proses" tabindex="-1">Alur Proses <a class="header-anchor" href="#alur-proses" aria-label="Permalink to &quot;Alur Proses&quot;">​</a></h2><h3 id="_1-pengambilan-data-pesanan-biofarma" tabindex="-1">1. Pengambilan Data Pesanan Biofarma <a class="header-anchor" href="#_1-pengambilan-data-pesanan-biofarma" aria-label="Permalink to &quot;1. Pengambilan Data Pesanan Biofarma&quot;">​</a></h3><ul><li>Controller melakukan autentikasi dengan API Biofarma menggunakan kredensial yang disimpan di variabel lingkungan.</li><li>Mengambil data pesanan dari endpoint yang berbeda tergantung pada jenis pesanan (<code>provinsi</code> atau <code>hub</code>).</li><li>Penerapan paginasi dan penyaringan untuk mengambil semua data yang relevan, termasuk dukungan untuk rentang tanggal bulanan atau kustom.</li></ul><h3 id="_2-penyaringan-dan-persiapan-data" tabindex="-1">2. Penyaringan dan Persiapan Data <a class="header-anchor" href="#_2-penyaringan-dan-persiapan-data" aria-label="Permalink to &quot;2. Penyaringan dan Persiapan Data&quot;">​</a></h3><ul><li>Pesanan dengan nomor delivery order (<code>no_do</code>) yang bernilai null disaring keluar.</li><li>Pesanan dengan nama produk yang dikecualikan (misalnya, beberapa vaksin COVID-19 tertentu) disaring keluar.</li><li>Pesanan yang tersisa dikelompokkan berdasarkan nomor delivery order (<code>no_do</code>).</li></ul><h3 id="_3-pemetaan-data-biofarma-ke-format-smile" tabindex="-1">3. Pemetaan Data Biofarma ke Format Smile <a class="header-anchor" href="#_3-pemetaan-data-biofarma-ke-format-smile" aria-label="Permalink to &quot;3. Pemetaan Data Biofarma ke Format Smile&quot;">​</a></h3><ul><li>Setiap pesanan Biofarma dipetakan ke format pesanan Smile menggunakan fungsi <code>mapBiofarmaToSmile</code>.</li><li>Beberapa kode area disesuaikan berdasarkan pemetaan yang telah ditentukan.</li><li>Enrichment data tambahan dilakukan, seperti penanganan material yang diklasifikasikan sebagai &quot;pelarut&quot; untuk menyesuaikan jumlah dosis.</li></ul><h3 id="_4-persiapan-pesanan-untuk-smile" tabindex="-1">4. Persiapan Pesanan untuk Smile <a class="header-anchor" href="#_4-persiapan-pesanan-untuk-smile" aria-label="Permalink to &quot;4. Persiapan Pesanan untuk Smile&quot;">​</a></h3><ul><li>Pesanan disiapkan dalam batch, mengelompokkan item berdasarkan nomor delivery order.</li><li>Untuk setiap pesanan, batch diformat dengan detail seperti kode batch, tanggal kedaluwarsa, jumlah, dan produsen.</li><li>Terdapat dua metode persiapan: <code>prepareOrderSmile</code> untuk pesanan v3 dan <code>prepareOrderSmileV2</code> untuk pesanan kompatibel v5, yang mencakup ID aktivitas dan flag versi.</li></ul><h3 id="_5-pembuatan-atau-pembaruan-pesanan-di-smile" tabindex="-1">5. Pembuatan atau Pembaruan Pesanan di Smile <a class="header-anchor" href="#_5-pembuatan-atau-pembaruan-pesanan-di-smile" aria-label="Permalink to &quot;5. Pembuatan atau Pembaruan Pesanan di Smile&quot;">​</a></h3><ul><li>Controller memeriksa apakah pesanan sudah ada di Smile dan apakah jumlahnya sesuai.</li><li>Jika pesanan ada tetapi jumlahnya berbeda, controller mencoba memperbarui pesanan dengan membatalkan pesanan yang ada dan membuat yang baru.</li><li>Jika pesanan belum ada, controller membuat pesanan baru di Smile melalui panggilan API.</li><li>Pesanan duplikat dilacak untuk menghindari pemrosesan berulang.</li></ul><h3 id="_6-manajemen-transaksi" tabindex="-1">6. Manajemen Transaksi <a class="header-anchor" href="#_6-manajemen-transaksi" aria-label="Permalink to &quot;6. Manajemen Transaksi&quot;">​</a></h3><ul><li>Pesanan Biofarma dimasukkan secara massal ke database lokal dengan penanganan duplikat.</li><li>Transaksi Sequelize digunakan untuk memastikan integritas data selama operasi massal.</li></ul><h3 id="_7-fungsionalitas-tambahan" tabindex="-1">7. Fungsionalitas Tambahan <a class="header-anchor" href="#_7-fungsionalitas-tambahan" aria-label="Permalink to &quot;7. Fungsionalitas Tambahan&quot;">​</a></h3><ul><li>Controller mendukung pengambilan dan pemrosesan data Biofarma SMDV (dashboard vaksin).</li><li>Menyediakan fungsi untuk menghapus pesanan Biofarma yang tidak lagi ada di data sumber.</li><li>Logging digunakan secara ekstensif untuk melacak alur proses, keberhasilan, dan kesalahan.</li></ul><hr><h2 id="komponen-utama" tabindex="-1">Komponen Utama <a class="header-anchor" href="#komponen-utama" aria-label="Permalink to &quot;Komponen Utama&quot;">​</a></h2><ul><li><strong>Autentikasi:</strong> Mendapatkan token akses dari API Biofarma untuk permintaan yang aman.</li><li><strong>Pemetaan Data:</strong> Mengonversi field pesanan Biofarma ke skema pesanan Smile.</li><li><strong>Pembuatan/Pembaruan Pesanan:</strong> Menangani siklus hidup pesanan di Smile, termasuk pembatalan dan pembuatan ulang.</li><li><strong>Format Batch:</strong> Menyiapkan detail batch untuk item pesanan.</li><li><strong>Penyaringan:</strong> Mengecualikan produk tertentu dan data yang tidak valid.</li><li><strong>Penanganan Versi:</strong> Mendukung format pesanan v3 dan v5 dengan flag versi.</li><li><strong>Penanganan Kesalahan:</strong> Mencatat kesalahan dan melanjutkan pemrosesan untuk menghindari pemblokiran.</li></ul><hr><h2 id="ringkasan" tabindex="-1">Ringkasan <a class="header-anchor" href="#ringkasan" aria-label="Permalink to &quot;Ringkasan&quot;">​</a></h2><p>Biofarma Order Controller mengotomatisasi sinkronisasi pesanan vaksin dari Biofarma ke Smile, memastikan konsistensi data dan pembaruan tepat waktu. Controller ini menangani transformasi data yang kompleks, interaksi API, dan operasi database transaksional untuk menjaga akurasi catatan pesanan.</p><p>Proses ini sangat penting untuk menjaga data distribusi vaksin yang terbaru dan dirancang untuk dijalankan secara rutin melalui cron job yang dijadwalkan.</p><hr><h2 id="diagram-alur-proses" tabindex="-1">Diagram Alur Proses <a class="header-anchor" href="#diagram-alur-proses" aria-label="Permalink to &quot;Diagram Alur Proses&quot;">​</a></h2><p>Berikut adalah beberapa diagram alur dalam format MermaidJS yang menggambarkan alur utama dalam Biofarma Order Controller.</p><h3 id="_1-pengambilan-dan-persiapan-pesanan-biofarma" tabindex="-1">1. Pengambilan dan Persiapan Pesanan Biofarma <a class="header-anchor" href="#_1-pengambilan-dan-persiapan-pesanan-biofarma" aria-label="Permalink to &quot;1. Pengambilan dan Persiapan Pesanan Biofarma&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-219",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20A%5BMulai%3A%20Trigger%20Cron%20Job%5D%20--%3E%20B%5BAutentikasi%20dengan%20API%20Biofarma%5D%0A%20%20B%20--%3E%20C%5BAmbil%20Data%20Pesanan%20provinsi%20hub%5D%0A%20%20C%20--%3E%20D%5BSaring%20Pesanan%3A%20Hapus%20no_do%20null%20dan%20produk%20yang%20dikecualikan%5D%0A%20%20D%20--%3E%20E%5BKelompokkan%20Pesanan%20berdasarkan%20no_do%5D%0A%20%20E%20--%3E%20F%5BPemetaan%20Data%20Biofarma%20ke%20Format%20Smile%5D%0A%20%20F%20--%3E%20G%5BPersiapkan%20Pesanan%20untuk%20Smile%20v3%20atau%20v5%5D%0A%20%20G%20--%3E%20H%5BLanjut%20ke%20Pembuatan%2FPembaruan%20Pesanan%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="_2-pembuatan-atau-pembaruan-pesanan-di-smile" tabindex="-1">2. Pembuatan atau Pembaruan Pesanan di Smile <a class="header-anchor" href="#_2-pembuatan-atau-pembaruan-pesanan-di-smile" aria-label="Permalink to &quot;2. Pembuatan atau Pembaruan Pesanan di Smile&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-223",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20A%5BTerima%20Pesanan%20yang%20Telah%20Disiapkan%5D%20--%3E%20B%7BPesanan%20Ada%20di%20Smile%3F%7D%0A%20%20B%20--%20Ya%20--%3E%20C%7BJumlah%20Sesuai%3F%7D%0A%20%20C%20--%20Ya%20--%3E%20D%5BLewati%20Pembuatan%20Pesanan%5D%0A%20%20C%20--%20Tidak%20--%3E%20E%5BBatal%20Pesanan%20Smile%20yang%20Ada%5D%0A%20%20E%20--%3E%20F%5BBuat%20Pesanan%20Smile%20Baru%5D%0A%20%20B%20--%20Tidak%20--%3E%20F%5BBuat%20Pesanan%20Smile%20Baru%5D%0A%20%20F%20--%3E%20G%5BCatat%20Keberhasilan%20atau%20Kesalahan%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="_3-format-batch-dan-penanganan-material" tabindex="-1">3. Format Batch dan Penanganan Material <a class="header-anchor" href="#_3-format-batch-dan-penanganan-material" aria-label="Permalink to &quot;3. Format Batch dan Penanganan Material&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-227",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20A%5BMulai%20Format%20Batch%5D%20--%3E%20B%7BApakah%20Material%20%22Pelarut%22%3F%7D%0A%20%20B%20--%20Ya%20--%3E%20C%5BSesuaikan%20Jumlah%20Dosis%20Berdasarkan%20Potongan%20Per%20Unit%5D%0A%20%20B%20--%20Tidak%20--%3E%20D%5BGunakan%20Jumlah%20Dosis%20Asli%5D%0A%20%20C%20--%3E%20E%5BFormat%20Detail%20Batch%5D%0A%20%20D%20--%3E%20E%5BFormat%20Detail%20Batch%5D%0A%20%20E%20--%3E%20F%5BTambahkan%20Batch%20ke%20Item%20Pesanan%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="_4-manajemen-transaksi-dan-operasi-database" tabindex="-1">4. Manajemen Transaksi dan Operasi Database <a class="header-anchor" href="#_4-manajemen-transaksi-dan-operasi-database" aria-label="Permalink to &quot;4. Manajemen Transaksi dan Operasi Database&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-231",
				class: "mermaid",
				graph: "flowchart%20TD%0A%20%20A%5BMulai%20Transaksi%20Database%5D%20--%3E%20B%5BMasukkan%20Massal%20Pesanan%20Biofarma%5D%0A%20%20B%20--%3E%20C%7BInsert%20Berhasil%3F%7D%0A%20%20C%20--%20Ya%20--%3E%20D%5BCommit%20Transaksi%5D%0A%20%20C%20--%20Tidak%20--%3E%20E%5BRollback%20Transaksi%5D%0A%20%20D%20--%3E%20F%5BAkhiri%20Proses%5D%0A%20%20E%20--%3E%20F%5BAkhiri%20Proses%20dengan%20Kesalahan%5D%0A"
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/biofarma-order-v3/biofarma-order-controller-process.id.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var biofarma_order_controller_process_id_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, biofarma_order_controller_process_id_default as default };
