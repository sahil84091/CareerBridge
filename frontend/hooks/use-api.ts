"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiResult, DataSource } from "@/lib/api";

interface UseApiState<T> {
  data: T | null;
  source: DataSource | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  setData: (updater: (prev: T | null) => T | null) => void;
}

/**
 * Minimal client data hook: loading / error / data / source + reload.
 * API errors are surfaced to the page so stale or demo values are never
 * presented as persisted user data.
 */
export function useApi<T>(fetcher: () => Promise<ApiResult<T>>, deps: unknown[] = []): UseApiState<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [source, setSource] = useState<DataSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let alive = true;
    fetcher()
      .then((res) => {
        if (!alive) return;
        setDataState(res.data);
        setSource(res.source);
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setNonce((n) => n + 1);
  }, []);
  const setData = useCallback((updater: (prev: T | null) => T | null) => setDataState(updater), []);

  return { data, source, loading, error, reload, setData };
}
