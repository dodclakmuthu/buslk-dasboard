import { useEffect, useRef } from 'react';

type UsePollingOptions = {
  enabled: boolean;
  intervalMs: number;
  leading?: boolean;
};

/**
 * Minimal polling hook.
 * - Skips overlapping runs (in-flight guard)
 * - Clears interval on disable/unmount
 */
export function usePolling(
  callback: () => void | Promise<void>,
  { enabled, intervalMs, leading = false }: UsePollingOptions,
) {
  const savedCallback = useRef(callback);
  const inFlightRef = useRef(false);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) return;

    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      try {
        await savedCallback.current();
      } finally {
        inFlightRef.current = false;
      }
    };

    if (leading) {
      void tick();
    }

    const id = window.setInterval(() => {
      void tick();
    }, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled, intervalMs, leading]);
}
