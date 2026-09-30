import 'expo-sqlite/localStorage/install';

import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'sibb.text-size';
const SCALES = [1, 1.15, 1.3, 1.5, 1.75, 2] as const;

type TextSizePreference = {
  scale: number;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
  ready: boolean;
  saveFailed: boolean;
};

const Context = createContext<TextSizePreference | null>(null);

export function TextSizePreferenceProvider({ children }: PropsWithChildren) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    // Defer browser storage until after hydration; the same API is local on native.
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const saved = globalThis.localStorage.getItem(STORAGE_KEY);
        const next = saved === null ? 0 : Number(saved);
        if (Number.isInteger(next) && next >= 0 && next < SCALES.length) setIndex(next);
      } catch {
        setSaveFailed(true);
      }
      setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        globalThis.localStorage.setItem(STORAGE_KEY, String(index));
        setSaveFailed(false);
      } catch {
        setSaveFailed(true);
      }
    });
    return () => { cancelled = true; };
  }, [index, ready]);

  const value = useMemo(() => ({
    scale: SCALES[index],
    increase: () => setIndex((current) => Math.min(current + 1, SCALES.length - 1)),
    decrease: () => setIndex((current) => Math.max(current - 1, 0)),
    reset: () => setIndex(0),
    canIncrease: index < SCALES.length - 1,
    canDecrease: index > 0,
    ready,
    saveFailed,
  }), [index, ready, saveFailed]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useTextSizePreference() {
  const value = useContext(Context);
  if (!value) throw new Error('TextSizePreferenceProvider is required');
  return value;
}
