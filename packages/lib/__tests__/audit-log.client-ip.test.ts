import { describe, expect, test } from "bun:test";
import { clientIpFromForwardedFor, isTrustedProxy } from "../audit-log/client-ip";

describe("clientIpFromForwardedFor", () => {
  test("skips the cluster and Cloudflare hops to reach the client", () => {
    // client, Cloudflare edge, k3s CNI gateway
    expect(clientIpFromForwardedFor("36.72.10.5, 162.158.1.1, 10.42.0.0")).toBe("36.72.10.5");
    // cloudflared tunnel inside the cluster: only private hops after the client
    expect(clientIpFromForwardedFor("36.72.10.5, 10.42.1.7, 10.42.0.0")).toBe("36.72.10.5");
  });

  test("ignores forged entries left of the real client", () => {
    expect(clientIpFromForwardedFor("1.2.3.4, 36.72.10.5, 172.64.0.9, 10.42.0.0")).toBe(
      "36.72.10.5"
    );
    // A forged private hop cannot hide the real client either.
    expect(clientIpFromForwardedFor("10.0.0.1, 36.72.10.5, 10.42.0.0")).toBe("36.72.10.5");
  });

  test("handles IPv6, mapped IPv4 and ports", () => {
    expect(clientIpFromForwardedFor("2001:db8::1, 2606:4700::1, 10.42.0.0")).toBe("2001:db8::1");
    expect(clientIpFromForwardedFor("[2001:db8::2]:443, ::ffff:10.42.0.5")).toBe("2001:db8::2");
    expect(clientIpFromForwardedFor("36.72.10.5:51234, 10.42.0.0")).toBe("36.72.10.5");
  });

  test("falls back to the rightmost hop when every hop is internal", () => {
    expect(clientIpFromForwardedFor("10.42.3.3, 10.42.0.0")).toBe("10.42.0.0");
    expect(clientIpFromForwardedFor("127.0.0.1")).toBe("127.0.0.1");
  });

  test("keeps non-IP values (rightmost untrusted) and handles empty", () => {
    expect(clientIpFromForwardedFor("unknown, 10.42.0.0")).toBe("unknown");
    expect(clientIpFromForwardedFor(undefined)).toBeNull();
    expect(clientIpFromForwardedFor(["36.72.10.5", "10.42.0.0"])).toBe("36.72.10.5");
  });
});

describe("isTrustedProxy", () => {
  test("matches range boundaries exactly", () => {
    expect(isTrustedProxy("172.16.0.0")).toBe(true);
    expect(isTrustedProxy("172.31.255.255")).toBe(true);
    expect(isTrustedProxy("172.32.0.0")).toBe(false);
    expect(isTrustedProxy("104.16.0.1")).toBe(true); // Cloudflare
    expect(isTrustedProxy("8.8.8.8")).toBe(false);
    expect(isTrustedProxy("2a06:98c7::1")).toBe(true); // Cloudflare /29
    expect(isTrustedProxy("2a06:98d0::1")).toBe(false);
    expect(isTrustedProxy("999.1.1.1")).toBe(false);
  });
});

describe("client-ip copies", () => {
  test("interop and wms copies match this file", async () => {
    const read = (path: string) => Bun.file(new URL(path, import.meta.url)).text();
    const source = await read("../audit-log/client-ip.ts");
    expect(await read("../../../apps/interop-service/src/common/infrastructure/rabbitmq/client-ip.ts")).toBe(source);
    expect(await read("../../../apps/wms-encore/shared/audit/client-ip.ts")).toBe(source);
  });
});
