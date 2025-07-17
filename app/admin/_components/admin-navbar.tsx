'use client'

import { UserButton } from '@clerk/nextjs'
import { Bell, CheckCircle, Database, Plus, Settings, XCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/lib/components/ui/button'

export function AdminNavbar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Pending', icon: Settings },
    { href: '/admin/approved', label: 'Approved', icon: CheckCircle },
    { href: '/admin/rejected', label: 'Rejected', icon: XCircle },
    { href: '/admin/analytics', label: 'Analytics', icon: Database },
  ]

  return (
    <header className="border-border bg-background flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Link href="/riddles/create">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Riddle
          </Button>
        </Link>

        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>

        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}
