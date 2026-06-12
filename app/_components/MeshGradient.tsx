'use client';

import { useEffect, useRef } from 'react';

type Point = {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  color: [number, number, number]; // rgb
  opacity: number;
};

export function MeshGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Color points — subtle accent glows, mostly near edges
    const points: Point[] = [
      { x: 0.90, y: 0.02, vx:  0.00018, vy:  0.00012, r: 0.38, color: [20,  184, 166], opacity: 0.28 }, // teal top-right
      { x: 0.05, y: 0.90, vx: -0.00014, vy: -0.00018, r: 0.32, color: [5,   150, 105], opacity: 0.22 }, // emerald bottom-left
      { x: 0.75, y: 0.85, vx:  0.00016, vy: -0.00010, r: 0.28, color: [6,   182, 212], opacity: 0.18 }, // cyan bottom-right
      { x: 0.08, y: 0.12, vx: -0.00012, vy:  0.00020, r: 0.25, color: [15,  118, 110], opacity: 0.16 }, // dark teal top-left
    ];

    let raf: number;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark base
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#0c0d12';
      ctx.fillRect(0, 0, w, h);

      // Blend mode: screen makes overlapping colors bright and luminous
      ctx.globalCompositeOperation = 'screen';

      for (const p of points) {
        // Drift
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -0.1 || p.x > 1.1) p.vx *= -1;
        if (p.y < -0.1 || p.y > 1.1) p.vy *= -1;

        const cx = p.x * w;
        const cy = p.y * h;
        const radius = p.r * Math.max(w, h);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const [r, g, b] = p.color;
        grad.addColorStop(0,   `rgba(${r},${g},${b},${p.opacity})`);
        grad.addColorStop(0.4, `rgba(${r},${g},${b},${p.opacity * 0.4})`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Strong dark vignette — keeps center dark, color only bleeds at edges
      ctx.globalCompositeOperation = 'source-over';
      const vignette = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.75);
      vignette.addColorStop(0,   'rgba(12,13,18,0.92)');
      vignette.addColorStop(0.4, 'rgba(12,13,18,0.78)');
      vignette.addColorStop(0.7, 'rgba(12,13,18,0.45)');
      vignette.addColorStop(1,   'rgba(12,13,18,0)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
