import { Link } from 'waku';
import { SEO } from '../components/SEO';
import { BASE_URL } from '../lib/seo';
import { AsciiField } from '../components/AsciiField';

function Word({ word, className }: { word: string; className: string }) {
    return (
        <span className={className} aria-hidden="true">
            {word.split('').map((ch, i) => (
                <span key={i} className="name-letter">{ch}</span>
            ))}
        </span>
    );
}

export default async function HomePage() {
    return (
        <>
            <SEO
                title="Bogdan Nikolov"
                description="Personal website and blog of Bogdan Nikolov. Writing on software, security, faith, and the examined life."
                url={BASE_URL}
                ogType="website"
            />

            <AsciiField />

            <div className="cover-frame">
                <span className="frame-label frame-tl" aria-hidden="true">0xr3ngar</span>
                <Link to="/blog" className="frame-label frame-tr">blog →</Link>
                <a
                    href="https://github.com/0xr3ngar"
                    className="frame-label frame-bl"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    github ↗
                </a>
                <span className="frame-label frame-br" aria-hidden="true">bnn.dev</span>
            </div>

            <div className="center-screen">
                <div className="home-content">
                    <h1 className="name" aria-label="Bogdan Nikolov">
                        <Word word="bogdan" className="name-heavy" />
                        <Word word="nikolov" className="name-thin" />
                    </h1>
                    <div className="home-rule" aria-hidden="true" />
                    <p className="home-tagline">software · security · faith</p>
                </div>
            </div>
        </>
    );
}

export const getConfig = async () => {
    return {
        render: 'static',
    } as const;
};
