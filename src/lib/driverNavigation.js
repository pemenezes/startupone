export function navigationUrl(position, userAgent = globalThis.navigator?.userAgent || '') {
  const coordinates = position.join(',');
  if (/android/i.test(userAgent)) return `geo:${coordinates}?q=${encodeURIComponent(coordinates)}`;
  if (/iPad|iPhone|iPod/i.test(userAgent)) return 'https://maps.apple.com/?' + new URLSearchParams({ daddr: coordinates, dirflg: 'd' });
  return 'https://www.google.com/maps/dir/?' + new URLSearchParams({
    api: '1', destination: coordinates, travelmode: 'driving', dir_action: 'navigate',
  });
}
