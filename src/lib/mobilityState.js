export function activeStopIndex(stops, arrivals, passengers) {
  const arrived = new Set(arrivals.map((row) => row.route_stop_id));
  const index = stops.findIndex((stop) =>
    !arrived.has(stop.id) || passengers.some((passenger) =>
      passenger.boarding_stop_id === stop.id && passenger.status === 'expected'));
  return index < 0 ? Math.max(stops.length - 1, 0) : index;
}

export function stopPosition(stop) {
  if (stop?.latitude == null || stop?.longitude == null) return null;
  const lat = Number(stop.latitude);
  const lng = Number(stop.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
}

export function journeyPosition(journey) {
  if (journey?.position_lat == null || journey?.position_lng == null) return null;
  const lat = Number(journey.position_lat);
  const lng = Number(journey.position_lng);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
}

export function passengerJourneyCopy(journey, passenger) {
  if (passenger?.status === 'cancelled') return { label: 'Viagem cancelada', detail: 'Seu embarque foi cancelado.' };
  if (!journey) return { label: 'Viagem programada', detail: 'A van ainda não iniciou a rota.' };
  if (journey.status === 'cancelled') return { label: 'Viagem cancelada', detail: 'Esta viagem não será realizada.' };
  if (journey.status === 'completed') return { label: 'Viagem concluída', detail: 'A van chegou ao destino.' };
  if (passenger?.status === 'boarded') return { label: 'Em viagem', detail: 'Seu embarque foi confirmado.' };
  if (passenger?.status === 'absent') return { label: 'Ausência registrada', detail: 'O motorista registrou sua ausência.' };
  if (journey.delay_minutes > 0) return { label: 'Van com atraso', detail: `Previsão atualizada: ${journey.delay_minutes} min de atraso.` };
  return { label: 'Van em rota', detail: 'Acompanhe a chegada ao seu ponto.' };
}
