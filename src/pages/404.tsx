import { Link } from 'waku';
import { SEO } from '../components/SEO';

export default function NotFoundPage() {
    return (
        <>
            <SEO
                title="Page not found"
                description="The page you were looking for does not exist."
                url="/404"
                noIndex={true}
            />
            <div className="center-screen">
                <div className="nf">
                    <div className="nf-code">404<span className="nf-dot">.</span></div>
                    <p className="nf-label">page not found</p>
                    <p className="nf-text">
                        The path you followed does not lead here.<br />
                        Perhaps it never existed, or it has already passed on.
                    </p>
                    <nav className="links nf-links">
                        <Link to="/" className="link">home</Link>
                        <Link to="/blog" className="link">blog</Link>
                    </nav>
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
