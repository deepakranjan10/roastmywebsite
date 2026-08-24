import dns from 'node:dns/promises';
import net from 'node:net';

/**
 * SSRF defense for user-submitted URLs. Every audit starts here. The
 * strategy is allowlist-based, not blocklist-based: we only ever proceed
 * once we've resolved the hostname to concrete IPs and confirmed every one
 * of them is a public, routable address.
 */

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeUrlError';
  }
}

const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain', 'metadata.google.internal']);

// Cloud metadata endpoint — the classic SSRF target. Blocked outright even
// though 169.254.0.0/16 below would also catch it.
const METADATA_IP = '169.254.169.254';

function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
  const [a, b] = parts as [number, number, number, number];

  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 0) return true; // "this" network
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a === 192 && b === 0 && parts[2] === 0) return true; // 192.0.0.0/24 IETF
  if (a === 192 && b === 0 && parts[2] === 2) return true; // documentation
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a === 198 && b === 51 && parts[2] === 100) return true; // documentation
  if (a === 203 && b === 0 && parts[2] === 113) return true; // documentation
  if (a >= 224) return true; // multicast + reserved + broadcast

  return false;
}

function isPrivateOrReservedIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fe80:')) return true; // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local (fc00::/7)
  if (lower.startsWith('::ffff:')) {
    // IPv4-mapped IPv6 — unwrap and check the embedded IPv4 address.
    const mapped = lower.split(':').pop();
    if (mapped && net.isIPv4(mapped)) return isPrivateOrReservedIPv4(mapped);
  }
  return false;
}

function isDisallowedIp(ip: string): boolean {
  if (ip === METADATA_IP) return true;
  if (net.isIPv4(ip)) return isPrivateOrReservedIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateOrReservedIPv6(ip);
  return true; // unknown format — fail closed
}

export interface SafeUrlCheckResult {
  url: URL;
  hostname: string;
  resolvedIps: string[];
}

/**
 * Validates a user-submitted URL string and resolves its hostname, throwing
 * UnsafeUrlError for anything that isn't a plain public http/https target.
 * Call this again for every redirect hop — a safe initial host can still
 * redirect to an internal one.
 */
export async function assertSafeUrl(rawUrl: string): Promise<SafeUrlCheckResult> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError('That doesn’t look like a valid URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeUrlError('Only http:// and https:// URLs are allowed.');
  }

  if (url.username || url.password) {
    throw new UnsafeUrlError('URLs with embedded credentials are not allowed.');
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new UnsafeUrlError('That host is not allowed.');
  }

  if (hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname.endsWith('.localdomain')) {
    throw new UnsafeUrlError('That host is not allowed.');
  }

  // Reject bare IP literals that are already private/reserved without a DNS
  // round trip, then always resolve (even for public-looking IP literals)
  // so the logic path is uniform.
  if (net.isIP(hostname)) {
    if (isDisallowedIp(hostname)) {
      throw new UnsafeUrlError('That host resolves to a non-public address.');
    }
    return { url, hostname, resolvedIps: [hostname] };
  }

  let addresses: string[];
  try {
    const [v4, v6] = await Promise.allSettled([
      dns.resolve4(hostname),
      dns.resolve6(hostname),
    ]);
    addresses = [
      ...(v4.status === 'fulfilled' ? v4.value : []),
      ...(v6.status === 'fulfilled' ? v6.value : []),
    ];
  } catch {
    throw new UnsafeUrlError('That domain could not be resolved.');
  }

  if (addresses.length === 0) {
    throw new UnsafeUrlError('That domain could not be resolved.');
  }

  if (addresses.some(isDisallowedIp)) {
    throw new UnsafeUrlError('That host resolves to a non-public address.');
  }

  return { url, hostname, resolvedIps: addresses };
}

export function normalizeUrlForCache(url: URL): string {
  return `${url.protocol}//${url.hostname.toLowerCase()}${url.pathname === '/' ? '' : url.pathname}`.replace(/\/+$/, '') || `${url.protocol}//${url.hostname.toLowerCase()}`;
}
