import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/lib/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-muted-foreground text-9xl font-bold">404</h1>
          <h2 className="mt-4 text-2xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/" className="flex items-center">
              <Home className="mr-2 size-4" />
              Go Home
            </Link>
          </Button>

          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 size-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
