import { useCallback, useEffect, useRef } from 'react';

/**
 * Schedule a commit after `delayMs`, or run immediately via `flush`.
 * Cancels pending timers on unmount and when `cancel` is called.
 * `onDebouncedFire` runs only when the timer elapses (not on `flush`), e.g. to skip one URL→form sync.
 */
export function useDebouncedCommit(
  commit: () => void,
  delayMs: number,
  onDebouncedFire?: () => void
): { schedule: () => void; flush: () => void; cancel: () => void } {
  const commitRef = useRef(commit);
  const onFireRef = useRef(onDebouncedFire);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    commitRef.current = commit;
    onFireRef.current = onDebouncedFire;
  }, [commit, onDebouncedFire]);

  const cancel = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const flush = useCallback(() => {
    cancel();
    commitRef.current();
  }, [cancel]);

  const schedule = useCallback(() => {
    cancel();
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined;
      onFireRef.current?.();
      commitRef.current();
    }, delayMs);
  }, [cancel, delayMs]);

  useEffect(() => () => cancel(), [cancel]);

  return { schedule, flush, cancel };
}
