import { useEffect, useState } from 'react';
import { DEMO_ORIGIN } from '../../lib/driverDemo';

export function useDriverLocation() {
  const [attempt, setAttempt] = useState(0);
  const [location, setLocation] = useState({
    origin: DEMO_ORIGIN, position: null, accuracy: null, timestamp: null, status: 'idle', message: '',
  });
  useEffect(() => {
    if (!attempt) return;
    let active = true;
    let watch;
    const fail = (message, stop = true) => {
      if (!active) return;
      setLocation((current) => ({ ...current, status: 'error', message }));
      if (stop) {
        active = false;
        if (watch !== undefined) navigator.geolocation?.clearWatch(watch);
      }
    };
    const timeout = window.setTimeout(() => fail('A localização demorou a responder. Tente novamente.'), 15000);
    if (!window.isSecureContext || !navigator.geolocation) {
      window.clearTimeout(timeout);
      Promise.resolve().then(() => fail('Localização indisponível neste navegador. Use HTTPS ou localhost para permitir o GPS.'));
    } else {
      watch = navigator.geolocation.watchPosition(
        ({ coords, timestamp }) => {
          if (!active) return;
          window.clearTimeout(timeout);
          const position = [coords.latitude, coords.longitude];
          setLocation((current) => ({
            origin: current.position ? current.origin : position,
            position, accuracy: coords.accuracy, timestamp, status: 'ready', message: '',
          }));
        },
        (error) => {
          window.clearTimeout(timeout);
          fail(error.code === 1
            ? 'Permissão de localização negada. Você pode liberá-la nas configurações do navegador e tentar novamente.'
            : 'Sinal de localização indisponível. Exibindo a última posição conhecida, quando disponível.', error.code === 1);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 },
      );
    }
    return () => {
      active = false;
      window.clearTimeout(timeout);
      if (watch !== undefined) navigator.geolocation?.clearWatch(watch);
    };
  }, [attempt]);

  const start = () => {
    setLocation((current) => ({ ...current, status: 'requesting', message: '' }));
    setAttempt((current) => current + 1);
  };
  return { ...location, start };
}
