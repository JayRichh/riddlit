/*
<ai_context>
This server layout provides a centered layout for (auth) pages.
</ai_context>
*/

export const metadata = {
  title: 'Authentication',
  description:
    'Sign in or sign up to Riddlix. Join the community of riddle solvers and start building your team today.',
  openGraph: {
    url: 'https://riddl.it/login',
    images: [
      {
        url: '/riddlix_logo.png',
        width: 1200,
        height: 630,
        alt: 'Riddlix Authentication - Join the Community',
        type: 'image/png',
      },
    ],
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
