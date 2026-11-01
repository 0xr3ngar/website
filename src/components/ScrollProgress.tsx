'use client';

import { useEffect, useRef } from 'react';

/** Thin crimson reading-progress line pinned to the top of the viewport. */
export function ScrollProgress() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let raf = 0;

        const update = () => {
            raf = 0;
            const doc = document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
            el.style.transform = `scaleX(${p})`;
        };

        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
