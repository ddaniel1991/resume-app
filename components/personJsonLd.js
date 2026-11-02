export function buildPersonJsonLd(profile, siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    email: `mailto:${profile.email}`,
    url: siteUrl,
    image: `${siteUrl}${profile.headshot}`,
    address: { '@type': 'PostalAddress', addressLocality: profile.location },
    sameAs: profile.social.map((link) => link.url),
  }
}
