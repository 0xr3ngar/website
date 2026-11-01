'use client';

import { useEffect, useRef } from 'react';

/**
 * A quiet field of monospace glyphs.
 *
 * Ambient flowing noise keeps a barely-there character texture breathing
 * across the viewport — a whisper, not a wall. The pointer carries a soft
 * crimson halo: glyphs under it warm to red. No ripples, no motion trails.
 *
 *      · : + * x # @
 */

const RAMP = [' ', '·', ':', '+', '*', 'x', '#', '@'];

export function AsciiField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const INK = '#eceae7';
        const CRIMSON = '#c41e3a';

        // Calibration — deliberately whisper-quiet.
        const AMBIENT_AMP = 0.28;   // ambient noise amplitude (0..1)
        const AMBIENT_ALPHA = 0.38; // ambient alpha slope
        const AMBIENT_FLOOR = 0.035;
        const HALO_ALPHA = 0.55;    // max crimson halo alpha

        let vw = 0;
        let vh = 0;
        let cell = 24;
        let haloR = 180;
        let dpr = 1;
        let cols = 0;
        let rows = 0;
        let atlasCell = 0;
        let atlasInk: HTMLCanvasElement | null = null;
        let atlasCrimson: HTMLCanvasElement | null = null;

        const buildAtlas = () => {
            atlasCell = Math.ceil(cell * dpr);
            const fontSize = Math.floor(cell * dpr * 0.8);

            const make = (color: string) => {
                const c = document.createElement('canvas');
                c.width = atlasCell * RAMP.length;
                c.height = atlasCell;
                const a = c.getContext('2d');
                if (!a) return c;
                a.font = `${fontSize}px 'JetBrains Mono', monospace`;
                a.textAlign = 'center';
                a.textBaseline = 'middle';
                a.fillStyle = color;
                RAMP.forEach((ch, i) => a.fillText(ch, i * atlasCell + atlasCell / 2, atlasCell / 2));
                return c;
            };

            atlasInk = make(INK);
            atlasCrimson = make(CRIMSON);
        };

        const build = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            vw = window.innerWidth;
            vh = window.innerHeight;

            // Scale with the page's root font size so the field zooms with the design.
            const rootFs =
                parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            cell = vw > 1600 ? Math.round(rootFs * 1.5) : Math.round(rootFs * 1.3);
            haloR = Math.round(rootFs * 9);

            cols = Math.ceil(vw / cell) + 1;
            rows = Math.ceil(vh / cell) + 1;
            canvas.width = Math.round(vw * dpr);
            canvas.height = Math.round(vh * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            buildAtlas();
        };

        /* ── Rendering ───────────────────────────────────────────── */

        // Pointer position, lightly smoothed.
        let tx = -9999;
        let ty = -9999;
        let cx = -9999;
        let cy = -9999;

        const render = (t: number) => {
            cx += (tx - cx) * 0.25;
            cy += (ty - cy) * 0.25;

            ctx.clearRect(0, 0, vw, vh);

            const haloActive = cx > -haloR && cy > -haloR;
            const hx0 = cx - haloR;
            const hx1 = cx + haloR;
            const hy0 = cy - haloR;
            const hy1 = cy + haloR;

            for (let y = 0; y < rows; y++) {
                const row = y * cols;
                const py = y * cell;

                for (let x = 0; x < cols; x++) {
                    // Ambient flow — three drifting interference terms.
                    const n =
                        Math.sin(x * 0.31 + t * 0.6 + Math.sin(y * 0.21 - t * 0.4)) +
                        Math.sin(y * 0.27 - t * 0.5 + Math.sin(x * 0.17 + t * 0.3)) +
                        Math.sin((x + y) * 0.13 + t * 0.25);

                    let v = (n / 3) * AMBIENT_AMP;
                    if (v > 1) v = 1;
                    else if (v < -1) v = -1;
                    const a = Math.abs(v);

                    // Crimson halo under the pointer — color only, no motion.
                    let crimson = 0;
                    const px = x * cell;
                    if (haloActive && px > hx0 && px < hx1 && py > hy0 && py < hy1) {
                        const dist = Math.hypot(px - cx, py - cy);
                        if (dist < haloR) {
                            crimson = 1 - dist / haloR;
                            crimson *= crimson;
                        }
                    }

                    if (a < 0.06 && crimson === 0) continue;

                    const aEff = Math.min(1, a + crimson * 0.45);
                    let idx = Math.floor(aEff * RAMP.length);
                    if (idx >= RAMP.length) idx = RAMP.length - 1;
                    if (idx === 0) idx = 1;

                    const baseAlpha = AMBIENT_FLOOR + a * AMBIENT_ALPHA;
                    const alpha = Math.max(baseAlpha, crimson * HALO_ALPHA);

                    const sx = idx * atlasCell;

                    ctx.globalAlpha = alpha * (1 - crimson * 0.9);
                    ctx.drawImage(atlasInk!, sx, 0, atlasCell, atlasCell, px, py, cell, cell);

                    if (crimson > 0.02) {
                        ctx.globalAlpha = alpha * crimson;
                        ctx.drawImage(atlasCrimson!, sx, 0, atlasCell, atlasCell, px, py, cell, cell);
                    }
                }
            }

            ctx.globalAlpha = 1;
        };

        /* ── Pointer ─────────────────────────────────────────────── */

        const onPointerMove = (e: PointerEvent) => {
            if (reduced) return;
            tx = e.clientX;
            ty = e.clientY;
        };

        const onPointerLeave = () => {
            tx = -9999;
            ty = -9999;
        };

        const onResize = () => {
            build();
        };

        build();

        // Re-render the atlas once the real font is available.
        if (document.fonts?.ready) {
            document.fonts.ready.then(() => buildAtlas()).catch(() => {});
        }

        if (reduced) {
            render(0); // one calm, static frame
            return;
        }

        let raf = 0;
        let t = 0;
        const loop = () => {
            t += 0.016;
            render(t);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', onPointerLeave);
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onPointerMove);
            document.documentElement.removeEventListener('mouseleave', onPointerLeave);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="ascii-field" aria-hidden="true" />;
}
