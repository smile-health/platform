import { describe, expect, test } from "bun:test";
import { maskSensitiveFields } from "../audit-log/mask";

describe("maskSensitiveFields", () => {
  test("masks a known sensitive top-level field", () => {
    const result = maskSensitiveFields({ name: "Budi", password: "secret123" });
    expect(result.name).toBe("Budi");
    expect(result.password).toBe("[REDACTED]");
  });

  test("is case-insensitive on the key name", () => {
    const result = maskSensitiveFields({ Email: "a@b.com", PhoneNumber: "0812" });
    expect(result.Email).not.toBe("a@b.com");
    expect(result.PhoneNumber).not.toBe("0812");
  });

  test("masks sensitive fields nested inside an object", () => {
    const result = maskSensitiveFields({
      patient: { nik: "1234567890123456", name: "Budi" },
    });
    expect(result.patient.nik).toContain("*");
    expect(result.patient.name).toBe("Budi");
  });

  test("masks every leaf under a sensitive container key", () => {
    const result = maskSensitiveFields({
      address: { street: "Jl. Merdeka", city: "Jakarta" },
    });
    expect(result.address.street).not.toBe("Jl. Merdeka");
    expect(result.address.city).not.toBe("Jakarta");
  });

  test("masks sensitive fields inside array items", () => {
    const result = maskSensitiveFields({
      contacts: [
        { email: "a@b.com", label: "primary" },
        { email: "c@d.com", label: "secondary" },
      ],
    });
    expect(result.contacts[0].email).not.toBe("a@b.com")
    expect(result.contacts[1].email).not.toBe("c@d.com")
    expect(result.contacts[0].label).toBe("primary");
  });

  test("keeps a null sensitive value as null instead of masking it", () => {
    const result = maskSensitiveFields({ password: null });
    expect(result).toEqual({ password: null });
  });

  test("leaves non-sensitive fields untouched", () => {
    const input = { id: 1, module: "material", action: "create" };
    expect(maskSensitiveFields(input)).toEqual(input);
  });

  test("passes through null and undefined", () => {
    expect(maskSensitiveFields(null)).toBeNull();
    expect(maskSensitiveFields(undefined)).toBeUndefined();
  });

  test("masks common PII key variants used across modules", () => {
    const input = {
      no_ktp: "1234567890",
      npwp: "12.345.678.9-012.000",
      mobile_phone: "081234567890",
      alamat: "Jl. Merdeka No. 10",
      date_of_birth: "2000-01-01",
      bank_account: "1234567890",
    };
    const result = maskSensitiveFields(input);
    for (const [key, value] of Object.entries(input)) {
      expect(result[key as keyof typeof input]).not.toBe(value);
    }
  });

  test("fully redacts credential keys, even short values", () => {
    const result = maskSensitiveFields({
      password: "12345678",
      access_token: "abc",
      refreshToken: "abc",
      otp: "123456",
      "x-api-key": "k",
      authorization: "Bearer x",
      keycloak_uuid: "11111111-2222-3333-4444-555555555555",
      fcm_token: "fcm",
      private_key: "pk",
      credentials: { user: "a", pass: "b" },
    });
    for (const v of Object.values(result)) expect(v).toBe("[REDACTED]");
  });

  test("redacts arrays under a credential key entirely", () => {
    const result = maskSensitiveFields({ tokens: ["a", "b"] });
    expect(result.tokens).toBe("[REDACTED]");
  });

  test("matches pin as a whole segment (pin_code, pinCode) not footprint", () => {
    const result = maskSensitiveFields({
      pin: "1234",
      pin_code: "1234",
      pinCode: "1234",
      footprint: "abc",
      otp_code: "123456",
      hotpot: "soup",
    });
    expect(result.pin).toBe("[REDACTED]");
    expect(result.pin_code).toBe("[REDACTED]");
    expect(result.pinCode).toBe("[REDACTED]");
    expect(result.otp_code).toBe("[REDACTED]");
    expect(result.footprint).toBe("abc");
    expect(result.hotpot).toBe("soup");
  });

  test("treats underscore as a separator for dob", () => {
    const result = maskSensitiveFields({
      user_dob: "2000-01-01",
      dob: "2000-01-01",
      birth_date: "2000-01-01",
      birthdate: "2000-01-01",
      adobe: "x",
    });
    expect(result.user_dob).toContain("*");
    expect(result.dob).toContain("*");
    expect(result.birth_date).toContain("*");
    expect(result.birthdate).toContain("*");
    expect(result.adobe).toBe("x");
  });

  test("replaces values beyond the depth cap with [TRUNCATED]", () => {
    let deep: Record<string, unknown> = { leaf: "secret-ish" };
    for (let i = 0; i < 15; i++) deep = { n: deep };
    let cur: any = maskSensitiveFields(deep);
    let depth = 0;
    while (typeof cur === "object" && cur !== null) {
      cur = cur.n;
      depth++;
    }
    expect(cur).toBe("[TRUNCATED]");
    expect(depth).toBeLessThan(15);
  });

  test("serialises Date, drops binary, honours toJSON", () => {
    class Money {
      constructor(private amount: number, private email: string) {}
      toJSON() {
        return { amount: this.amount, email: this.email };
      }
    }
    const result = maskSensitiveFields({
      at: new Date("2026-01-01T00:00:00.000Z"),
      buf: Buffer.from("abc"),
      bytes: new Uint8Array([1, 2]),
      money: new Money(5, "a@b.com"),
    });
    expect(result.at).toBe("2026-01-01T00:00:00.000Z");
    expect(result.buf).toBe("[BINARY]");
    expect(result.bytes).toBe("[BINARY]");
    expect((result.money as any).amount).toBe(5);
    expect((result.money as any).email).not.toBe("a@b.com");
  });
});
