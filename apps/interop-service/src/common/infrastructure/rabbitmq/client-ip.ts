// Client IP for audit rows. Self-contained on purpose: copied verbatim to
// apps/interop-service/src/common/infrastructure/rabbitmq/client-ip.ts and
// apps/wms-encore/shared/audit/client-ip.ts — KEEP IN SYNC.
//
// Requests reach the services as client -> Cloudflare -> cluster ingress ->
// nginx proxy -> app, each hop appending to X-Forwarded-For. The rightmost
// entry is therefore a cluster address (e.g. 10.42.0.0), not the user.
// Walk from the right and skip hops that are our own proxies: private /
// cluster ranges and Cloudflare's published edge ranges. The first other
// address is the client. Entries left of it are client-supplied and never
// read, so a forged X-Forwarded-For cannot choose the recorded IP.

// https://www.cloudflare.com/ips-v4 and /ips-v6 (fetched 2026-09-30).
const CLOUDFLARE_RANGES = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
];

const PRIVATE_RANGES = [
  "10.0.0.0/8",
  "172.16.0.0/12",
  "192.168.0.0/16",
  "127.0.0.0/8",
  "100.64.0.0/10", // carrier-grade NAT, also used by some CNIs
  "169.254.0.0/16",
  "::1/128",
  "fc00::/7",
  "fe80::/10",
];

type Range = { v6: boolean; base: bigint; bits: number };

function parseV4(ip: string): bigint | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0n;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part) || Number(part) > 255) return null;
    value = (value << 8n) | BigInt(part);
  }
  return value;
}

function parseV6(ip: string): bigint | null {
  if (!ip.includes(":")) return null;
  let text = ip;
  // Trailing embedded IPv4 (e.g. ::ffff:1.2.3.4) becomes two hextets.
  const v4Tail = /(\d+\.\d+\.\d+\.\d+)$/.exec(text);
  if (v4Tail) {
    const v4 = parseV4(v4Tail[1]);
    if (v4 === null) return null;
    text =
      text.slice(0, -v4Tail[1].length) +
      `${(v4 >> 16n).toString(16)}:${(v4 & 0xffffn).toString(16)}`;
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  let value = 0n;
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/i.test(group)) return null;
    value = (value << 16n) | BigInt(parseInt(group, 16));
  }
  return value;
}

const V4_MAPPED_PREFIX = 0xffffn << 32n;

function toAddress(ip: string): { v6: boolean; value: bigint } | null {
  const v4 = parseV4(ip);
  if (v4 !== null) return { v6: false, value: v4 };
  const v6 = parseV6(ip);
  if (v6 === null) return null;
  // ::ffff:a.b.c.d is an IPv4 client seen through a dual-stack socket.
  if (v6 >> 32n === 0xffffn) return { v6: false, value: v6 - V4_MAPPED_PREFIX };
  return { v6: true, value: v6 };
}

function toRange(cidr: string): Range {
  const [ip, bits] = cidr.split("/");
  const address = toAddress(ip)!;
  return { v6: address.v6, base: address.value, bits: Number(bits) };
}

const TRUSTED_PROXY_RANGES = [...PRIVATE_RANGES, ...CLOUDFLARE_RANGES].map(toRange);

function inRange(address: { v6: boolean; value: bigint }, range: Range): boolean {
  if (address.v6 !== range.v6) return false;
  const width = address.v6 ? 128n : 32n;
  const shift = width - BigInt(range.bits);
  return address.value >> shift === range.base >> shift;
}

/** Strips a port and IPv6 brackets: "1.2.3.4:80" / "[::1]:80" -> address. */
function stripPort(hop: string): string {
  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(hop);
  if (bracketed) return bracketed[1];
  const v4WithPort = /^(\d+\.\d+\.\d+\.\d+):\d+$/.exec(hop);
  return v4WithPort ? v4WithPort[1] : hop;
}

export function isTrustedProxy(ip: string): boolean {
  const address = toAddress(stripPort(ip));
  return !!address && TRUSTED_PROXY_RANGES.some((range) => inRange(address, range));
}

/**
 * Rightmost X-Forwarded-For hop that is not one of our proxies. Falls back to
 * the rightmost hop when every hop is trusted (in-cluster calls, local dev).
 * Trimmed, max 255 chars.
 */
export function clientIpFromForwardedFor(
  header: string | string[] | undefined | null,
): string | null {
  const hops = (Array.isArray(header) ? header.join(",") : (header ?? ""))
    .split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);
  if (!hops.length) return null;
  const client =
    [...hops].reverse().find((hop) => !isTrustedProxy(hop)) ?? hops[hops.length - 1];
  return stripPort(client).slice(0, 255);
}
