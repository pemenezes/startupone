import { useEffect, useState } from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import style from '../data/comfyStreetsStyle.json';

setWorkerUrl(workerUrl);

export default function ComfyMapLayer() {
  const map = useMap();
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (fallback) return undefined;

    const layer = maplibreGL({ style }).addTo(map);
    const vectorMap = layer.getMaplibreMap();
    let loaded = false;
    const timeout = window.setTimeout(() => {
      if (!loaded) setFallback(true);
    }, 6000);
    const onLoad = () => {
      loaded = true;
      window.clearTimeout(timeout);
    };
    const onError = () => {
      if (!loaded) setFallback(true);
    };

    vectorMap.on('load', onLoad);
    vectorMap.on('error', onError);
    return () => {
      window.clearTimeout(timeout);
      vectorMap.off('load', onLoad);
      vectorMap.off('error', onError);
      map.removeLayer(layer);
    };
  }, [map, fallback]);

  return fallback ? <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' /> : null;
}
