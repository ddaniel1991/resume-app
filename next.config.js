/** @type {import('next').NextConfig} */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

module.exports = {
  reactStrictMode: true,
  // A stray ~/package-lock.json otherwise makes Turbopack guess the wrong workspace root.
  turbopack: { root: __dirname },
  images: { qualities: [75, 85] },
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  async redirects() {
    return [{ source: '/resume', destination: '/', permanent: true }]
  },
}
