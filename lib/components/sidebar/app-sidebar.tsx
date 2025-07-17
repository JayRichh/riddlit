/*
<ai_context>
This client component provides a simplified sidebar for the app.
Updated with a cleaner design that matches Shadcn UI's minimal aesthetic.
User controls moved back to the navbar.
</ai_context>
*/

'use client'

import { useUser } from '@clerk/nextjs'
import {
  BarChart3,
  Bell,
  CheckCircle,
  Contact,
  Home,
  Puzzle,
  Settings,
  Trophy,
  User,
  Users,
  XCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { Button } from '@/lib/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/lib/components/ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()
  const [isProUser, setIsProUser] = useState(false)

  useEffect(() => {
    const checkUserMembership = async () => {
      if (user?.id) {
        const profileResult = await getProfileByUserId(user.id)
        if (profileResult.isSuccess) {
          setIsProUser(profileResult.data.membership === 'pro')
        }
      }
    }
    checkUserMembership()
  }, [user?.id])

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'Teams',
      href: '/teams',
      icon: Users,
    },
    {
      title: 'Riddles',
      href: '/riddles',
      icon: Puzzle,
    },
    {
      title: 'Leaderboard',
      href: '/leaderboard',
      icon: Trophy,
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      title: 'Contacts',
      href: '/contacts',
      icon: Contact,
    },
  ]

  const adminNavItems = [
    {
      title: 'Pending Riddles',
      href: '/admin',
      icon: Settings,
    },
    {
      title: 'Approved Riddles',
      href: '/admin/approved',
      icon: CheckCircle,
    },
    {
      title: 'Rejected Riddles',
      href: '/admin/rejected',
      icon: XCircle,
    },
    {
      title: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
  ]

  return (
    <Sidebar
      collapsible="icon"
      className="border-border bg-background shrink-0 border-r"
      {...props}
    >
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <Image
            src="/riddlix_text.png"
            alt="Riddlix Logo"
            width={128}
            onClick={() => (window.location.href = '/')}
            height={48}
            className="rounded-md transition-all duration-300 hover:translate-y-1 hover:scale-105 hover:cursor-pointer dark:invert"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <div className="space-y-1">
          <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">Navigation</p>

          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname?.startsWith(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="size-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}

          {isProUser && (
            <>
              <div className="pt-4">
                <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">Admin</p>
              </div>
              {adminNavItems.map((item) => {
                const isActive =
                  item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href)

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start gap-2 pl-6"
                    >
                      <item.icon className="size-4" />
                      {item.title}
                    </Button>
                  </Link>
                )
              })}
            </>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3"></SidebarFooter>
    </Sidebar>
  )
}
