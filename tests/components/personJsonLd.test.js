import { buildPersonJsonLd } from '../../components/personJsonLd'

const profile = {
  name: 'Test Person',
  title: 'Software Engineer',
  location: 'Somewhere, FL',
  email: 'test@example.com',
  summary: 'Builds things.',
  headshot: '/images/headshot.jpg',
  resumePdf: '/Test_Resume.pdf',
  social: [
    { label: 'GitHub', url: 'https://github.com/test', icon: 'github' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/test', icon: 'linkedin' },
  ],
}

test('builds a schema.org Person with absolute urls and every social profile', () => {
  expect(buildPersonJsonLd(profile, 'https://example.com')).toEqual({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Test Person',
    jobTitle: 'Software Engineer',
    email: 'mailto:test@example.com',
    url: 'https://example.com',
    image: 'https://example.com/images/headshot.jpg',
    address: { '@type': 'PostalAddress', addressLocality: 'Somewhere, FL' },
    sameAs: ['https://github.com/test', 'https://linkedin.com/in/test'],
  })
})
