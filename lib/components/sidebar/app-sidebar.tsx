/*
<ai_context>
This client component provides a simplified sidebar for the app.
Updated with a cleaner design that matches Shadcn UI's minimal aesthetic.
User controls moved back to the navbar.
</ai_context>
*/

'use client'

import { useUser } from '@clerk/nextjs'
import { Contact, Crown, Home, Puzzle, Trophy, User, Users } from 'lucide-react'
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
      title: 'Admin',
      href: '/admin',
      icon: Crown,
    },
  ]

  return (
    <Sidebar
      collapsible="icon"
      className="border-border bg-background shrink-0 border-r"
      {...props}
    >
      <SidebarHeader className="p-3">
        <div className="flex items-center px-2 py-1">
          <div className="flex items-center gap-2">
            <Image
              src="/riddlix_logo.png"
              alt="Riddlix Logo"
              width={24}
              height={24}
              className="rounded-md dark:invert"
            />
            <div className="text-sm font-semibold">Riddlix</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
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
                const isActive = pathname?.startsWith(item.href)

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
            </>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3"></SidebarFooter>
    </Sidebar>
  )
}
