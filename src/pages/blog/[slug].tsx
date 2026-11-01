import type { PageProps } from 'waku/router';
import { Link } from 'waku';
import { PageNav } from '../../components/PageNav';
import { MarkdownContent } from '../../components/MarkdownContent';
import { TableOfContents } from '../../components/TableOfContents';
import { ScrollProgress } from '../../components/ScrollProgress';
import { getPostBySlug, getAllSlugs } from '../../lib/posts';
import { extractHeadings } from '../../lib/headings';
import { SEO } from '../../components/SEO';

export default async function BlogPostPage({ slug }: PageProps<'/blog/[slug]'>) {
    const post = getPostBySlug(slug);

    if (!post) {
        return (
            <>
                <SEO
                    title="Post not found"
                    description="The requested post could not be found."
                    url="/blog"
                    noIndex={true}
                />

                <PageNav>
                    <Link to="/" className="page-nav-link">← home</Link>
                    <Link to="/blog" className="page-nav-link">← blog</Link>
                </PageNav>
                <main className="main">
                    <h1>Post not found</h1>
                </main>
            </>
        );
    }

    const headings = extractHeadings(post.content);
    const postDateISO = new Date(post.date).toISOString();

    return (
        <>
            <SEO
                title={post.title}
                description={post.excerpt}
                url={`/blog/${slug}`}
                ogType="article"
                publishedTime={postDateISO}
                tags={post.tags}
            />

            <PageNav>
                <Link to="/" className="page-nav-link">← home</Link>
                <Link to="/blog" className="page-nav-link">← blog</Link>
            </PageNav>
            <ScrollProgress />
            <TableOfContents headings={headings} />
            <main className="main">
                <article className="post-header">
                    <h1 className="post-view-title">{post.title}</h1>
                    <div className="post-meta">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                    </div>
                </article>

                <MarkdownContent content={post.content} />
            </main>
        </>
    );
}

export const getConfig = async () => {
    const staticPaths = getAllSlugs();

    return {
        render: 'static',
        staticPaths,
    } as const;
};
