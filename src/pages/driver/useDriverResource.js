import { useEffect, useState } from 'react';

// A result belongs to one loader and refresh version. Old requests never replace a newer result.
export function useDriverResource(load) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState(null);
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(load).then(
      (data) => { if (!cancelled) setResult({ load, version, data, error: null }); },
      (error) => { if (!cancelled) setResult({ load, version, data: null, error }); },
    );
    return () => { cancelled = true; };
  }, [load, version]);
  const current = result?.load === load && result?.version === version;
  return {
    data: current ? result.data : null,
    error: current ? result.error : null,
    loading: !current,
    refresh: () => setVersion((value) => value + 1),
  };
}
