import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { Car, Navigation, MapPin } from 'lucide-react';

const createIcon = (iconElement, bgColor) => {
  return new L.DivIcon({
    html: `<div style="background-color: ${bgColor}; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); color: white;">
             ${ReactDOMServer.renderToString(iconElement)}
           </div>`,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const VanIcon = createIcon(<Car size={16} fill="white" />, 'var(--primary)');
export const AlertVanIcon = createIcon(<Car size={16} fill="white" />, 'var(--danger)');
export const PointIcon = createIcon(<MapPin size={16} fill="white" />, 'var(--secondary)');
export const UserIcon = createIcon(<Navigation size={16} fill="white" style={{ transform: 'rotate(45deg)' }} />, 'var(--secondary)');
export const StopIcon = createIcon(<div style={{ width: 8, height: 8, backgroundColor: 'white', borderRadius: '50%' }}></div>, 'var(--text-secondary)');
