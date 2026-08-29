import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function dependencyKey(deps) {
  try {
    return JSON.stringify(deps);
  } catch {
    return String(deps);
  }
}

export default function useApi(fetcher, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(immediate));
  const [error, setError] = useState(null);
  const mountedRef = useRef(false);
  const fetcherRef = useRef(fetcher);
  const depsKey = useMemo(() => dependencyKey(deps), [deps]);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [depsKey, fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current(...args);
      if (mountedRef.current) setData(result);
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setData(null);
      }
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!immediate) return undefined;
    let active = true;
    queueMicrotask(() => {
      if (active) execute().catch(() => undefined);
    });
    return () => {
      active = false;
    };
  }, [depsKey, execute, immediate]);

  const refetch = useCallback((...args) => execute(...args), [execute]);

  return { data, loading, error, refetch, setData };
}
