/**
 * Best-effort screenshot URL for the result page hero. Pluggable via
 * SCREENSHOT_SERVICE_URL (any service that accepts the target URL
 * URL-encoded and appended, and returns an image). Without it configured,
 * callers get null and the UI renders a stylized placeholder instead of
 * pretending a screenshot exists.
 */
export function getScreenshotUrl(targetUrl: string): string | null {
  const base = process.env.SCREENSHOT_SERVICE_URL;
  if (!base) return null;
  return `${base}${encodeURIComponent(targetUrl)}`;
}
