/*
<ai_context>
Admin subnav component for the Riddlit app.
Provides hierarchical navigation with indented children for different admin sections.
Shows current context and view with clean, seamless design.
</ai_context>
*/

'use client'

import {
  BarChart3,
  Bell,
  CheckCircle,
  ChevronRight,
  Database,
  FileText,
  Settings,
  Users,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Badge } from '@/lib/components/ui/badge'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

export function AdminSubnav() {
  const pathname = usePathname()

  const navSections: NavSection[] = [
    {
      title: 'Content Management',
      items: [
        {
          href: '/admin',
          label: 'Pending Riddles',
          icon: Settings,
          badge: 'review',
        },
        {
          href: '/admin/approved',
          label: 'Approved Riddles',
          icon: CheckCircle,
        },
        {
          href: '/admin/rejected',
          label: 'Rejected Riddles',
          icon: XCircle,
        },
      ],
    },
    {
      title: 'System Management',
      items: [
        {
          href: '/admin/notifications',
          label: 'Notifications',
          icon: Bell,
          children: [
            {
              href: '/admin/notifications/debug',
              label: 'Debug Notifications',
              icon: FileText,
            },
            {
              href: '/admin/notifications/announcements',
              label: 'Announcements',
              icon: Users,
            },
          ],
        },
        {
          href: '/admin/analytics',
          label: 'Analytics',
          icon: BarChart3,
          children: [
            {
              href: '/admin/analytics/riddles',
              label: 'Riddle Analytics',
              icon: Database,
            },
            {
              href: '/admin/analytics/users',
              label: 'User Analytics',
              icon: Users,
            },
          ],
        },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const isParentActive = (item: NavItem) => {
    if (isActive(item.href)) return true
    return item.children?.some((child) => isActive(child.href)) || false
  }

  const getCurrentBreadcrumb = () => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (isActive(item.href)) {
          if (item.children) {
            const activeChild = item.children.find((child) => isActive(child.href))
            if (activeChild) {
              return `${section.title} → ${item.label} → ${activeChild.label}`
            }
          }
          return `${section.title} → ${item.label}`
        }
      }
    }
    return 'Admin Panel'
  }

  return (
    <div className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
      {/* Breadcrumb */}
      <div className="border-border/50 border-b px-6 py-3">
        <div className="text-muted-foreground flex items-center text-sm">
          <span className="font-medium">Admin Panel</span>
          <ChevronRight className="mx-2 h-3 w-3" />
          <span className="text-foreground">
            {getCurrentBreadcrumb().split(' → ').slice(1).join(' → ')}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4">
        <div className="flex flex-col space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  const parentActive = isParentActive(item)

                  return (
                    <div key={item.href} className="space-y-1">
                      {/* Main Navigation Item */}
                      <Link
                        href={item.href}
                        className={cn(
                          'hover:bg-accent/50 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                          active && 'bg-accent text-accent-foreground shadow-sm',
                          parentActive && !active && 'bg-accent/30 text-accent-foreground/80',
                        )}
                      >
                        <Icon className={cn('h-4 w-4', active && 'text-accent-foreground')} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="h-5 px-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {item.children && (
                          <ChevronRight
                            className={cn(
                              'h-3 w-3 transition-transform',
                              parentActive && 'rotate-90',
                            )}
                          />
                        )}
                      </Link>

                      {/* Child Navigation Items */}
                      {item.children && parentActive && (
                        <div className="ml-6 space-y-1">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon
                            const childActive = isActive(child.href)

                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                  'hover:bg-accent/50 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                                  'hover:border-accent/50 border-l-2 border-transparent',
                                  childActive &&
                                    'bg-accent text-accent-foreground border-l-accent shadow-sm',
                                )}
                              >
                                <ChildIcon
                                  className={cn('h-3 w-3', childActive && 'text-accent-foreground')}
                                />
                                <span className="flex-1">{child.label}</span>
                                {child.badge && (
                                  <Badge variant="secondary" className="h-5 px-2 text-xs">
                                    {child.badge}
                                  </Badge>
                                )}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
