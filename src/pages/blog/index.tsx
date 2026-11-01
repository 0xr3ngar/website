import { Link } from 'waku';
import { PageNav } from '../../components/PageNav';
import { getAllPosts } from '../../lib/posts';
import { SEO } from '../../components/SEO';
import { Reveal } from '../../components/Reveal';

function fmt(date: string) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).toUpperCase();
}

export default async function BlogPage() {
    const posts = getAllPosts();

    return (
        <>
            <SEO
                title="Blog"
                description="Thoughts on software, security, and life. Personal essays by Bogdan Nikolov."
                url="/blog"
                ogType="website"
            />

            <PageNav>
                <Link to="/" className="page-nav-link">← home</Link>
            </PageNav>
            <main className="writings">
                <header className="writings-masthead">
                    <h1 className="writings-title">blog<span className="writings-dot" aria-hidden="true">.</span></h1>
                    <p className="writings-tagline">thoughts on software, security, and life</p>
                </header>

                <ol className="writings-list">
                    {posts.map((post, i) => (
                        <li key={post.slug}>
                            <Reveal delay={i * 90}>
                                <Link to={`/blog/${post.slug}`} className="entry">
                                    <span className="entry-number" aria-hidden="true">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div className="entry-body">
                                        <div className="entry-meta">
                                            <span className="entry-date">{fmt(post.date)}</span>
                                            <span className="entry-tags">{post.tags.join(' · ')}</span>
                                        </div>
                                        <h2 className="entry-title">{post.title}</h2>
                                        <p className="entry-excerpt">{post.excerpt}</p>
                                    </div>
                                </Link>
                            </Reveal>
                        </li>
                    ))}
                </ol>

                <div className="writings-colophon" aria-hidden="true">∎</div>
            </main>
        </>
    );
}

export const getConfig = async () => {
    return {
        render: 'static',
    } as const;
};
