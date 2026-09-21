import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
//#region archive/documentation-audit-2025.md
var __pageData = JSON.parse("{\"title\":\"SMILE Platform Documentation Audit\",\"description\":\"\",\"frontmatter\":{},\"headers\":[],\"relativePath\":\"archive/documentation-audit-2025.md\",\"filePath\":\"archive/documentation-audit-2025.md\",\"lastUpdated\":null}");
var _sfc_main = { name: "archive/documentation-audit-2025.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="smile-platform-documentation-audit" tabindex="-1">SMILE Platform Documentation Audit <a class="header-anchor" href="#smile-platform-documentation-audit" aria-label="Permalink to &quot;SMILE Platform Documentation Audit&quot;">​</a></h1><blockquote><p><strong>ARSIP — jangan dipakai sebagai acuan implementasi.</strong> Audit dokumentasi Januari 2025, digantikan oleh konsolidasi <code>adr/</code> ke <code>docs/</code>. Merujuk checkout lama <code>platform-backend</code>, dan penilaiannya sudah tidak berlaku. Disimpan sebagai rujukan historis saja.</p></blockquote><h2 id="executive-summary" tabindex="-1">Executive Summary <a class="header-anchor" href="#executive-summary" aria-label="Permalink to &quot;Executive Summary&quot;">​</a></h2><p>This audit analyzes the existing Architecture Decision Records (ADR) documentation in the <code>c:\\laragon\\www\\platform-backend\\adr</code> directory to identify obsolete, deprecated, or redundant documentation and provide recommendations for consolidation and improvement.</p><h2 id="documentation-inventory" tabindex="-1">Documentation Inventory <a class="header-anchor" href="#documentation-inventory" aria-label="Permalink to &quot;Documentation Inventory&quot;">​</a></h2><h3 id="current-documentation-structure" tabindex="-1">Current Documentation Structure <a class="header-anchor" href="#current-documentation-structure" aria-label="Permalink to &quot;Current Documentation Structure&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>adr/</span></span>
<span class="line"><span>├── Core Architecture Docs (9 files)</span></span>
<span class="line"><span>├── Infrastructure &amp; Monitoring (3 files)  </span></span>
<span class="line"><span>├── API &amp; Integration (3 files)</span></span>
<span class="line"><span>├── Data Migration (17+ files)</span></span>
<span class="line"><span>├── Database Models (2 files)</span></span>
<span class="line"><span>├── Dashboard APIs (7 files)</span></span>
<span class="line"><span>├── Feature Flags (2 files)</span></span>
<span class="line"><span>├── Process Documentation (1 file)</span></span>
<span class="line"><span>└── Service Status (1 file)</span></span></code></pre></div><p><strong>Total</strong>: 45+ documentation files</p><h2 id="audit-findings" tabindex="-1">Audit Findings <a class="header-anchor" href="#audit-findings" aria-label="Permalink to &quot;Audit Findings&quot;">​</a></h2><h3 id="🟢-current-relevant-documentation" tabindex="-1">🟢 Current &amp; Relevant Documentation <a class="header-anchor" href="#🟢-current-relevant-documentation" aria-label="Permalink to &quot;🟢 Current &amp; Relevant Documentation&quot;">​</a></h3><h4 id="high-priority-keep-maintain" tabindex="-1">High-Priority (Keep &amp; Maintain) <a class="header-anchor" href="#high-priority-keep-maintain" aria-label="Permalink to &quot;High-Priority (Keep &amp; Maintain)&quot;">​</a></h4><ol><li><strong><code>INFRASTRUCTURE_MONITORING.md</code></strong> - Recently updated with comprehensive monitoring</li><li><strong><code>TIMEOUT_TROUBLESHOOTING.md</code></strong> - Essential for debugging connection issues</li><li><strong><code>SERVICE_STATUSES.md</code></strong> - Live service status tracking</li><li><strong><code>data-migration-smile3-to-smile5/</code></strong> - Active migration documentation</li><li><strong><code>database-migrations/</code></strong> - Current database schema documentation</li></ol><h4 id="medium-priority-consolidate" tabindex="-1">Medium-Priority (Consolidate) <a class="header-anchor" href="#medium-priority-consolidate" aria-label="Permalink to &quot;Medium-Priority (Consolidate)&quot;">​</a></h4><ol><li><strong><code>authentication.md</code></strong> - Basic but needs integration with current auth service</li><li><strong><code>lib-documentation.md</code></strong> - Comprehensive but could be split into sections</li><li><strong><code>shared-packages.md</code></strong> - Relevant but overlaps with lib-documentation</li></ol><h3 id="🟡-outdated-but-salvageable" tabindex="-1">🟡 Outdated but Salvageable <a class="header-anchor" href="#🟡-outdated-but-salvageable" aria-label="Permalink to &quot;🟡 Outdated but Salvageable&quot;">​</a></h3><h4 id="needs-major-updates" tabindex="-1">Needs Major Updates <a class="header-anchor" href="#needs-major-updates" aria-label="Permalink to &quot;Needs Major Updates&quot;">​</a></h4><ol><li><strong><code>databaseModels.md</code></strong> - References Sequelize (now uses Kysely)</li><li><strong><code>databaseModelsTransaction.md</code></strong> - Same ORM reference issue</li><li><strong><code>cursor-pagination-guide.md</code></strong> - May not reflect current implementation</li><li><strong><code>apitest.md</code></strong> - Comprehensive but may need tech stack updates</li></ol><h3 id="🔴-obsolete-deprecated-documentation" tabindex="-1">🔴 Obsolete/Deprecated Documentation <a class="header-anchor" href="#🔴-obsolete-deprecated-documentation" aria-label="Permalink to &quot;🔴 Obsolete/Deprecated Documentation&quot;">​</a></h3><h4 id="remove-or-archive" tabindex="-1">Remove or Archive <a class="header-anchor" href="#remove-or-archive" aria-label="Permalink to &quot;Remove or Archive&quot;">​</a></h4><ol><li><strong><code>index.md</code></strong> - Contains broken links and outdated structure</li><li><strong><code>diagrams/</code></strong> references - Many broken links in index.md</li><li><strong>Old API documentation</strong> - Superseded by current service docs</li><li><strong><code>version-control-workflow.md</code></strong> - Likely outdated, check current Git workflow</li></ol><h4 id="specific-issues-identified" tabindex="-1">Specific Issues Identified: <a class="header-anchor" href="#specific-issues-identified" aria-label="Permalink to &quot;Specific Issues Identified:&quot;">​</a></h4><ul><li><strong>Broken References</strong>: <code>configuration.md</code>, <code>api-reference.md</code>, <code>decisions/README.md</code>, <code>CHANGELOG.md</code></li><li><strong>Outdated Technology Stack</strong>: References to old frameworks, libraries</li><li><strong>Missing Context</strong>: Some docs lack current implementation details</li></ul><h2 id="consolidation-recommendations" tabindex="-1">Consolidation Recommendations <a class="header-anchor" href="#consolidation-recommendations" aria-label="Permalink to &quot;Consolidation Recommendations&quot;">​</a></h2><h3 id="_1-create-master-architecture-document" tabindex="-1">1. Create Master Architecture Document <a class="header-anchor" href="#_1-create-master-architecture-document" aria-label="Permalink to &quot;1. Create Master Architecture Document&quot;">​</a></h3><p><strong>Action</strong>: ✅ <strong>COMPLETED</strong> - <code>PLATFORM_ARCHITECTURE_OVERVIEW.md</code></p><p><strong>Contents</strong>:</p><ul><li>Service architecture overview</li><li>Infrastructure components</li><li>Database architecture</li><li>API standards</li><li>Migration strategy</li><li>Monitoring and observability</li></ul><h3 id="_2-consolidate-developer-documentation" tabindex="-1">2. Consolidate Developer Documentation <a class="header-anchor" href="#_2-consolidate-developer-documentation" aria-label="Permalink to &quot;2. Consolidate Developer Documentation&quot;">​</a></h3><p><strong>Target</strong>: <code>lib-documentation.md</code> + <code>shared-packages.md</code> + parts of <code>apitest.md</code></p><p><strong>Proposed Structure</strong>:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>developer-guide/</span></span>
<span class="line"><span>├── getting-started.md</span></span>
<span class="line"><span>├── shared-libraries.md</span></span>
<span class="line"><span>├── api-development.md</span></span>
<span class="line"><span>├── testing-guidelines.md</span></span>
<span class="line"><span>└── deployment.md</span></span></code></pre></div><h3 id="_3-update-database-documentation" tabindex="-1">3. Update Database Documentation <a class="header-anchor" href="#_3-update-database-documentation" aria-label="Permalink to &quot;3. Update Database Documentation&quot;">​</a></h3><p><strong>Priority</strong>: High</p><p><strong>Required Updates</strong>:</p><ul><li>Replace Sequelize references with Kysely</li><li>Add current migration documentation</li><li>Include ClickHouse schema details</li><li>Document connection pooling strategies</li></ul><h3 id="_4-streamline-migration-documentation" tabindex="-1">4. Streamline Migration Documentation <a class="header-anchor" href="#_4-streamline-migration-documentation" aria-label="Permalink to &quot;4. Streamline Migration Documentation&quot;">​</a></h3><p><strong>Current</strong>: 17+ files in <code>data-migration-smile3-to-smile5/</code><strong>Recommendation</strong>: Keep detailed docs but create executive summary</p><h3 id="_5-remove-archive-obsolete-docs" tabindex="-1">5. Remove/Archive Obsolete Docs <a class="header-anchor" href="#_5-remove-archive-obsolete-docs" aria-label="Permalink to &quot;5. Remove/Archive Obsolete Docs&quot;">​</a></h3><p><strong>Immediate Actions</strong>:</p><ul><li>Delete <code>index.md</code> (broken links)</li><li>Archive old API documentation</li><li>Remove version control workflow (if outdated)</li></ul><h2 id="implementation-plan" tabindex="-1">Implementation Plan <a class="header-anchor" href="#implementation-plan" aria-label="Permalink to &quot;Implementation Plan&quot;">​</a></h2><h3 id="phase-1-immediate-week-1" tabindex="-1">Phase 1: Immediate (Week 1) <a class="header-anchor" href="#phase-1-immediate-week-1" aria-label="Permalink to &quot;Phase 1: Immediate (Week 1)&quot;">​</a></h3><ul><li>[x] Create master architecture overview</li><li>[ ] Audit and fix broken links in existing docs</li><li>[ ] Remove clearly obsolete files</li></ul><h3 id="phase-2-consolidation-week-2-3" tabindex="-1">Phase 2: Consolidation (Week 2-3) <a class="header-anchor" href="#phase-2-consolidation-week-2-3" aria-label="Permalink to &quot;Phase 2: Consolidation (Week 2-3)&quot;">​</a></h3><ul><li>[ ] Merge related documentation files</li><li>[ ] Update technology references (Sequelize → Kysely)</li><li>[ ] Create developer guide structure</li></ul><h3 id="phase-3-enhancement-week-4" tabindex="-1">Phase 3: Enhancement (Week 4) <a class="header-anchor" href="#phase-3-enhancement-week-4" aria-label="Permalink to &quot;Phase 3: Enhancement (Week 4)&quot;">​</a></h3><ul><li>[ ] Add missing documentation sections</li><li>[ ] Create visual diagrams for architecture</li><li>[ ] Implement documentation standards</li></ul><h3 id="phase-4-maintenance-ongoing" tabindex="-1">Phase 4: Maintenance (Ongoing) <a class="header-anchor" href="#phase-4-maintenance-ongoing" aria-label="Permalink to &quot;Phase 4: Maintenance (Ongoing)&quot;">​</a></h3><ul><li>[ ] Regular documentation reviews</li><li>[ ] Update docs with code changes</li><li>[ ] Maintain documentation quality</li></ul><h2 id="documentation-standards" tabindex="-1">Documentation Standards <a class="header-anchor" href="#documentation-standards" aria-label="Permalink to &quot;Documentation Standards&quot;">​</a></h2><h3 id="proposed-template-structure" tabindex="-1">Proposed Template Structure <a class="header-anchor" href="#proposed-template-structure" aria-label="Permalink to &quot;Proposed Template Structure&quot;">​</a></h3><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-light-font-weight": "bold",
		"--shiki-dark": "#79B8FF",
		"--shiki-dark-font-weight": "bold"
	})}"># [Feature/Service Name]</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-light-font-weight": "bold",
		"--shiki-dark": "#79B8FF",
		"--shiki-dark-font-weight": "bold"
	})}">## Overview</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">Brief description of purpose and scope</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-light-font-weight": "bold",
		"--shiki-dark": "#79B8FF",
		"--shiki-dark-font-weight": "bold"
	})}">## Architecture</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">Technical implementation details</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-light-font-weight": "bold",
		"--shiki-dark": "#79B8FF",
		"--shiki-dark-font-weight": "bold"
	})}">## API Reference</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">Endpoints and usage examples</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-light-font-weight": "bold",
		"--shiki-dark": "#79B8FF",
		"--shiki-dark-font-weight": "bold"
	})}">## Configuration</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">Environment variables and setup</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-light-font-weight": "bold",
		"--shiki-dark": "#79B8FF",
		"--shiki-dark-font-weight": "bold"
	})}">## Monitoring</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">Health checks and observability</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-light-font-weight": "bold",
		"--shiki-dark": "#79B8FF",
		"--shiki-dark-font-weight": "bold"
	})}">## Troubleshooting</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">Common issues and solutions</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-light-font-weight": "bold",
		"--shiki-dark": "#79B8FF",
		"--shiki-dark-font-weight": "bold"
	})}">## Changelog</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">Recent updates and changes</span></span></code></pre></div><h3 id="quality-guidelines" tabindex="-1">Quality Guidelines <a class="header-anchor" href="#quality-guidelines" aria-label="Permalink to &quot;Quality Guidelines&quot;">​</a></h3><ol><li><strong>Accuracy</strong>: Verify all technical details</li><li><strong>Completeness</strong>: Include setup, usage, and troubleshooting</li><li><strong>Consistency</strong>: Use standardized formatting</li><li><strong>Maintainability</strong>: Easy to update with code changes</li><li><strong>Accessibility</strong>: Clear language and examples</li></ol><h2 id="risk-assessment" tabindex="-1">Risk Assessment <a class="header-anchor" href="#risk-assessment" aria-label="Permalink to &quot;Risk Assessment&quot;">​</a></h2><h3 id="high-risk" tabindex="-1">High Risk <a class="header-anchor" href="#high-risk" aria-label="Permalink to &quot;High Risk&quot;">​</a></h3><ul><li><strong>Outdated database documentation</strong> could lead to implementation errors</li><li><strong>Missing monitoring docs</strong> could delay incident resolution</li><li><strong>Inconsistent API docs</strong> could cause integration issues</li></ul><h3 id="medium-risk" tabindex="-1">Medium Risk <a class="header-anchor" href="#medium-risk" aria-label="Permalink to &quot;Medium Risk&quot;">​</a></h3><ul><li><strong>Redundant documentation</strong> creates confusion</li><li><strong>Broken links</strong> reduce documentation usability</li><li><strong>Missing examples</strong> slow down development</li></ul><h3 id="low-risk" tabindex="-1">Low Risk <a class="header-anchor" href="#low-risk" aria-label="Permalink to &quot;Low Risk&quot;">​</a></h3><ul><li><strong>Minor formatting inconsistencies</strong> affect readability</li><li><strong>Missing visual diagrams</strong> reduce understanding</li></ul><h2 id="success-metrics" tabindex="-1">Success Metrics <a class="header-anchor" href="#success-metrics" aria-label="Permalink to &quot;Success Metrics&quot;">​</a></h2><h3 id="quantitative" tabindex="-1">Quantitative <a class="header-anchor" href="#quantitative" aria-label="Permalink to &quot;Quantitative&quot;">​</a></h3><ul><li><strong>Documentation coverage</strong>: Target 90% of services/features</li><li><strong>Broken link ratio</strong>: Target &lt;1% broken links</li><li><strong>Update frequency</strong>: Monthly reviews, updates as needed</li></ul><h3 id="qualitative" tabindex="-1">Qualitative <a class="header-anchor" href="#qualitative" aria-label="Permalink to &quot;Qualitative&quot;">​</a></h3><ul><li><strong>Developer satisfaction</strong>: Regular feedback surveys</li><li><strong>Onboarding efficiency</strong>: Time to understand architecture</li><li><strong>Incident resolution</strong>: Speed of troubleshooting</li></ul><h2 id="next-steps" tabindex="-1">Next Steps <a class="header-anchor" href="#next-steps" aria-label="Permalink to &quot;Next Steps&quot;">​</a></h2><ol><li><strong>Review this audit</strong> with platform team</li><li><strong>Prioritize consolidation</strong> based on team input</li><li><strong>Assign documentation owners</strong> for each service</li><li><strong>Implement documentation</strong> updates in phases</li><li><strong>Establish maintenance</strong> schedule and standards</li></ol><hr><p><strong>Audit Date</strong>: January 2025<br><strong>Auditor</strong>: Platform Architecture Team<br><strong>Next Review</strong>: April 2025</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive/documentation-audit-2025.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var documentation_audit_2025_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, documentation_audit_2025_default as default };
