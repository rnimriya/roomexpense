import { headers } from "next/headers";

const rateLimitMap = new Map<string, number[]>();

/**
 * Checks if the caller has exceeded the action rate limit.
 * Defaults to 10 requests per 1 minute window.
 */
export async function enforceRateLimit(limit = 10, windowMs = 60000) {
  // Read request headers
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "local_ip";

  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Filter timestamps outside the active window
  const activeTimestamps = timestamps.filter(t => now - t < windowMs);

  if (activeTimestamps.length >= limit) {
    throw new Error("Too many requests. Please wait a moment before trying again.");
  }

  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);
}
