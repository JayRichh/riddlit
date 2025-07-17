import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://riddlix.vercel.app'
  const isProduction = process.env.NODE_ENV === 'production'

  // Block everything in development/staging
  if (!isProduction) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    }
  }

  // Production rules
  return {
    rules: [
      // General rules for all search engines
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/', // Block API endpoints
          '/admin/', // Block admin areas
          '/_next/', // Block Next.js internals
          '/dashboard/', // Block private dashboard
          '/profile/', // Block private profile pages
          '/contacts/', // Block private contacts
          '/login/', // Block auth pages
          '/signup/', // Block auth pages
          '/riddles/create', // Block creation pages (require auth)
          '/teams/create', // Block creation pages (require auth)
        ],
        crawlDelay: 1, // Be respectful to server
      },

      // Give Google special treatment
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/dashboard/',
          '/profile/',
          '/contacts/',
          '/login/',
          '/signup/',
          '/riddles/create',
          '/teams/create',
        ],
        // No crawl delay for Google
      },

      // Block resource-draining bots
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot'],
        disallow: '/',
      },

      // Allow access to public pages for other bots
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/dashboard/',
          '/profile/',
          '/contacts/',
          '/login/',
          '/signup/',
          '/riddles/create',
          '/teams/create',
        ],
        crawlDelay: 2,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
