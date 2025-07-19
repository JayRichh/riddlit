/*
<ai_context>
Global breadcrumb navigation component for the Riddlit app.
Provides consistent breadcrumb navigation across all routes with home icon.
Replaces page titles with proper navigation context.
</ai_context>
*/

'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbProps {
  className?: string
  separator?: React.ComponentType<{ className?: string }>
  homeIcon?: React.ComponentType<{ className?: string }>
}

export function Breadcrumb({
  className,
  separator: Separator = ChevronRight,
  homeIcon: HomeIcon = Home,
}: BreadcrumbProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Always start with home
    breadcrumbs.push({
      label: 'Home',
      href: '/dashboard',
      icon: HomeIcon,
    })

    // Handle different route patterns
    let currentPath = ''

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`

      // Skip auth routes for breadcrumbs
      if (segment === 'login' || segment === 'signup') continue

      // Handle dynamic routes and special cases
      let label = segment
      const href = currentPath

      switch (segment) {
        case 'dashboard':
          // Skip dashboard as it's already home
          continue
        case 'teams':
          label = 'Teams'
          break
        case 'riddles':
          label = 'Riddles'
          break
        case 'leaderboard':
          label = 'Leaderboard'
          break
        case 'profile':
          label = 'Profile'
          break
        case 'contacts':
          label = 'Contacts'
          break
        case 'admin':
          label = 'Admin'
          break
        case 'notifications':
          label = 'Notifications'
          break
        case 'create':
          label = 'Create'
          break
        case 'suggest':
          label = 'Suggest'
          break
        case 'settings':
          label = 'Settings'
          break
        case 'analytics':
          label = 'Analytics'
          break
        case 'approved':
          label = 'Approved'
          break
        case 'rejected':
          label = 'Rejected'
          break
        case 'trends':
          label = 'Trends'
          break
        default:
          // Handle dynamic segments (like team slugs, riddle slugs)
          if (i > 0) {
            const parentSegment = segments[i - 1]
            if (parentSegment === 'teams') {
              label = segment.charAt(0).toUpperCase() + segment.slice(1)
            } else if (parentSegment === 'riddles') {
              label = segment.charAt(0).toUpperCase() + segment.slice(1)
            } else {
              label = segment.charAt(0).toUpperCase() + segment.slice(1)
            }
          } else {
            label = segment.charAt(0).toUpperCase() + segment.slice(1)
          }
      }

      breadcrumbs.push({
        label,
        href,
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs(pathname)

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted) {
    return (
      <nav className={cn('flex items-center space-x-1 text-sm', className)}>
        <div className="flex items-center">
          <HomeIcon className="mr-2 h-4 w-4" />
          <span className="text-foreground font-medium">Home</span>
        </div>
      </nav>
    )
  }

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        const Icon = item.icon

        return (
          <Fragment key={item.href}>
            <div className="flex items-center">
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {isLast && !Icon ? (
                <span className="text-foreground font-medium">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className={`font-medium transition-colors ${
                    isLast
                      ? 'text-foreground hover:text-foreground/80'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </div>
            {!isLast && <Separator className="text-muted-foreground h-4 w-4" />}
          </Fragment>
        )
      })}
    </nav>
  )
}

// Alternative compact version for smaller spaces
export function CompactBreadcrumb({ className, ...props }: BreadcrumbProps) {
  return <Breadcrumb className={cn('text-xs', className)} {...props} />
}
