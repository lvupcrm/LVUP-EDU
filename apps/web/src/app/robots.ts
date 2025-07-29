import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lvup-edu-web-h1ln-psi.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/courses',
          '/courses/*',
          '/instructors',
          '/instructor/*',
          '/auth/login',
          '/auth/signup',
          '/about',
          '/contact'
        ],
        disallow: [
          '/admin/*',
          '/api/*',
          '/my/*',
          '/payment/*',
          '/auth/reset-password',
          '/auth/welcome',
          '/_next/*',
          '/static/*'
        ]
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/courses',
          '/courses/*',
          '/instructors',
          '/instructor/*'
        ],
        disallow: [
          '/admin/*',
          '/api/*',
          '/my/*',
          '/payment/*'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}