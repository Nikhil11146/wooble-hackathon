import { useCallback, useEffect, useState } from "react";

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000,
};

export default function useLocation(options = DEFAULT_OPTIONS) {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [supported] = useState(() => typeof navigator !== "undefined" && "geolocation" in navigator);

  const requestLocation = useCallback(() => {
    if (!supported) {
      setError(new Error("Geolocation is not supported in this browser."));
      return Promise.reject(new Error("Geolocation is not supported in this browser."));
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setCoords(nextCoords);
          setLoading(false);
          resolve(nextCoords);
        },
        (geoError) => {
          const message =
            geoError.code === geoError.PERMISSION_DENIED
              ? "Location permission denied."
              : geoError.code === geoError.POSITION_UNAVAILABLE
                ? "Location unavailable."
                : "Location request timed out.";
          const err = new Error(message);
          setError(err);
          setLoading(false);
          reject(err);
        },
        { ...DEFAULT_OPTIONS, ...options },
      );
    });
  }, [options, supported]);

  useEffect(() => {
    if (options.auto !== true) return undefined;
    let active = true;
    queueMicrotask(() => {
      if (active) requestLocation().catch(() => undefined);
    });
    return () => {
      active = false;
    };
  }, [options.auto, requestLocation]);

  return {
    coords,
    error,
    loading,
    supported,
    requestLocation,
    hasLocation: Boolean(coords),
  };
}
