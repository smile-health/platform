import { describe, it, expect } from "vitest";
import { mask, maskSensitiveFields } from "./audit-log-mask";
import { buildAuditMessage } from "./audit-log-message";
import {
  resolveAuditRoute,
  extractEntityId,
  clientIpFromForwardedFor,
} from "./audit-routes";

describe("audit mask", () => {
  it("masks leaf like packages/lib/masking", () => {
    expect(mask("ab")).toBe("ab");
    expect(mask("12345678")).toBe("12****78");
  });

  it("masks sensitive keys recursively and leaves others", () => {
    const out = maskSensitiveFields({
      name: "Budi",
      email: "budi@example.com",
      contact: { mobile_phone: "081234567890", note: "hi" },
      address: { street: "Jl Merdeka", city: "Jakarta" },
      list: [{ password: "secret123" }],
      at: new Date("2026-01-01T00:00:00.000Z"),
    });
    expect(out.name).toBe("Budi");
    expect(out.email).not.toContain("budi@example.com");
    expect(out.contact.mobile_phone).toContain("*");
    expect(out.contact.note).toBe("hi");
    expect(out.address.street).toContain("*");
    expect(out.address.city).toContain("*");
    expect(out.list[0].password).toBe("[REDACTED]");
    expect(out.at).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("audit mask credentials", () => {
  it("redacts credentials fully and matches segments", () => {
    const out = maskSensitiveFields({
      password: "12345678",
      pin_code: "1234",
      user_dob: "2000-01-01",
      footprint: "abc",
      access_token: "t",
    });
    expect(out.password).toBe("[REDACTED]");
    expect(out.pin_code).toBe("[REDACTED]");
    expect(out.access_token).toBe("[REDACTED]");
    expect(out.user_dob).toContain("*");
    expect(out.footprint).toBe("abc");
  });

  it("truncates beyond max depth and marks binary", () => {
    let deep: Record<string, unknown> = { leaf: 1 };
    for (let i = 0; i < 15; i++) deep = { n: deep };
    expect(JSON.stringify(maskSensitiveFields(deep))).toContain("[TRUNCATED]");
    expect(maskSensitiveFields({ b: Buffer.from("x") }).b).toBe("[BINARY]");
  });
});

describe("audit routes", () => {
  it("derives action from method", () => {
    expect(resolveAuditRoute("POST", "/api/v1/waste-bag-qrcode")?.action).toBe("create");
    expect(resolveAuditRoute("PUT", "/api/v1/waste-bag-qrcode/5")?.action).toBe("update");
    expect(resolveAuditRoute("DELETE", "/api/v1/waste-bag-qrcode/5")?.action).toBe("delete");
    expect(resolveAuditRoute("PUT", "/api/v1/global-settings/2")?.route.module).toBe("wms_global_settings");
  });

  it("ignores reads and non-whitelisted paths", () => {
    expect(resolveAuditRoute("GET", "/api/v1/waste-bag-qrcode/5")).toBeNull();
    expect(resolveAuditRoute("POST", "/api/v1/mobile/enter-weight")).toBeNull();
    expect(resolveAuditRoute("PATCH", "/api/v1/waste/cold-store")).toBeNull();
  });

  it("matches waste create only, and manual scale create/activate", () => {
    expect(resolveAuditRoute("POST", "/api/v1/waste")?.route.module).toBe("wms_waste_bag");
    expect(resolveAuditRoute("PUT", "/api/v1/waste")).toBeNull();
    expect(resolveAuditRoute("POST", "/api/v1/manual-scale")?.action).toBe("create");
    expect(resolveAuditRoute("PATCH", "/api/v1/manual-scale/activate")?.action).toBe("activate");
    expect(resolveAuditRoute("PATCH", "/api/v1/manual-scale")).toBeNull();
  });

  it("does not let /asset match /asset-model or /asset-dongle", () => {
    expect(resolveAuditRoute("POST", "/api/v1/asset-model")?.route.module).toBe("wms_asset_model");
    expect(resolveAuditRoute("DELETE", "/api/v1/asset-dongle/abc")?.route.module).toBe("wms_asset_dongle");
    expect(resolveAuditRoute("POST", "/api/v1/asset")?.route.module).toBe("wms_asset");
  });

  it("extracts entity id", () => {
    expect(extractEntityId({ id: "7" }, null)).toBe(7);
    expect(extractEntityId({}, { status: "success", data: { id: 9 } })).toBe(9);
    expect(extractEntityId(undefined, { id: 3 })).toBe(3);
    expect(extractEntityId({}, { data: {} })).toBeNull();
  });

  it("takes right-most forwarded hop", () => {
    expect(clientIpFromForwardedFor("1.1.1.1, 2.2.2.2")).toBe("2.2.2.2");
    expect(clientIpFromForwardedFor(undefined)).toBeNull();
  });
});

describe("audit message wire format", () => {
  it("matches lib shape and masks metadata", () => {
    const msg = buildAuditMessage({
      actor_id: 1,
      action: "create",
      module: "wms_waste_bag",
      metadata: { before: null, after: { email: "a@b.com", qty: 2 } },
    });
    expect(msg.headers).toEqual({});
    expect(msg.payload.service).toBe("wms");
    expect(msg.payload.program_id).toBeNull();
    expect(msg.payload.metadata?.before).toBeNull();
    expect((msg.payload.metadata?.after as any).email).toContain("*");
    expect((msg.payload.metadata?.after as any).qty).toBe(2);
  });
});
