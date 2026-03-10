import { useState, useEffect } from 'react';

/**
 * Fetches a remote avatar URL once, converts it to a local blob URL,
 * and caches it in memory + sessionStorage so repeated renders never
 * re-fetch (avoiding Google 429 rate limits on lh3.googleusercontent.com).
 */

const blobCache = new Map<string, string>();

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

    (async () => {
      try {
        const res = await fetch(remoteUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
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
        setLocalUrl(objectUrl);
      } catch {
        // On failure (e.g. already 429), fall back to original URL
        if (!cancelled) setLocalUrl(remoteUrl);
      }
    })();

    return () => { cancelled = true; };
  }, [remoteUrl]);

  return localUrl;
}
