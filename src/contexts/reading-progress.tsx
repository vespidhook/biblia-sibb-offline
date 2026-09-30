import 'expo-sqlite/localStorage/install';

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { parseProgress, ReadingProgress, summarizeProgress, updateChapter } from '@/utils/reading-progress';

const STORAGE_KEY = 'sibb.reading-progress.v1';
type ProgressContextValue = {
  progress: ReadingProgress;
  summary: ReturnType<typeof summarizeProgress>;
  ready: boolean;
  error: string | null;
  reload: () => void;
  setRead: (bookId: string, chapter: number, read: boolean) => void;
};
const Context = createContext<ProgressContextValue | null>(null);

export function ReadingProgressProvider({ children }: PropsWithChildren) {
  const [progress, setProgress] = useState<ReadingProgress>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    try {
      setProgress(parseProgress(globalThis.localStorage.getItem(STORAGE_KEY)));
      setReady(true);
      setError(null);
    } catch {
      setReady(false);
      setError('Não foi possível carregar seu progresso. Tente novamente.');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => { if (!cancelled) reload(); });
    return () => { cancelled = true; };
  }, [reload]);

  const setRead = useCallback((bookId: string, chapter: number, read: boolean) => {
    if (!ready) return;
    try {
      // Read the latest saved state so rapid taps cannot overwrite another chapter.
      const saved = parseProgress(globalThis.localStorage.getItem(STORAGE_KEY));
      const next = updateChapter(saved, bookId, chapter, read);
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setProgress(next);
      setError(null);
    } catch {
      // Only confirm the change in the UI after persistence succeeds.
      setError('Não foi possível salvar a marcação. Tente novamente.');
    }
  }, [ready]);

  const summary = useMemo(() => summarizeProgress(progress), [progress]);
  const value = useMemo(() => ({ progress, summary, ready, error, reload, setRead }), [progress, summary, ready, error, reload, setRead]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useReadingProgress() {
  const value = useContext(Context);
  if (!value) throw new Error('ReadingProgressProvider is required');
  return value;
}
