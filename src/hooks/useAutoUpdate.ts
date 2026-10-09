import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

/* Checks every 5 minutes whether a newer web build was deployed.
   The page HTML references the JS bundle by content hash
   (/_expo/static/js/web/index-<hash>.js), so comparing the hash in the
   freshly fetched index.html with the running bundle's hash tells us
   if an update is available. Works in the standalone site and in the
   kids-routine widget iframe alike. */
const CHECK_INTERVAL = 5 * 60 * 1000;

function runningBundleHash(): string | null {
  if (typeof document === 'undefined') return null;
  const s = document.querySelector('script[src*="/_expo/static/js/web/index-"]');
  const src = s ? s.getAttribute('src') : null;
  const m = src ? src.match(/index-([a-f0-9]+)\.js/) : null;
  return m ? m[1] : null;
}

export const useAutoUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const mine = runningBundleHash();
    if (!mine) return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) return;
        const html = await res.text();
        const m = html.match(/index-([a-f0-9]+)\.js/);
        if (m && m[1] !== mine && !cancelled) {
          setUpdateAvailable(true);
        }
      } catch (e) {
        /* offline or transient error — try again on the next interval */
      }
    };
    const id = setInterval(check, CHECK_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  return { updateAvailable, applyUpdate };
};
