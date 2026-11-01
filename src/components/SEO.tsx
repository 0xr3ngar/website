import type { SEOProps } from '../lib/seo';
import {
  AUTHOR,
  BASE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  TWITTER_HANDLE,
} from '../lib/seo';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  url,
  ogType = 'website',
  publishedTime,
  tags = [],
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title.includes('bnn.dev') ? title : `${title} | ${SITE_NAME}`;
  const canonical = url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  const ogImage = image.startsWith('http') ? image : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;

  const jsonLd =
    ogType === 'article' && publishedTime
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          author: {
            '@type': 'Person',
            name: AUTHOR,
            url: BASE_URL,
          },
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: BASE_URL,
          },
          datePublished: publishedTime,
          description,
          url: canonical,
          image: ogImage,
          keywords: tags.length > 0 ? tags.join(', ') : undefined,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: AUTHOR,
          url: BASE_URL,
          description: DEFAULT_DESCRIPTION,
          sameAs: [
            'https://github.com/0xr3ngar',
          ],
        };

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {noIndex && <meta name="robots" content="noindex,follow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {ogType === 'article' && publishedTime && (
        <meta property="og:article:published_time" content={publishedTime} />
      )}
      {tags.map((tag) => (
        <meta key={tag} property="og:article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {TWITTER_HANDLE && <meta name="twitter:site" content={TWITTER_HANDLE} />}
      {TWITTER_HANDLE && <meta name="twitter:creator" content={TWITTER_HANDLE} />}

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
