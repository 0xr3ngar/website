import '../styles.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link
                rel="preload"
                href="/fonts/jetbrains-mono-latin.woff2"
                as="font"
                type="font/woff2"
                crossOrigin="anonymous"
            />
            <link
                rel="preload"
                href="/fonts/newsreader-latin.woff2?v=2"
                as="font"
                type="font/woff2"
                crossOrigin="anonymous"
            />
            <link
                rel="preload"
                href="/fonts/newsreader-italic-latin.woff2?v=2"
                as="font"
                type="font/woff2"
                crossOrigin="anonymous"
            />

            {/* Global head elements. Per-page title, description, OG, Twitter, and JSON-LD
                are rendered via the <SEO /> component in individual pages for reliable hoisting. */}
            <meta name="author" content="Bogdan Nikolov" />

            {/* Marks JS availability before first paint, so .reveal content
                stays visible when JS never runs. */}
            <script
                dangerouslySetInnerHTML={{
                    __html: "document.documentElement.classList.add('js')",
                }}
            />

            <div className="bg-glow" aria-hidden="true" />
            {children}
        </>
    );
}

export const getConfig = async () => {
    return {
        render: 'static',
    } as const;
};
