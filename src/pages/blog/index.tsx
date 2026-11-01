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
                description="Writings on software, security, and the orthodox faith. Personal essays by Bogdan Nikolov."
                url="/blog"
                ogType="website"
            />

            <PageNav>
                <Link to="/" className="page-nav-link">← home</Link>
            </PageNav>
            <main className="writings">
                <header className="writings-masthead">
                    <h1 className="writings-title">Writings</h1>
                </header>

                <ol className="writings-list">
                    {posts.map((post, i) => (
                        <li key={post.slug}>
                            <Reveal delay={i * 90}>
                                <Link to={`/blog/${post.slug}`} className="entry">
                                    <div className="entry-meta">
                                        <span className="entry-date">{fmt(post.date)}</span>
                                    </div>
                                    <h2 className="entry-title">{post.title}</h2>
                                    <p className="entry-excerpt">{post.excerpt}</p>
                                </Link>
                            </Reveal>
                        </li>
                    ))}
                </ol>
            </main>
        </>
    );
}

export const getConfig = async () => {
    return {
        render: 'static',
    } as const;
};
