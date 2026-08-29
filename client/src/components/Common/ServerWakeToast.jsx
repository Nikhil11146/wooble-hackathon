import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../utils/constants.js";

const HEALTH_URL = `${API_BASE_URL.replace(/\/+$/, "").replace(/\/api$/, "")}/health`;
const CHECK_INTERVAL_MS = 4000;

async function serverIsAwake() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(HEALTH_URL, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export default function ServerWakeToast() {
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    const check = async () => {
      if (cancelled) return;
      const ok = await serverIsAwake();
      if (cancelled) return;
      setAwake(ok);
      timer = setTimeout(check, CHECK_INTERVAL_MS);
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (awake) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 flex justify-center px-4" style={{ zIndex: 9999 }}>
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-3 pr-4 shadow-lg dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/40">
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-600 border-t-transparent dark:border-[#00a884] dark:border-t-transparent" />
        <span className="text-sm font-semibold text-slate-700 dark:text-[#e9edef]">Connecting to server...</span>
      </div>
    </div>
  );
}