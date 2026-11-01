'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        grep?: (pattern: string) => void;
        __bnnEggReady?: boolean;
    }
}

const CRIMSON = '#c41e3a';
const PATH_STYLE = `color:${CRIMSON}`;
const HEADER_STYLE = `color:${CRIMSON};font-weight:700`;

interface EggEntry {
    path: string;
    loc: string;
    content: string;
    keywords: string[];
    act?: () => void;
}

const CORPUS: EggEntry[] = [
    {
        path: 'writings/john-13-7.md',
        loc: '7',
        content: 'What I am doing you do not understand now, but afterward you will understand.',
        keywords: ['faith', 'god', 'christ', 'jesus', 'lord', 'verse', 'scripture', 'plan'],
    },
    {
        path: 'writings/trust-but-grep.md',
        loc: '1',
        content: 'One rice session, one grep, five vulnerabilities in an open-source desktop shell.',
        keywords: ['trust', 'grep', 'verify', 'security', 'vuln'],
    },
    {
        path: 'writings/two-modern-day-gospels.md',
        loc: '1',
        content: 'Two rival gospels vie for the souls of modern young men, when only the light can save them.',
        keywords: ['gospel', 'gospels', 'cross', 'church', 'souls'],
    },
    {
        path: 'etc/motd',
        loc: '1',
        content: 'be curious. it rarely bites.',
        keywords: ['hello', 'hi', 'motd', 'curious', 'whoami'],
    },
    {
        path: 'etc/secrets',
        loc: '1',
        content: '[permission denied] — trust, but grep harder.',
        keywords: ['secret', 'secrets', 'password', 'hidden', 'flag'],
    },
    {
        path: 'front-door/name',
        loc: '7',
        content: 'the name listens. seven times, as it is written.',
        keywords: ['name', 'tap', 'click', 'seven', 'door', 'home', 'bogdan', 'nikolov'],
    },
    {
        path: 'var/www/never-gonna-give-you-up',
        loc: '1',
        content: 'you asked for this.',
        keywords: ['rick', 'roll', 'rickroll', 'astley'],
        act: () => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank'),
    },
];

const printMatch = (entry: EggEntry) => {
    console.log(`%c${entry.path}:${entry.loc} %c${entry.content}`, PATH_STYLE, 'color:inherit');
};

const runGrep = (pattern: string) => {
    const query = typeof pattern === 'string' ? pattern.trim() : '';
    const isUsage = query.length === 0;
    if (isUsage) {
        console.log("usage: grep <pattern> — start with 'faith'. the rest is up to you.");
        return;
    }
    const isAll = query === '*' || query === 'all' || query === 'everything';
    const q = query.toLowerCase();
    const matches = CORPUS.filter((entry) => {
        if (isAll) return true;
        const haystack = `${entry.path} ${entry.content} ${entry.keywords.join(' ')}`;
        return haystack.toLowerCase().includes(q);
    });
    const matchWord = matches.length === 1 ? 'match' : 'matches';
    console.log(`%c${matches.length} ${matchWord} in ${CORPUS.length} files — grep '${query}'`, HEADER_STYLE);
    matches.forEach((entry) => {
        printMatch(entry);
        if (!isAll && entry.act) entry.act();
    });
    if (matches.length === 0) console.log("no matches. try '*'.");
};

export function ConsoleEgg() {
    useEffect(() => {
        if (window.__bnnEggReady) return;
        window.__bnnEggReady = true;
        window.grep = runGrep;
        console.log('%c bnn.dev %c 0 secrets · 1 hint', HEADER_STYLE, 'color:inherit');
        console.log("nothing here is hidden. it's just not volunteered.");
        console.log("you brought devtools — try grep('faith')");
    }, []);
    return null;
}
