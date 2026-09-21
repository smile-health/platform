import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSuspense } from "vue/server-renderer";
import { resolveComponent, useSSRContext } from "vue";
//#region architecture/operations/version-control-workflow.md
var __pageData = JSON.parse("{\"title\":\"Version Control Workflow\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"architecture/operations/version-control-workflow.md\",\"filePath\":\"architecture/operations/version-control-workflow.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "architecture/operations/version-control-workflow.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_Mermaid = resolveComponent("Mermaid");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="version-control-workflow" tabindex="-1">Version Control Workflow <a class="header-anchor" href="#version-control-workflow" aria-label="Permalink to &quot;Version Control Workflow&quot;">​</a></h1><p>Dokumentasi ini menjelaskan alur kerja version control yang digunakan dalam proyek SMILE Platform.</p><h2 id="ringkasan-strategi-branching" tabindex="-1">Ringkasan Strategi Branching <a class="header-anchor" href="#ringkasan-strategi-branching" aria-label="Permalink to &quot;Ringkasan Strategi Branching&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-9",
				class: "mermaid",
				graph: "graph%20TB%0A%20%20%20%20subgraph%20%22Development%20Flow%22%0A%20%20%20%20%20%20%20%20DEV%5BDeveloper%5D%20--%3E%7Ccreate%7C%20FEATURE%5Bfeature%2F*%2C%20feat%2F*%2C%20fix%2F*%5D%0A%20%20%20%20%20%20%20%20FEATURE%20--%3E%7Cmerge%7C%20DEV_BRANCH%5Bdev%20branch%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20%22Deployment%20Targets%22%0A%20%20%20%20%20%20%20%20DEV_BRANCH%20--%3E%7Cauto%20deploy%7C%20SERVER_DEV%5BServer%20Dev%3Cbr%2F%3Ebadr%5D%0A%20%20%20%20%20%20%20%20DEV_BRANCH%20--%3E%7Cmerge%20untuk%20staging%7C%20MAIN%5Bmain%20branch%5D%0A%20%20%20%20%20%20%20%20MAIN%20--%3E%7Cauto%20deploy%7C%20SERVER_STAGING%5BServer%20Staging%2FUAT%3Cbr%2F%3EAWS%5D%0A%20%20%20%20%20%20%20%20DEV_BRANCH%20--%3E%7Cmerge%20untuk%20training%7C%20TRAINING%5Btraining%20branch%5D%0A%20%20%20%20%20%20%20%20TRAINING%20--%3E%7Cauto%20deploy%7C%20SERVER_TRAINING%5BServer%20Training%3Cbr%2F%3EAWS%3Cbr%2F%3Eshared%20app%2C%20separate%20data%5D%0A%20%20%20%20%20%20%20%20MAIN%20--%3E%7Ccreate%20tag%20untuk%20dry%20run%2Fmaintenance%7C%20RELEASE%5Brelease-*%20tag%5D%0A%20%20%20%20%20%20%20%20RELEASE%20--%3E%7Cauto%20deploy%7C%20SERVER_RELEASE%5BServer%20Release%3Cbr%2F%3Edry%20run%2C%20maintenance%2C%20migration%5D%0A%20%20%20%20%20%20%20%20MAIN%20--%3E%7Ccreate%20tag%20untuk%20production%7C%20PROD%5Bprod-*%20tag%5D%0A%20%20%20%20%20%20%20%20PROD%20--%3E%7Cmanual%20deploy%7C%20SERVER_PROD%5BServer%20Production%3Cbr%2F%3ESMILE%205.0%3Cbr%2F%3Ededicated%20server%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20%22Hotfix%20Flow%22%0A%20%20%20%20%20%20%20%20PROD_TAG%5BLatest%20prod-*%20tag%5D%20--%3E%7Ccheckout%20to%7C%20PROD_SMILE%5Bprod-smile%20branch%5D%0A%20%20%20%20%20%20%20%20PROD_SMILE%20--%3E%7Cwork%20on%7C%20HOTFIX_BRANCH%5Bprod-smile%20branch%5D%0A%20%20%20%20%20%20%20%20HOTFIX_BRANCH%20--%3E%7Ccreate%20new%7C%20NEW_PROD_TAG%5Bprod-*%20tag%3Cbr%2F%3Esemantic%20versioning%3Cbr%2F%3Epatch%20increment%5D%0A%20%20%20%20end%0A%0A%20%20%20%20style%20SERVER_DEV%20fill%3A%23e1f5ff%0A%20%20%20%20style%20SERVER_STAGING%20fill%3A%23fff4e1%0A%20%20%20%20style%20SERVER_TRAINING%20fill%3A%23f0e1ff%0A%20%20%20%20style%20SERVER_RELEASE%20fill%3A%23ffe1e1%0A%20%20%20%20style%20SERVER_PROD%20fill%3A%23e1ffe1%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h2 id="alur-kerja-detail" tabindex="-1">Alur Kerja Detail <a class="header-anchor" href="#alur-kerja-detail" aria-label="Permalink to &quot;Alur Kerja Detail&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-13",
				class: "mermaid",
				graph: "gitGraph%0A%20%20%20%20commit%20id%3A%20%22Initial%22%0A%20%20%20%20branch%20dev%0A%20%20%20%20checkout%20dev%0A%20%20%20%20commit%20id%3A%20%22Dev%20init%22%0A%0A%20%20%20%20branch%20feature%2Fuser-auth%0A%20%20%20%20checkout%20feature%2Fuser-auth%0A%20%20%20%20commit%20id%3A%20%22Add%20login%22%0A%20%20%20%20commit%20id%3A%20%22Add%20register%22%0A%20%20%20%20checkout%20dev%0A%20%20%20%20merge%20feature%2Fuser-auth%20tag%3A%20%22%E2%86%92%20badr%20server%22%0A%0A%20%20%20%20branch%20feat%2Fdashboard%0A%20%20%20%20checkout%20feat%2Fdashboard%0A%20%20%20%20commit%20id%3A%20%22Dashboard%20UI%22%0A%20%20%20%20checkout%20dev%0A%20%20%20%20merge%20feat%2Fdashboard%0A%0A%20%20%20%20branch%20fix%2Flogin-bug%0A%20%20%20%20checkout%20fix%2Flogin-bug%0A%20%20%20%20commit%20id%3A%20%22Fix%20validation%22%0A%20%20%20%20checkout%20dev%0A%20%20%20%20merge%20fix%2Flogin-bug%0A%20%20%20%20commit%20id%3A%20%22Dev%20stable%22%20tag%3A%20%22%E2%86%92%20badr%20server%22%0A%0A%20%20%20%20checkout%20main%0A%20%20%20%20branch%20main%0A%20%20%20%20merge%20dev%20tag%3A%20%22v1.0.0%20%E2%86%92%20AWS%20staging%22%0A%0A%20%20%20%20branch%20training%0A%20%20%20%20checkout%20training%0A%20%20%20%20commit%20id%3A%20%22Training%20data%22%20tag%3A%20%22%E2%86%92%20AWS%20training%22%0A%0A%20%20%20%20checkout%20main%0A%20%20%20%20branch%20release-1.0.0%0A%20%20%20%20checkout%20release-1.0.0%0A%20%20%20%20commit%20id%3A%20%22Dry%20run%20prep%22%20tag%3A%20%22%E2%86%92%20release%20domain%22%0A%0A%20%20%20%20checkout%20main%0A%20%20%20%20commit%20id%3A%20%22Prod%20ready%22%20tag%3A%20%22prod-1.0.0%20%E2%86%92%20Production%22%0A%0A%20%20%20%20branch%20prod-smile%0A%20%20%20%20checkout%20prod-smile%0A%20%20%20%20commit%20id%3A%20%22Prod%20deploy%22%0A%0A%20%20%20%20branch%20hotfix%0A%20%20%20%20checkout%20hotfix%0A%20%20%20%20commit%20id%3A%20%22Critical%20fix%22%0A%20%20%20%20checkout%20prod-smile%0A%20%20%20%20merge%20hotfix%0A%20%20%20%20commit%20id%3A%20%22Hotfix%20applied%22%20tag%3A%20%22prod-1.0.1%20%E2%86%92%20Production%22%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h2 id="branch-strategy" tabindex="-1">Branch Strategy <a class="header-anchor" href="#branch-strategy" aria-label="Permalink to &quot;Branch Strategy&quot;">​</a></h2><h3 id="_1-development-branches" tabindex="-1">1. Development Branches <a class="header-anchor" href="#_1-development-branches" aria-label="Permalink to &quot;1. Development Branches&quot;">​</a></h3><h4 id="feature-fix-branches" tabindex="-1">Feature/Fix Branches <a class="header-anchor" href="#feature-fix-branches" aria-label="Permalink to &quot;Feature/Fix Branches&quot;">​</a></h4><ul><li><strong>Pattern</strong>: <code>feature/*</code>, <code>feat/*</code>, <code>fix/*</code></li><li><strong>Dibuat oleh</strong>: Developer</li><li><strong>Merge ke</strong>: <code>dev</code></li><li><strong>Contoh</strong>: <ul><li><code>feature/user-authentication</code></li><li><code>feat/dashboard-redesign</code></li><li><code>fix/login-validation</code></li></ul></li></ul>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-62",
				class: "mermaid",
				graph: "sequenceDiagram%0A%20%20%20%20participant%20Dev%20as%20Developer%0A%20%20%20%20participant%20FB%20as%20Feature%20Branch%0A%20%20%20%20participant%20DevB%20as%20dev%20Branch%0A%20%20%20%20participant%20Server%20as%20Server%20Dev%20(badr)%0A%0A%20%20%20%20Dev-%3E%3EFB%3A%20Create%20feature%2Ffeat%2Ffix%20branch%0A%20%20%20%20Dev-%3E%3EFB%3A%20Commit%20changes%0A%20%20%20%20Dev-%3E%3EFB%3A%20Push%20to%20remote%0A%20%20%20%20Dev-%3E%3EDevB%3A%20Create%20merge%20request%0A%20%20%20%20DevB-%3E%3EDevB%3A%20Code%20review%20%26%20approval%0A%20%20%20%20DevB-%3E%3EFB%3A%20Merge%0A%20%20%20%20DevB-%3E%3EServer%3A%20Auto%20deploy%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="_2-main-deployment-branches" tabindex="-1">2. Main Deployment Branches <a class="header-anchor" href="#_2-main-deployment-branches" aria-label="Permalink to &quot;2. Main Deployment Branches&quot;">​</a></h3><h4 id="dev-branch" tabindex="-1">Dev Branch <a class="header-anchor" href="#dev-branch" aria-label="Permalink to &quot;Dev Branch&quot;">​</a></h4><ul><li><strong>Target</strong>: Server Development (badr)</li><li><strong>Auto Deploy</strong>: ✅ Yes</li><li><strong>Purpose</strong>: Development testing</li></ul>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-86",
				class: "mermaid",
				graph: "flowchart%20LR%0A%20%20%20%20A%5Bfeature%2Ffeat%2Ffix%5D%20--%3E%7Cmerge%7C%20B%5Bdev%5D%0A%20%20%20%20B%20--%3E%7Cauto%20deploy%7C%20C%5BServer%20Dev%3Cbr%2F%3Ebadr%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h4 id="main-branch" tabindex="-1">Main Branch <a class="header-anchor" href="#main-branch" aria-label="Permalink to &quot;Main Branch&quot;">​</a></h4><ul><li><strong>Source</strong>: Merge dari <code>dev</code></li><li><strong>Target</strong>: Server Staging/UAT (AWS)</li><li><strong>Auto Deploy</strong>: ✅ Yes</li><li><strong>Purpose</strong>: Pre-production testing</li><li><strong>Kapan merge</strong>: Ketika ada perubahan yang ingin dilihat/deploy ke staging</li></ul>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-117",
				class: "mermaid",
				graph: "flowchart%20LR%0A%20%20%20%20A%5Bdev%5D%20--%3E%7Cmerge%20untuk%20staging%7C%20B%5Bmain%5D%0A%20%20%20%20B%20--%3E%7Cauto%20deploy%7C%20C%5BServer%20Staging%2FUAT%3Cbr%2F%3EAWS%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h4 id="training-branch" tabindex="-1">Training Branch <a class="header-anchor" href="#training-branch" aria-label="Permalink to &quot;Training Branch&quot;">​</a></h4><ul><li><strong>Source</strong>: Merge dari <code>dev</code></li><li><strong>Target</strong>: Server Training (AWS)</li><li><strong>Auto Deploy</strong>: ✅ Yes</li><li><strong>Purpose</strong>: Training environment</li><li><strong>Note</strong>: Shared application with staging, separate database</li><li><strong>Kapan merge</strong>: Ketika ada keperluan training</li></ul>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-153",
				class: "mermaid",
				graph: "flowchart%20LR%0A%20%20%20%20A%5Bdev%5D%20--%3E%7Cmerge%20untuk%20training%7C%20B%5Btraining%5D%0A%20%20%20%20B%20--%3E%7Cauto%20deploy%7C%20C%5BServer%20Training%3Cbr%2F%3EAWS%3Cbr%2F%3EShared%20app%2C%20separate%20data%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="_3-release-tags" tabindex="-1">3. Release Tags <a class="header-anchor" href="#_3-release-tags" aria-label="Permalink to &quot;3. Release Tags&quot;">​</a></h3><h4 id="release-tag" tabindex="-1">release-* Tag <a class="header-anchor" href="#release-tag" aria-label="Permalink to &quot;release-\\* Tag&quot;">​</a></h4><ul><li><strong>Pattern</strong>: <code>release-1.0.0</code>, <code>release-2.1.0</code></li><li><strong>Source</strong>: Dibuat dari <code>main</code> branch</li><li><strong>Target</strong>: release.smile-indonesia.id</li><li><strong>Auto Deploy</strong>: ✅ Yes</li><li><strong>Kapan dibuat</strong>: Ketika ada keperluan: <ul><li>Dry run testing</li><li>Maintenance clone of production</li><li>Data migration testing</li></ul></li></ul>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-204",
				class: "mermaid",
				graph: "flowchart%20TB%0A%20%20%20%20A%5Bmain%20branch%5D%20--%3E%7Ccreate%20tag%20untuk%3Cbr%2F%3Edry%20run%2Fmaintenance%7C%20B%5Brelease-*%5D%0A%20%20%20%20B%20--%3E%7Cauto%20deploy%7C%20C%5Brelease.smile-indonesia.id%5D%0A%20%20%20%20C%20--%3E%7Cpurposes%7C%20D%5BDry%20Run%5D%0A%20%20%20%20C%20--%3E%7Cpurposes%7C%20E%5BMaintenance%20Clone%5D%0A%20%20%20%20C%20--%3E%7Cpurposes%7C%20F%5BData%20Migration%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="_4-production-tags" tabindex="-1">4. Production Tags <a class="header-anchor" href="#_4-production-tags" aria-label="Permalink to &quot;4. Production Tags&quot;">​</a></h3><h4 id="prod-tag" tabindex="-1">prod-* Tag <a class="header-anchor" href="#prod-tag" aria-label="Permalink to &quot;prod-\\* Tag&quot;">​</a></h4><ul><li><strong>Pattern</strong>: <code>prod-1.0.0</code>, <code>prod-1.0.1</code></li><li><strong>Source</strong>: Dibuat dari <code>main</code> branch</li><li><strong>Target</strong>: Server Production SMILE 5.0</li><li><strong>Deploy</strong>: Manual</li><li><strong>Versioning</strong>: Semantic Versioning</li><li><strong>Server</strong>: Dedicated production server</li><li><strong>Kapan dibuat</strong>: Ketika siap untuk production release</li></ul>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-248",
				class: "mermaid",
				graph: "flowchart%20TB%0A%20%20%20%20A%5Bmain%20branch%5D%20--%3E%7Ccreate%20tag%20untuk%3Cbr%2F%3Eproduction%7C%20B%5Bprod-*%5D%0A%20%20%20%20B%20--%3E%7Cmanual%20deploy%7C%20C%5BProduction%20Server%3Cbr%2F%3ESMILE%205.0%3Cbr%2F%3EAWS%5D%0A%20%20%20%20B%20--%3E%7Cfollows%7C%20D%5BSemantic%20Versioning%3Cbr%2F%3EMAJOR.MINOR.PATCH%5D%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="_5-hotfix-workflow" tabindex="-1">5. Hotfix Workflow <a class="header-anchor" href="#_5-hotfix-workflow" aria-label="Permalink to &quot;5. Hotfix Workflow&quot;">​</a></h3>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-252",
				class: "mermaid",
				graph: "flowchart%20TB%0A%20%20%20%20A%5BLatest%20prod-*%20tag%5D%20--%3E%7Ccheckout%7C%20B%5Bprod-smile%20branch%5D%0A%20%20%20%20B%20--%3E%7Ccreate%7C%20C%5Bprod-smile%20branch%5D%0A%20%20%20%20C%20--%3E%7Cwork%20on%20fix%7C%20D%5BCommit%20changes%5D%0A%20%20%20%20D%20--%3E%7Cmerge%20back%7C%20B%0A%20%20%20%20B%20--%3E%7Ccreate%20new%20tag%7C%20E%5Bprod-*%20tag%3Cbr%2F%3Eincrement%20patch%20version%5D%0A%20%20%20%20E%20--%3E%7Cdeploy%7C%20F%5BProduction%20Server%5D%0A%0A%20%20%20%20style%20A%20fill%3A%23ffe1e1%0A%20%20%20%20style%20E%20fill%3A%23e1ffe1%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h2 id="semantic-versioning-untuk-production" tabindex="-1">Semantic Versioning untuk Production <a class="header-anchor" href="#semantic-versioning-untuk-production" aria-label="Permalink to &quot;Semantic Versioning untuk Production&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-256",
				class: "mermaid",
				graph: "graph%20LR%0A%20%20%20%20A%5Bprod-MAJOR.MINOR.PATCH%5D%20--%3E%20B%5BMAJOR%3A%20Breaking%20changes%5D%0A%20%20%20%20A%20--%3E%20C%5BMINOR%3A%20New%20features%5D%0A%20%20%20%20A%20--%3E%20D%5BPATCH%3A%20Bug%20fixes%5D%0A%0A%20%20%20%20style%20B%20fill%3A%23ff6b6b%0A%20%20%20%20style%20C%20fill%3A%234ecdc4%0A%20%20%20%20style%20D%20fill%3A%2395e1d3%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h3 id="contoh" tabindex="-1">Contoh: <a class="header-anchor" href="#contoh" aria-label="Permalink to &quot;Contoh:&quot;">​</a></h3><ul><li><code>prod-1.0.0</code> → Initial production release</li><li><code>prod-1.0.1</code> → Hotfix/patch</li><li><code>prod-1.1.0</code> → New feature (backward compatible)</li><li><code>prod-2.0.0</code> → Breaking changes</li></ul><h2 id="environment-overview" tabindex="-1">Environment Overview <a class="header-anchor" href="#environment-overview" aria-label="Permalink to &quot;Environment Overview&quot;">​</a></h2>`);
	ssrRenderSuspense(_push, {
		default: () => {
			_push(ssrRenderComponent(_component_Mermaid, {
				id: "mermaid-285",
				class: "mermaid",
				graph: "graph%20TB%0A%20%20%20%20subgraph%20%22Development%22%0A%20%20%20%20%20%20%20%20DEV%5Bdev%20branch%3Cbr%2F%3E%E2%86%92%20Server%20Dev%20badr%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20%22Staging%22%0A%20%20%20%20%20%20%20%20MAIN%5Bmain%20branch%3Cbr%2F%3E%E2%86%92%20Server%20Staging%20AWS%5D%0A%20%20%20%20%20%20%20%20TRAINING%5Btraining%20branch%3Cbr%2F%3E%E2%86%92%20Server%20Training%20AWS%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20%22Pre-Production%22%0A%20%20%20%20%20%20%20%20RELEASE%5Brelease-*%20tag%3Cbr%2F%3E%E2%86%92%20release.smile-indonesia.id%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20%22Production%22%0A%20%20%20%20%20%20%20%20PROD%5Bprod-*%20tag%3Cbr%2F%3E%E2%86%92%20Production%20Server%5D%0A%20%20%20%20end%0A%0A%20%20%20%20DEV%20--%3E%7Cmerge%20untuk%20staging%7C%20MAIN%0A%20%20%20%20DEV%20--%3E%7Cmerge%20untuk%20training%7C%20TRAINING%0A%20%20%20%20MAIN%20--%3E%7Ccreate%20tag%20untuk%20dry%20run%7C%20RELEASE%0A%20%20%20%20MAIN%20--%3E%7Ccreate%20tag%20untuk%20production%7C%20PROD%0A%0A%20%20%20%20style%20DEV%20fill%3A%23e1f5ff%0A%20%20%20%20style%20MAIN%20fill%3A%23fff4e1%0A%20%20%20%20style%20TRAINING%20fill%3A%23f0e1ff%0A%20%20%20%20style%20RELEASE%20fill%3A%23ffe1e1%0A%20%20%20%20style%20PROD%20fill%3A%23e1ffe1%0A"
			}, null, _parent));
		},
		fallback: () => {
			_push(` Loading... `);
		},
		_: 1
	});
	_push(`<h2 id="best-practices" tabindex="-1">Best Practices <a class="header-anchor" href="#best-practices" aria-label="Permalink to &quot;Best Practices&quot;">​</a></h2><h3 id="_1-branch-naming-convention" tabindex="-1">1. Branch Naming Convention <a class="header-anchor" href="#_1-branch-naming-convention" aria-label="Permalink to &quot;1. Branch Naming Convention&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>feature/descriptive-name</span></span>
<span class="line"><span>feat/descriptive-name</span></span>
<span class="line"><span>fix/descriptive-name</span></span>
<span class="line"><span>hotfix (untuk production fixes)</span></span></code></pre></div><h3 id="_2-commit-messages" tabindex="-1">2. Commit Messages <a class="header-anchor" href="#_2-commit-messages" aria-label="Permalink to &quot;2. Commit Messages&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>feat: add user authentication</span></span>
<span class="line"><span>fix: resolve login validation issue</span></span>
<span class="line"><span>docs: update API documentation</span></span>
<span class="line"><span>refactor: improve code structure</span></span>
<span class="line"><span>test: add unit tests for auth module</span></span></code></pre></div><h3 id="_3-merge-strategy" tabindex="-1">3. Merge Strategy <a class="header-anchor" href="#_3-merge-strategy" aria-label="Permalink to &quot;3. Merge Strategy&quot;">​</a></h3><ul><li><strong>Feature → Dev</strong>: Squash and merge (optional)</li><li><strong>Dev → Main</strong>: Merge commit (ketika ingin deploy ke staging)</li><li><strong>Dev → Training</strong>: Merge commit (ketika ada keperluan training)</li><li><strong>Hotfix → Prod-smile</strong>: Merge commit</li></ul><h2 id="deployment-matrix" tabindex="-1">Deployment Matrix <a class="header-anchor" href="#deployment-matrix" aria-label="Permalink to &quot;Deployment Matrix&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Branch/Tag</th><th>Server</th><th>Environment</th><th>Auto Deploy</th><th>Purpose</th></tr></thead><tbody><tr><td><code>dev</code></td><td>Badr</td><td>Development</td><td>✅</td><td>Development testing</td></tr><tr><td><code>main</code></td><td>AWS</td><td>Staging/UAT</td><td>✅</td><td>Pre-production testing</td></tr><tr><td><code>training</code></td><td>AWS</td><td>Training</td><td>✅</td><td>Training (shared app, separate data)</td></tr><tr><td><code>release-*</code></td><td>AWS</td><td>Pre-production</td><td>✅</td><td>Dry run, maintenance, migration</td></tr><tr><td><code>prod-*</code></td><td>AWS</td><td>Production</td><td>❌ Auto CI but manual deploy</td><td>Live production</td></tr></tbody></table><h2 id="referensi" tabindex="-1">Referensi <a class="header-anchor" href="#referensi" aria-label="Permalink to &quot;Referensi&quot;">​</a></h2><ul><li><a href="https://semver.org/" target="_blank" rel="noreferrer">Semantic Versioning</a></li><li><a href="https://nvie.com/posts/a-successful-git-branching-model/" target="_blank" rel="noreferrer">Git Flow</a></li><li><a href="https://www.conventionalcommits.org/" target="_blank" rel="noreferrer">Conventional Commits</a></li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("architecture/operations/version-control-workflow.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var version_control_workflow_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, version_control_workflow_default as default };
