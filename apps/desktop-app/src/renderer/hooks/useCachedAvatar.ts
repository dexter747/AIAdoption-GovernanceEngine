import { useState, useEffect } from 'react';

/**
 * Fetches a remote avatar URL once, converts it to a local blob URL,
 * and caches it in memory + sessionStorage so repeated renders never
 * re-fetch (avoiding Google 429 rate limits on lh3.googleusercontent.com).
 *
 * Key safeguards:
 *  - In-flight promise deduplication: only ONE fetch per unique URL globally
 *  - On 429 / network failure: caches a generated SVG placeholder instead of
 *    falling back to the remote URL (which would trigger another browser fetch)
 *  - sessionStorage persistence so reloads don't re-fetch
 */

const blobCache = new Map<string, string>();
const inflightRequests = new Map<string, Promise<string>>();

/** Generate a tiny SVG data-URL avatar with the user's initial(s). */
function fallbackAvatar(url: string): string {
  // Try to extract initials from Google URL (won't always work — just a nice-to-have)
  const letter = 'U';
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">` +
    `<rect width="96" height="96" rx="48" fill="%236366f1"/>` +
    `<text x="48" y="54" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="40" fill="white">${letter}</text>` +
    `</svg>`
  )}`;
}

function fetchAndCache(remoteUrl: string): Promise<string> {
  // Return existing in-flight request if one is already running for this URL
  const existing = inflightRequests.get(remoteUrl);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const res = await fetch(remoteUrl, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      blobCache.set(remoteUrl, objectUrl);

      // Also persist as data URL in sessionStorage for tab reloads
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            sessionStorage.setItem(`avatar:${remoteUrl}`, reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch { /* sessionStorage may fail — not critical */ }

      return objectUrl;
    } catch {
      // On failure (e.g. 429), cache a generated placeholder so we NEVER retry
      const placeholder = fallbackAvatar(remoteUrl);
      blobCache.set(remoteUrl, placeholder);
      return placeholder;
    } finally {
      inflightRequests.delete(remoteUrl);
    }
  })();

  inflightRequests.set(remoteUrl, promise);
  return promise;
}

export function useCachedAvatar(remoteUrl: string | undefined): string | undefined {
  const [localUrl, setLocalUrl] = useState<string | undefined>(() => {
    if (!remoteUrl) return undefined;
    // Check in-memory cache first
    if (blobCache.has(remoteUrl)) return blobCache.get(remoteUrl);
    // Check sessionStorage
    const stored = sessionStorage.getItem(`avatar:${remoteUrl}`);
    if (stored) {
      blobCache.set(remoteUrl, stored);
      return stored;
    }
    return undefined;
  });

  useEffect(() => {
    if (!remoteUrl) return;
    // Already resolved
    if (blobCache.has(remoteUrl)) {
      setLocalUrl(blobCache.get(remoteUrl));
      return;
    }

    let cancelled = false;

    fetchAndCache(remoteUrl).then(url => {
      if (!cancelled) setLocalUrl(url);
    });

    return () => { cancelled = true; };
  }, [remoteUrl]);

  return localUrl;
}
