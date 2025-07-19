/*
<ai_context>
This server layout provides a centered layout for (auth) pages.
</ai_context>
*/

export const metadata = {
  title: 'Authentication | Riddlix',
  description:
    'Sign in or sign up to Riddlix. Join the community of riddle solvers and start building your team today.',
  openGraph: {
    title: 'Authentication | Riddlix',
    description:
      'Sign in or sign up to Riddlix. Join the community of riddle solvers and start building your team today.',
    type: 'website',
    url: 'https://riddl.it/login',
    images: [
      {
        url: '/riddlix_logo.png',
        width: 800,
        height: 600,
        alt: 'Riddlix Authentication - Join the Community',
      },
    ],
    siteName: 'Riddlix',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Authentication | Riddlix',
    description:
      'Sign in or sign up to Riddlix. Join the community of riddle solvers and start building your team today.',
    images: ['/riddlix_logo.png'],
  },
  alternates: {
    canonical: 'https://riddl.it/login',
  },
  robots: {
    index: false,
    follow: false,
  },
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="flex h-screen items-center justify-center">{children}</div>
}
