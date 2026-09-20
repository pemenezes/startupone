import React from 'react';

export function ComfyMark({ size = 56, inverse = false, className = '' }) {
  const background = inverse ? '#ffffff' : 'var(--brand-primary)';
  const route = inverse ? 'var(--brand-primary)' : '#ffffff';
  const accent = 'var(--brand-highlight)';

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="18" fill={background} />
      <path
        d="M43.5 20.5A18 18 0 1 0 45 42"
        stroke={route}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="44" cy="20" r="4.5" fill={accent} />
      <circle cx="45" cy="42" r="4.5" fill={accent} />
    </svg>
  );
}

export default function ComfyBrand({ inverse = false, compact = false, className = '' }) {
  return (
    <span
      className={`comfy-brand ${inverse ? 'comfy-brand--inverse' : ''} ${className}`.trim()}
      aria-label="Comfy"
    >
      <ComfyMark size={compact ? 38 : 56} inverse={inverse} />
      <span>Comfy</span>
    </span>
  );
}
