import React from 'react';

export function ComfyMark({ size = 56, inverse = false, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`comfy-mark ${inverse ? 'comfy-mark--inverse' : ''} ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <img src="/brand/comfy-van.png" alt="" />
    </span>
  );
}

export default function ComfyBrand({ inverse = false, compact = false, className = '' }) {
  return (
    <span
      className={`comfy-brand ${inverse ? 'comfy-brand--inverse' : ''} ${compact ? 'comfy-brand--compact' : ''} ${className}`.trim()}
    >
      {inverse ? (
        <>
          <ComfyMark size={compact ? 38 : 52} inverse />
          <span>Comfy</span>
        </>
      ) : (
        <span className="comfy-brand__art">
          <img src="/brand/comfy-logo.png" alt="Comfy" width="640" height="268" />
        </span>
      )}
    </span>
  );
}
