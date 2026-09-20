import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LEVELS = ['compact', 'standard', 'expanded'];

export default function TripBottomSheet({
  eyebrow, title, subtitle, status, action, footer, children,
  level: controlledLevel, onLevelChange,
}) {
  const [localLevel, setLocalLevel] = useState('standard');
  const startY = useRef(null);
  const level = controlledLevel ?? localLevel;
  const index = Math.max(0, LEVELS.indexOf(level));
  const changeLevel = (next) => {
    const value = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, next))];
    if (controlledLevel === undefined) setLocalLevel(value);
    onLevelChange?.(value);
  };
  const finishDrag = (event) => {
    if (startY.current == null) return;
    const movement = event.clientY - startY.current;
    startY.current = null;
    if (Math.abs(movement) >= 32) changeLevel(index + (movement < 0 ? 1 : -1));
  };

  return <section className={`trip-sheet is-${level} ${footer ? 'has-footer' : ''}`} aria-label="Detalhes da viagem">
    <div className="trip-sheet__controls">
      <button type="button" onClick={() => changeLevel(index - 1)} disabled={index === 0} aria-label="Descer painel e mostrar mais mapa"><ChevronDown size={21} /></button>
      <div className="trip-sheet__grabber"
        onPointerDown={(event) => { startY.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerUp={finishDrag}
        onPointerCancel={() => { startY.current = null; }}
        aria-hidden="true"><span /></div>
      <button type="button" onClick={() => changeLevel(index + 1)} disabled={index === LEVELS.length - 1} aria-label="Subir painel e mostrar mais detalhes"><ChevronUp size={21} /></button>
    </div>
    <div className="trip-sheet__summary">
      <div><small>{eyebrow}</small><h1>{title}</h1><p>{subtitle}</p></div>
      {status && <span className="trip-sheet__status">{status}</span>}
    </div>
    {action && <div className="trip-sheet__action">{action}</div>}
    {level === 'expanded' && <div className="trip-sheet__details">{children}</div>}
    {footer && <div className="trip-sheet__footer">{footer}</div>}
  </section>;
}
