import { Link } from 'waku';
import { SEO } from '../components/SEO';
import { Statement } from '../components/Statement';
import { BASE_URL } from '../lib/seo';

export default async function HomePage() {
    return (
        <>
            <SEO
                title="Bogdan Nikolov"
                description="Personal website and blog of Bogdan Nikolov. Writings on software, security, and the orthodox faith."
                url={BASE_URL}
                ogType="website"
            />

            <main className="statement">
                <Statement />
                <nav className="statement-links" aria-label="Site">
                    <Link to="/blog" className="statement-link">
                        blog <span className="statement-arrow">→</span>
                    </Link>
                    <a
                        href="https://github.com/0xr3ngar"
                        className="statement-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        github <span className="statement-arrow">↗</span>
                    </a>
                </nav>
            </main>
        </>
    );
}

export const getConfig = async () => {
    return {
        render: 'static',
    } as const;
};
