import { useCallback, useEffect, useRef, useState } from "react";

export default function useApi(fetcher, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(immediate));
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher(...args);
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  useEffect(() => {
    if (!immediate) return undefined;
    execute();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, execute]);

  const refetch = useCallback((...args) => execute(...args), [execute]);

  return { data, loading, error, refetch, setData };
}
