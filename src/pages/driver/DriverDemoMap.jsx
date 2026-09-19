import { useEffect, useState } from 'react';
import { divIcon, latLngBounds } from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { LocateFixed, Maximize } from 'lucide-react';

const stopIcons = ['pending', 'current', 'done'].map((status) => [1, 2, 3, 4].map((number) => divIcon({
  className: `driver-map-marker is-${status}`,
  html: '<span>' + (status === 'done' ? '✓' : number) + '</span>',
  iconSize: [34, 34], iconAnchor: [17, 17],
})));
const originIcon = divIcon({
  className: 'driver-map-origin', html: '<span></span>',
  iconSize: [24, 24], iconAnchor: [12, 12],
});

function MapControls({ origin, position, stops }) {
  const map = useMap();
  useEffect(() => {
    map.closePopup();
    map.fitBounds(latLngBounds([origin, ...stops.map((stop) => stop.position)]), { padding: [35, 35], maxZoom: 16, animate: false });
  }, [map, origin, stops]);
  return <div className="driver-map-controls">
    <button type="button" onClick={() => { map.closePopup(); map.setView(position || origin, 16, { animate: false }); }} aria-label="Centralizar minha posição" title="Centralizar posição"><LocateFixed size={21} aria-hidden="true" /></button>
    <button type="button" onClick={() => { map.closePopup(); map.fitBounds(latLngBounds([origin, ...stops.map((stop) => stop.position)]), { padding: [35, 35], maxZoom: 16, animate: false }); }} aria-label="Mostrar rota completa" title="Rota completa"><Maximize size={21} aria-hidden="true" /></button>
  </div>;
}

export default function DriverDemoMap({ origin, position, stops, selected, complete }) {
  const [tileError, setTileError] = useState(false);
  const [tileVersion, setTileVersion] = useState(0);
  return <>
    {tileError && <div className="driver-map-tile-error" role="status">
      <p>Não foi possível carregar algumas imagens do mapa. As paradas continuam disponíveis abaixo.</p>
      <button className="btn btn-outline" type="button" onClick={() => { setTileError(false); setTileVersion((value) => value + 1); }}>Recarregar mapa</button>
    </div>}
    <MapContainer center={origin} zoom={14} className="driver-interactive-map" scrollWheelZoom={false}>
      <TileLayer key={tileVersion} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' eventHandlers={{ tileerror: () => setTileError(true) }} />
      <Polyline positions={[origin, ...stops.map((stop) => stop.position)]} pathOptions={{ color: '#004aad', weight: 5, dashArray: '9 8', opacity: 0.85 }} />
      <Marker position={position || origin} icon={originIcon} title={position ? 'Última posição do motorista' : 'Ponto de partida'}>
        <Popup>{position ? 'Última posição obtida pelo GPS' : 'Ponto de partida'}</Popup>
      </Marker>
      {stops.map((stop) => <Marker key={stop.id} position={stop.position} icon={stopIcons[complete || stop.id < selected ? 2 : stop.id === selected ? 1 : 0][stop.id - 1]} title={'Ponto ' + stop.id + ': ' + stop.name} zIndexOffset={selected === stop.id ? 500 : 0}>
        <Popup><strong>{stop.id}. {stop.name}</strong><br />{complete || stop.id < selected ? 'Concluída' : stop.id === selected ? 'Parada atual' : 'Próxima parada'}</Popup>
      </Marker>)}
      <MapControls origin={origin} position={position} stops={stops} />
    </MapContainer>
  </>;
}
