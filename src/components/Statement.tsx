'use client';

import { useRef, useState } from 'react';

const TAGLINE = 'Writings on software, security and the orthodox faith.';
const VERSE = 'What I am doing you do not understand now, but afterward you will understand.';
const TAPS_TO_REVEAL = 7; // John 13:7
const TAP_WINDOW_MS = 1000;

export function Statement() {
    const [revealed, setRevealed] = useState(false);
    const taps = useRef(0);
    const lastTap = useRef(0);

    const handleTap = () => {
        const withinWindow = Date.now() - lastTap.current < TAP_WINDOW_MS;
        if (!withinWindow) taps.current = 0;
        lastTap.current = Date.now();
        taps.current += 1;
        const isRevealed = taps.current >= TAPS_TO_REVEAL;
        if (isRevealed) setRevealed(true);
    };

    return (
        <div className="statement-body">
            <h1 className="statement-name" onClick={handleTap}>
                Bogdan<br />Nikolov
            </h1>
            <p
                key={revealed ? 'verse' : 'tagline'}
                className={revealed ? 'statement-line statement-verse' : 'statement-line'}
            >
                {revealed ? VERSE : TAGLINE}
            </p>
        </div>
    );
}
