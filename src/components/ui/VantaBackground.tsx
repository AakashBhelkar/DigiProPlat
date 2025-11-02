import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import * as VANTA from 'vanta';
import { resolveVantaColor } from '@/lib/vantaColor';

// Import only the Vanta effects you want to support
// Example: import NET from 'vanta/dist/vanta.net.min';
// For now, we will dynamically require the effect based on prop

export interface VantaBackgroundProps {
  effect?: 'net' | 'waves' | 'fog' | 'birds' | 'clouds' | 'globe' | 'rings';
  options?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const VantaBackground: React.FC<VantaBackgroundProps> = ({
  effect = 'net',
  options = {},
  className = '',
  style = {},
  children,
}) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    let effectModule: any;
    let cancelled = false;
    (async () => {
      switch (effect) {
        case 'waves':
          effectModule = (await import('vanta/dist/vanta.waves.min')).default;
          break;
        case 'fog':
          effectModule = (await import('vanta/dist/vanta.fog.min')).default;
          break;
        case 'birds':
          effectModule = (await import('vanta/dist/vanta.birds.min')).default;
          break;
        case 'clouds':
          effectModule = (await import('vanta/dist/vanta.clouds.min')).default;
          break;
        case 'globe':
          effectModule = (await import('vanta/dist/vanta.globe.min')).default;
          break;
        case 'rings':
          effectModule = (await import('vanta/dist/vanta.rings.min')).default;
          break;
        case 'net':
        default:
          effectModule = (await import('vanta/dist/vanta.net.min')).default;
      }
      if (!cancelled && vantaRef.current && !vantaEffect.current) {
        vantaEffect.current = effectModule({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
        });
      }
    })();
    return () => {
      cancelled = true;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, [effect, options]);

  return (
    <div
      ref={vantaRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={style}
    >
      <div className="absolute inset-0 z-0" />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}; 