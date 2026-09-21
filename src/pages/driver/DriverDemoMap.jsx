import { useEffect, useMemo } from 'react';
import { divIcon, latLngBounds } from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { LocateFixed, Maximize } from 'lucide-react';
import ComfyMapLayer from '../../components/ComfyMapLayer';
import { VanIcon } from '../../components/MapMarkers';
import { presentationRouteForStops } from '../../data/presentationRoutePaths';

function stopIcon(number, status) {
  return divIcon({
    className: `driver-map-marker is-${status}`,
    html: `<span>${status === 'done' ? '✓' : number}</span>`,
    iconSize: [34, 34], iconAnchor: [17, 17],
  });
}

function MapControls({ origin, position, stops, path, sheetLevel }) {
  const map = useMap();
  const positions = useMemo(() => [
    ...(path || []),
    ...stops.map((stop) => stop.position),
  ], [path, stops]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      if (positions.length) map.fitBounds(latLngBounds(positions), {
        paddingTopLeft: [40, 65],
        paddingBottomRight: [40, Math.round(map.getSize().y * (sheetLevel === 'expanded' ? .72 : sheetLevel === 'compact' ? .16 : .31))],
        maxZoom: 16, animate: false,
      });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [map, positions, sheetLevel]);
  return <div className="driver-map-controls">
    <button type="button" onClick={() => map.setView(position || origin, 16)} aria-label="Centralizar posição"><LocateFixed size={21} /></button>
    <button type="button" onClick={() => map.fitBounds(latLngBounds(positions.length ? positions : [origin]), { padding: [40, 40], maxZoom: 16 })} aria-label="Mostrar rota completa"><Maximize size={21} /></button>
  </div>;
}

export default function DriverDemoMap({ origin, position, stops, selected, complete = false, sheetLevel = 'standard' }) {
  const selectedIndex = stops.findIndex((stop) => stop.id === selected);
  const route = presentationRouteForStops(stops);
  const center = position || origin || stops[0]?.position;
  if (!center) return <div className="driver-map-tile-error" role="status">A rota ainda não possui coordenadas cadastradas.</div>;
  return <>
    <MapContainer center={center} zoom={14} className="driver-interactive-map" scrollWheelZoom={false} zoomControl={false}>
      <ComfyMapLayer />
      {route?.legs.map((leg, index) => <Polyline key={index} positions={leg} pathOptions={{ color: complete || index < selectedIndex ? '#8099bd' : '#004aad', weight: 5, opacity: .9 }} />)}
      {position && <Marker position={position} icon={VanIcon} title="Posição da van"><Popup>Posição da van</Popup></Marker>}
      {stops.map((stop, index) => <Marker key={stop.id} position={stop.position} icon={stopIcon(index + 1, complete || index < selectedIndex ? 'done' : index === selectedIndex ? 'current' : 'pending')} title={stop.name} zIndexOffset={index === selectedIndex ? 500 : 0}>
        <Popup><strong>{stop.name}</strong><br />{stop.kind === 'destination' ? 'Destino' : 'Ponto de embarque'}</Popup>
      </Marker>)}
      <MapControls origin={center} position={position} stops={stops} path={route?.path} sheetLevel={sheetLevel} />
    </MapContainer>
  </>;
}
