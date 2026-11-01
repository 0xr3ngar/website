'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface PageNavProps {
    children: ReactNode;
}

export function PageNav({ children }: PageNavProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 48);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`page-nav${scrolled ? ' scrolled' : ''}`}>
            {children}
        </nav>
    );
}
