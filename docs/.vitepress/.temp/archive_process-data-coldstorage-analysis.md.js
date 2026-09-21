import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region archive/process-data-coldstorage-analysis.md
var __pageData = JSON.parse("{\"title\":\"ADR: processDataColdstorage Function Analysis\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/process-data-coldstorage-analysis.md\",\"filePath\":\"archive/process-data-coldstorage-analysis.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/process-data-coldstorage-analysis.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="adr-processdatacoldstorage-function-analysis" tabindex="-1">ADR: processDataColdstorage Function Analysis <a class="header-anchor" href="#adr-processdatacoldstorage-function-analysis" aria-label="Permalink to &quot;ADR: processDataColdstorage Function Analysis&quot;">​</a></h1><blockquote><p><strong>ARSIP — jangan dipakai sebagai acuan implementasi.</strong> Menganalisis <code>apps/3.0/main-api/app/controllers/coldstorageController.js</code>, yang tidak ada di repo ini. Disimpan sebagai rujukan historis saja.</p></blockquote><h2 id="status" tabindex="-1">Status <a class="header-anchor" href="#status" aria-label="Permalink to &quot;Status&quot;">​</a></h2><p>Documented</p><h2 id="context" tabindex="-1">Context <a class="header-anchor" href="#context" aria-label="Permalink to &quot;Context&quot;">​</a></h2><p>This document provides a comprehensive analysis of the <code>processDataColdstorage</code> function located in <code>/apps/3.0/main-api/app/controllers/coldstorageController.js</code> at line 483. This function is a critical component of the cold storage management system that calculates storage capacity, volume utilization, and material projections for vaccine storage facilities.</p><h2 id="function-overview" tabindex="-1">Function Overview <a class="header-anchor" href="#function-overview" aria-label="Permalink to &quot;Function Overview&quot;">​</a></h2><h3 id="function-signature" tabindex="-1">Function Signature <a class="header-anchor" href="#function-signature" aria-label="Permalink to &quot;Function Signature&quot;">​</a></h3><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">async</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> function</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> processDataColdstorage</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">entity_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">master_material_id</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#E36209",
		"--shiki-dark": "#FFAB70"
	})}">t</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span></code></pre></div><h3 id="parameters" tabindex="-1">Parameters <a class="header-anchor" href="#parameters" aria-label="Permalink to &quot;Parameters&quot;">​</a></h3><ul><li><strong>entity_id</strong> (Integer): The unique identifier of the healthcare entity/facility</li><li><strong>master_material_id</strong> (Integer, Optional): Specific material ID to process. If null, processes all materials for the entity</li><li><strong>t</strong> (Transaction): Database transaction object for ensuring data consistency</li></ul><h2 id="business-logic-analysis" tabindex="-1">Business Logic Analysis <a class="header-anchor" href="#business-logic-analysis" aria-label="Permalink to &quot;Business Logic Analysis&quot;">​</a></h2><h3 id="_1-core-purpose" tabindex="-1">1. Core Purpose <a class="header-anchor" href="#_1-core-purpose" aria-label="Permalink to &quot;1. Core Purpose&quot;">​</a></h3><p>The function manages cold storage capacity calculations for vaccine storage facilities, tracking both current and projected storage utilization across different temperature ranges.</p><h3 id="_2-main-data-flow" tabindex="-1">2. Main Data Flow <a class="header-anchor" href="#_2-main-data-flow" aria-label="Permalink to &quot;2. Main Data Flow&quot;">​</a></h3><h4 id="phase-1-data-initialization" tabindex="-1">Phase 1: Data Initialization <a class="header-anchor" href="#phase-1-data-initialization" aria-label="Permalink to &quot;Phase 1: Data Initialization&quot;">​</a></h4><ol><li><strong>Temperature Range Setup</strong>: Retrieves all temperature ranges from <code>RangeTemperature</code> table</li><li><strong>Cold Storage Retrieval</strong>: Finds or creates cold storage record for the entity</li><li><strong>Asset Collection</strong>: Gathers all cold storage assets (refrigerators, freezers) for the entity</li><li><strong>Variable Initialization</strong>: Sets up calculation variables for current and projected values</li></ol><h4 id="phase-2-asset-volume-calculation" tabindex="-1">Phase 2: Asset Volume Calculation <a class="header-anchor" href="#phase-2-asset-volume-calculation" aria-label="Permalink to &quot;Phase 2: Asset Volume Calculation&quot;">​</a></h4><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Formula: Total Asset Volume</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">for</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">let</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">of</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> Assets) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> { </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">asset_model</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">other_capacity_nett</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> } </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> asset</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">  let</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> capacity </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (asset_model </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> asset_model?.capacity_nett </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> other_capacity_nett) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">||</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  volume_asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">+=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> capacity</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h4 id="phase-3-material-processing" tabindex="-1">Phase 3: Material Processing <a class="header-anchor" href="#phase-3-material-processing" aria-label="Permalink to &quot;Phase 3: Material Processing&quot;">​</a></h4><p>The function handles two scenarios:</p><p><strong>Scenario A: New Cold Storage Creation</strong></p><ul><li>Creates new cold storage record</li><li>Calls <code>createColdstorageMaterials()</code> to initialize all vaccine materials</li></ul><p><strong>Scenario B: Existing Cold Storage Update</strong></p><ul><li>Updates specific material if <code>master_material_id</code> provided</li><li>Recalculates all material-related metrics</li></ul><h3 id="_3-key-calculations-and-formulas" tabindex="-1">3. Key Calculations and Formulas <a class="header-anchor" href="#_3-key-calculations-and-formulas" aria-label="Permalink to &quot;3. Key Calculations and Formulas&quot;">​</a></h3><h4 id="a-stock-calculations" tabindex="-1">A. Stock Calculations <a class="header-anchor" href="#a-stock-calculations" aria-label="Permalink to &quot;A. Stock Calculations&quot;">​</a></h4><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Dosage Stock: Sum of all stock quantities</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">coldStorageMaterial.dosage_stock </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">+=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> stock.qty</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Vial Stock: Convert dosage to vials</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (box_vial) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  coldStorageMaterial.vial_stock </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">+=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">((stock.qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> box_vial).</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">toFixed</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Package Stock: Convert vials to packages</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (box_vial </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&amp;&amp;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> box_volume) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  coldStorageMaterial.package_stock </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">+=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(((stock.qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> box_vial) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> box_volume))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h4 id="b-volume-calculations" tabindex="-1">B. Volume Calculations <a class="header-anchor" href="#b-volume-calculations" aria-label="Permalink to &quot;B. Volume Calculations&quot;">​</a></h4><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Volume per box (in liters)</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">volume_box </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> ((box_length </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> box_width </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> box_height) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 1000</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">)</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Package Volume: Total volume occupied by packages</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">coldStorageMaterial.package_volume </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">+=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}"> Number</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">((volume_box </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> ((stock.qty </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> box_vial) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> box_volume)).</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">toFixed</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">(</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">2</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">))</span></span></code></pre></div><h4 id="c-projection-calculations" tabindex="-1">C. Projection Calculations <a class="header-anchor" href="#c-projection-calculations" aria-label="Permalink to &quot;C. Projection Calculations&quot;">​</a></h4><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Maximum dosage requirement</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">for</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> item</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> of</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> entityMasterMaterialActivities) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  coldStorageMaterial.max_dosage </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">+=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> item.max</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Recommended order quantity</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">coldStorageMaterial.recommend_order_base_on_max </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  coldStorageMaterial.max_dosage </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&gt;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> entityMaterial.on_hand_stock </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  coldStorageMaterial.max_dosage </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">-</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> entityMaterial.on_hand_stock </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Projected stock</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">coldStorageMaterial.projection_stock </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  coldStorageMaterial.recommend_order_base_on_max </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">+</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> coldStorageMaterial.dosage_stock</span></span></code></pre></div><h4 id="d-capacity-utilization" tabindex="-1">D. Capacity Utilization <a class="header-anchor" href="#d-capacity-utilization" aria-label="Permalink to &quot;D. Capacity Utilization&quot;">​</a></h4><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Current capacity percentage</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">coldStorage.percentage_capacity </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> coldStorage.volume_asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (coldStorage.total_volume </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> coldStorage.volume_asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 100</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Projected capacity percentage</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">coldStorage.projection_percentage_capacity </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> coldStorage.projection_volume_asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (coldStorage.projection_total_volume </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> coldStorage.projection_volume_asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 100</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span></span></code></pre></div><h4 id="e-temperature-based-calculations" tabindex="-1">E. Temperature-Based Calculations <a class="header-anchor" href="#e-temperature-based-calculations" aria-label="Permalink to &quot;E. Temperature-Based Calculations&quot;">​</a></h4><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Capacity per temperature range</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> percentageCapacity</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> item.volume_asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (item.total_volume </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> item.volume_asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 100</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">const</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> projectionPercentageCapacity</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> =</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> item.projection_volume_asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">?</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> </span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  (item.projection_total_volume </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> item.projection_volume_asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">*</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 100</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">:</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span></span></code></pre></div><h4 id="f-remaining-package-fulfillment" tabindex="-1">F. Remaining Package Fulfillment <a class="header-anchor" href="#f-remaining-package-fulfillment" aria-label="Permalink to &quot;F. Remaining Package Fulfillment&quot;">​</a></h4><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6A737D",
		"--shiki-dark": "#6A737D"
	})}">// Calculate remaining space for packages</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">let</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> remain_package_fulfill </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}"> 0</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (item.volume_per_liter) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  remain_package_fulfill </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> Math.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">floor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">((coldStorage.volume_asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">-</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> coldStorage.total_volume) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (item.volume_per_liter))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">} </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">else</span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}"> if</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (item.package_stock </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">&amp;&amp;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> item.package_volume) {</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">  remain_package_fulfill </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">=</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> Math.</span><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">floor</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">((coldStorage.volume_asset </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">-</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> coldStorage.total_volume) </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> (item.package_volume </span><span style="${ssrRenderStyle({
		"--shiki-light": "#D73A49",
		"--shiki-dark": "#F97583"
	})}">/</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}"> item.package_stock))</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">}</span></span></code></pre></div><h3 id="_4-database-models-involved" tabindex="-1">4. Database Models Involved <a class="header-anchor" href="#_4-database-models-involved" aria-label="Permalink to &quot;4. Database Models Involved&quot;">​</a></h3><h4 id="primary-models" tabindex="-1">Primary Models: <a class="header-anchor" href="#primary-models" aria-label="Permalink to &quot;Primary Models:&quot;">​</a></h4><ul><li><strong>Coldstorage</strong>: Main cold storage facility record</li><li><strong>ColdstorageMaterial</strong>: Material-specific storage data</li><li><strong>ColdstoragePerTemperature</strong>: Temperature range-specific storage data</li><li><strong>AssetIot</strong>: Physical storage assets (refrigerators, freezers)</li><li><strong>RangeTemperature</strong>: Temperature range definitions</li></ul><h4 id="supporting-models" tabindex="-1">Supporting Models: <a class="header-anchor" href="#supporting-models" aria-label="Permalink to &quot;Supporting Models:&quot;">​</a></h4><ul><li><strong>EntityMasterMaterial</strong>: Entity-material relationships</li><li><strong>MasterVolumeMaterialManufacture</strong>: Material volume specifications</li><li><strong>ColdstorageTransactionLog</strong>: Transaction logging</li></ul><h3 id="_5-business-rules" tabindex="-1">5. Business Rules <a class="header-anchor" href="#_5-business-rules" aria-label="Permalink to &quot;5. Business Rules&quot;">​</a></h3><h4 id="capacity-monitoring" tabindex="-1">Capacity Monitoring <a class="header-anchor" href="#capacity-monitoring" aria-label="Permalink to &quot;Capacity Monitoring&quot;">​</a></h4><ul><li><strong>Alert Threshold</strong>: 80% capacity triggers notification</li><li><strong>Notification Logic</strong>: Only triggers when crossing from below 80% to above 80%</li></ul><h4 id="material-filtering" tabindex="-1">Material Filtering <a class="header-anchor" href="#material-filtering" aria-label="Permalink to &quot;Material Filtering&quot;">​</a></h4><ul><li><strong>Vaccine Only</strong>: Only processes materials where <code>is_vaccine = 1</code></li><li><strong>Active Assets</strong>: Only includes assets with <code>status = 1</code></li></ul><h4 id="temperature-mapping" tabindex="-1">Temperature Mapping <a class="header-anchor" href="#temperature-mapping" aria-label="Permalink to &quot;Temperature Mapping&quot;">​</a></h4><ul><li>Assets are mapped to temperature ranges based on <code>min_temp</code> and <code>max_temp</code></li><li>Materials are associated with specific temperature ranges</li></ul><h3 id="_6-data-precision" tabindex="-1">6. Data Precision <a class="header-anchor" href="#_6-data-precision" aria-label="Permalink to &quot;6. Data Precision&quot;">​</a></h3><ul><li>Volume calculations rounded to 2 decimal places</li><li>Package stock always rounded up using <code>Math.ceil()</code></li><li>Percentage calculations rounded to 2 decimal places</li></ul><h3 id="_7-transaction-management" tabindex="-1">7. Transaction Management <a class="header-anchor" href="#_7-transaction-management" aria-label="Permalink to &quot;7. Transaction Management&quot;">​</a></h3><ul><li>All database operations wrapped in transaction <code>t</code></li><li>Ensures data consistency across multiple table updates</li><li>Rollback capability in case of errors</li></ul><h2 id="technical-considerations" tabindex="-1">Technical Considerations <a class="header-anchor" href="#technical-considerations" aria-label="Permalink to &quot;Technical Considerations&quot;">​</a></h2><h3 id="performance-optimizations" tabindex="-1">Performance Optimizations <a class="header-anchor" href="#performance-optimizations" aria-label="Permalink to &quot;Performance Optimizations&quot;">​</a></h3><ul><li>Bulk operations for temperature-based data using <code>Promise.all()</code></li><li>Efficient querying with proper includes and conditions</li><li>Transaction-based operations for data integrity</li></ul><h3 id="error-handling" tabindex="-1">Error Handling <a class="header-anchor" href="#error-handling" aria-label="Permalink to &quot;Error Handling&quot;">​</a></h3><ul><li>Graceful handling of missing volume data</li><li>Default values for undefined calculations</li><li>Safe division operations with zero checks</li></ul><h3 id="scalability-concerns" tabindex="-1">Scalability Concerns <a class="header-anchor" href="#scalability-concerns" aria-label="Permalink to &quot;Scalability Concerns&quot;">​</a></h3><ul><li>Function processes all materials for an entity when <code>master_material_id</code> is null</li><li>Multiple database queries within loops could impact performance with large datasets</li><li>Consider batch processing for entities with many materials</li></ul><h2 id="database-columns-and-data-processing-table" tabindex="-1">Database Columns and Data Processing Table <a class="header-anchor" href="#database-columns-and-data-processing-table" aria-label="Permalink to &quot;Database Columns and Data Processing Table&quot;">​</a></h2><p>The following table shows all database columns involved in the <code>processDataColdstorage</code> function, their sources, and how they are processed:</p><table tabindex="0"><thead><tr><th><strong>Column Name</strong></th><th><strong>Table/Model</strong></th><th><strong>Data Type</strong></th><th><strong>Source/Origin</strong></th><th><strong>Processing Logic</strong></th><th><strong>Purpose</strong></th></tr></thead><tbody><tr><td><code>entity_id</code></td><td>Coldstorage, ColdstorageMaterial, ColdstoragePerTemperature</td><td>INTEGER</td><td>Function parameter</td><td>Direct assignment</td><td>Entity identification</td></tr><tr><td><code>volume_asset</code></td><td>Coldstorage, ColdstoragePerTemperature</td><td>DECIMAL</td><td>AssetIot.volume_asset</td><td>Direct assignment from IoT data</td><td>Physical storage capacity</td></tr><tr><td><code>total_volume</code></td><td>Coldstorage, ColdstoragePerTemperature</td><td>DECIMAL</td><td>Calculated</td><td>Sum of all material volumes per temperature</td><td>Current volume utilization</td></tr><tr><td><code>percentage_capacity</code></td><td>Coldstorage, ColdstoragePerTemperature</td><td>DECIMAL</td><td>Calculated</td><td><code>(total_volume / volume_asset) × 100</code></td><td>Current capacity percentage</td></tr><tr><td><code>projection_volume_asset</code></td><td>Coldstorage, ColdstoragePerTemperature</td><td>DECIMAL</td><td>AssetIot.volume_asset</td><td>Same as volume_asset</td><td>Projected storage capacity</td></tr><tr><td><code>projection_total_volume</code></td><td>Coldstorage, ColdstoragePerTemperature</td><td>DECIMAL</td><td>Calculated</td><td>Sum of projected material volumes</td><td>Future volume utilization</td></tr><tr><td><code>projection_percentage_capacity</code></td><td>Coldstorage, ColdstoragePerTemperature</td><td>DECIMAL</td><td>Calculated</td><td><code>(projection_total_volume / projection_volume_asset) × 100</code></td><td>Future capacity percentage</td></tr><tr><td><code>master_material_id</code></td><td>ColdstorageMaterial</td><td>INTEGER</td><td>EntityMasterMaterial</td><td>Direct assignment</td><td>Material identification</td></tr><tr><td><code>dosage_stock</code></td><td>ColdstorageMaterial</td><td>INTEGER</td><td>EntityMasterMaterial.on_hand_stock</td><td>Direct assignment</td><td>Current dosage inventory</td></tr><tr><td><code>vial_stock</code></td><td>ColdstorageMaterial</td><td>DECIMAL</td><td>Calculated</td><td><code>dosage_stock ÷ pieces_per_unit</code></td><td>Vial count calculation</td></tr><tr><td><code>package_stock</code></td><td>ColdstorageMaterial</td><td>INTEGER</td><td>Calculated</td><td><code>Math.ceil(vial_stock ÷ unit_per_box)</code></td><td>Package count (rounded up)</td></tr><tr><td><code>package_volume</code></td><td>ColdstorageMaterial</td><td>DECIMAL</td><td>Calculated</td><td><code>package_stock × volume_per_liter</code></td><td>Total volume for material</td></tr><tr><td><code>projection_dosage_stock</code></td><td>ColdstorageMaterial</td><td>INTEGER</td><td>Calculated</td><td><code>dosage_stock + max_dosage</code></td><td>Future dosage inventory</td></tr><tr><td><code>projection_vial_stock</code></td><td>ColdstorageMaterial</td><td>DECIMAL</td><td>Calculated</td><td><code>projection_dosage_stock ÷ pieces_per_unit</code></td><td>Future vial count</td></tr><tr><td><code>projection_package_stock</code></td><td>ColdstorageMaterial</td><td>INTEGER</td><td>Calculated</td><td><code>Math.ceil(projection_vial_stock ÷ unit_per_box)</code></td><td>Future package count</td></tr><tr><td><code>projection_package_volume</code></td><td>ColdstorageMaterial</td><td>DECIMAL</td><td>Calculated</td><td><code>projection_package_stock × volume_per_liter</code></td><td>Future total volume</td></tr><tr><td><code>volume_per_liter</code></td><td>ColdstorageMaterial</td><td>DECIMAL</td><td>Calculated</td><td><code>(box_length × box_width × box_height) ÷ 1000</code></td><td>Volume per package in liters</td></tr><tr><td><code>max_dosage</code></td><td>ColdstorageMaterial</td><td>INTEGER</td><td>MasterVolumeMaterialManufacture</td><td>Maximum from activities</td><td>Maximum required dosage</td></tr><tr><td><code>recommend_order_base_on_max</code></td><td>ColdstorageMaterial</td><td>INTEGER</td><td>Calculated</td><td><code>max_dosage - dosage_stock</code> (if positive)</td><td>Recommended order quantity</td></tr><tr><td><code>remain_package_fulfill</code></td><td>ColdstorageMaterial</td><td>INTEGER</td><td>Calculated</td><td><code>Math.floor((volume_asset - total_volume) ÷ volume_per_liter)</code></td><td>Remaining capacity in packages</td></tr><tr><td><code>range_temperature_id</code></td><td>ColdstoragePerTemperature</td><td>INTEGER</td><td>RangeTemperature</td><td>From rangeMaterialData grouping</td><td>Temperature range identification</td></tr><tr><td><code>coldstorage_id</code></td><td>ColdstorageMaterial, ColdstoragePerTemperature</td><td>INTEGER</td><td>Generated</td><td>Auto-increment from Coldstorage creation</td><td>Cold storage record ID</td></tr></tbody></table><h3 id="data-flow-and-relationships" tabindex="-1"><strong>Data Flow and Relationships</strong> <a class="header-anchor" href="#data-flow-and-relationships" aria-label="Permalink to &quot;**Data Flow and Relationships**&quot;">​</a></h3><ol><li><p><strong>Input Sources</strong>:</p><ul><li><code>AssetIot</code>: Provides physical storage capacity (<code>volume_asset</code>)</li><li><code>EntityMasterMaterial</code>: Provides current stock levels (<code>on_hand_stock</code>)</li><li><code>MasterMaterial</code>: Provides material specifications (dimensions, units)</li><li><code>MasterVolumeMaterialManufacture</code>: Provides activity-based requirements</li><li><code>RangeTemperature</code>: Provides temperature categorization</li></ul></li><li><p><strong>Calculation Dependencies</strong>:</p><ul><li>Volume calculations depend on material dimensions</li><li>Stock projections depend on current stock + maximum requirements</li><li>Capacity percentages depend on volume ratios</li><li>Temperature-based calculations depend on material temperature requirements</li></ul></li><li><p><strong>Output Destinations</strong>:</p><ul><li><code>Coldstorage</code>: Aggregate facility-level metrics</li><li><code>ColdstorageMaterial</code>: Material-specific storage data</li><li><code>ColdstoragePerTemperature</code>: Temperature-specific capacity data</li><li><code>ColdstorageTransactionLog</code>: Audit trail of changes</li></ul></li></ol><h2 id="dependencies" tabindex="-1">Dependencies <a class="header-anchor" href="#dependencies" aria-label="Permalink to &quot;Dependencies&quot;">​</a></h2><h3 id="external-services" tabindex="-1">External Services <a class="header-anchor" href="#external-services" aria-label="Permalink to &quot;External Services&quot;">​</a></h3><ul><li><strong>Notification Service</strong>: <code>generateCapacityNotification()</code> for capacity alerts</li><li><strong>Database Models</strong>: Sequelize ORM models for data persistence</li></ul><h3 id="helper-functions" tabindex="-1">Helper Functions <a class="header-anchor" href="#helper-functions" aria-label="Permalink to &quot;Helper Functions&quot;">​</a></h3><ul><li><strong>createColdstorageMaterials()</strong>: Initializes material data for new cold storage</li></ul><h2 id="conclusion" tabindex="-1">Conclusion <a class="header-anchor" href="#conclusion" aria-label="Permalink to &quot;Conclusion&quot;">​</a></h2><p>The <code>processDataColdstorage</code> function is a comprehensive cold storage management system that:</p><ol><li><strong>Calculates Storage Metrics</strong>: Tracks current and projected storage utilization</li><li><strong>Manages Temperature Zones</strong>: Handles different temperature requirements for various vaccines</li><li><strong>Monitors Capacity</strong>: Provides alerts when storage approaches capacity limits</li><li><strong>Projects Future Needs</strong>: Calculates recommended ordering quantities based on usage patterns</li><li><strong>Maintains Data Integrity</strong>: Uses transactions to ensure consistent data updates</li></ol><p>This function is critical for vaccine supply chain management, ensuring adequate cold storage capacity and proper inventory planning for healthcare facilities.</p><h2 id="recommendations" tabindex="-1">Recommendations <a class="header-anchor" href="#recommendations" aria-label="Permalink to &quot;Recommendations&quot;">​</a></h2><ol><li><strong>Performance</strong>: Consider implementing batch processing for large entities</li><li><strong>Monitoring</strong>: Add logging for capacity threshold breaches</li><li><strong>Validation</strong>: Implement input validation for entity_id and master_material_id</li><li><strong>Documentation</strong>: Add inline comments for complex calculation formulas</li><li><strong>Testing</strong>: Implement unit tests for calculation accuracy</li></ol></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/process-data-coldstorage-analysis.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var process_data_coldstorage_analysis_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, process_data_coldstorage_analysis_default as default };
