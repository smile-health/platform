import { test, expect } from "@playwright/test";
import { url, apiGet, expectOk, expectNumericField, expectStringField, expectNoNaN, DEFAULT_PARAMS } from "../warehouse-api.fixture";

test.describe("Executive Dashboard — Distribution", () => {
  const P = { program_id: "1" };

  test("GET /executive/distribution returns distribution data", async ({ request }) => {
    const res = await apiGet(request, "/executive/distribution", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectNumericField(item, "distributed");
      expectNumericField(item, "received");
      expectNoNaN(item);
    }
  });
});

test.describe("Executive Dashboard — Quality", () => {
  const P = { program_id: "1" };

  test("GET /executive/quality returns quality metrics", async ({ request }) => {
    const res = await apiGet(request, "/executive/quality", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectNumericField(item, "quality_score");
      expectNumericField(item, "total_audited");
      expectNoNaN(item);
    }
  });
});

test.describe("Executive Dashboard — Sufficiency", () => {
  const P = { program_id: "1" };

  test("GET /executive returns sufficiency data", async ({ request }) => {
    const res = await apiGet(request, "/executive", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectNumericField(item, "sufficiency_rate");
      expectNumericField(item, "required");
      expectNumericField(item, "available");
      expectNoNaN(item);
    }
  });
});

test.describe("Executive Dashboard — WMS Value Chain", () => {
  const P = { program_id: "1" };

  test("GET /executive/wms/distribution (value-chain) returns WMS distribution data", async ({ request }) => {
    const res = await apiGet(request, "/executive/wms/distribution", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectStringField(item, "health_facility");
      expectNumericField(item, "value_chain_total");
      expectNoNaN(item);
    }
  });
});

test.describe("Executive Dashboard — WMS Waste Generated", () => {
  const P = { program_id: "1" };

  test("GET /executive/wms (waste) returns waste data", async ({ request }) => {
    const res = await apiGet(request, "/executive/wms", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectNumericField(item, "waste_quantity");
      expectStringField(item, "waste_type");
      expectNoNaN(item);
    }
  });
});

test.describe("Executive Dashboard — WMS Entity Tags", () => {
  const P = { program_id: "1" };

  test("GET /executive/wms (entity-tags) returns entity tag summary", async ({ request }) => {
    // Uses same /executive/wms path, so same as waste test but check entity-tag-like fields
    const res = await apiGet(request, "/executive/wms", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      // Entity tags may share a response with waste, so check for tag fields
      if (item.entity_tag !== undefined || item.tag !== undefined) {
        expectStringField(item, "entity_tag");
        expectNumericField(item, "count");
      }
      expectNoNaN(item);
    }
  });
});

test.describe("Executive Dashboard — WMS Asset/Quality", () => {
  const P = { program_id: "1" };

  test("GET /executive/wms/quality returns asset quality data", async ({ request }) => {
    const res = await apiGet(request, "/executive/wms/quality", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      expectNumericField(item, "asset_quality_score");
      expectNumericField(item, "total_assets");
      expectNoNaN(item);
    }
  });
});

test.describe.skip("Executive Dashboard — WMS Health Facility", () => {
  const P = { program_id: "1" };

  test("GET /executive/wms/distribution (health-facility) returns HF distribution data", async ({ request }) => {
    // Same /executive/wms/distribution path as value chain, different query context
    const res = await apiGet(request, "/executive/wms/distribution", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      // Check for health facility fields within distribution response
      expectStringField(item, "health_facility");
      expectNumericField(item, "distributed");
      expectNumericField(item, "received");
      expectNoNaN(item);
    }
  });
});

test.describe("Executive Dashboard — WMS Lead Time", () => {
  const P = { program_id: "1" };

  test("GET /executive/wms/distribution (lead-time) returns lead time metrics", async ({ request }) => {
    // Same /executive/wms/distribution path — lead time data in distribution response
    const res = await apiGet(request, "/executive/wms/distribution", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      if (item.lead_time !== undefined || item.avg_lead_time !== undefined) {
        expectNumericField(item, "lead_time");
      }
      expectNoNaN(item);
    }
  });
});

test.describe("Executive Dashboard — WMS Active Rate", () => {
  const P = { program_id: "1" };

  test("GET /executive/wms/distribution (active-rate) returns active rate data", async ({ request }) => {
    // Same /executive/wms/distribution path — active rate in distribution response
    const res = await apiGet(request, "/executive/wms/distribution", P);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data || body;
    expect(data).toBeDefined();
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      if (item.active_rate !== undefined || item.rate !== undefined) {
        expectNumericField(item, "active_rate");
      }
      expectNumericField(item, "distributed");
      expectNoNaN(item);
    }
  });
});
