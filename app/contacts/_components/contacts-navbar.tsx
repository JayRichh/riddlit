/*
<ai_context>
Contacts navbar component for the Riddlit app.
Provides navigation and actions for the contacts section.
Updated with notification bell (already has dark mode toggle).
</ai_context>
*/

'use client'

import { UserButton } from '@clerk/nextjs'
import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Breadcrumb } from '@/lib/components/ui/breadcrumb'
import { Button } from '@/lib/components/ui/button'
import { NotificationBell } from '@/lib/components/ui/notification-bell'
import { useSidebar } from '@/lib/components/ui/sidebar'
import ThemeSwitcher from '@/lib/components/utilities/theme-switcher'

export function ContactsNavbar() {
  const { toggleSidebar } = useSidebar()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 w-full ${
        isScrolled ? 'border-border bg-background/90 border-b backdrop-blur-xs' : 'bg-background'
      } transition-colors duration-200`}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 md:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          <div className="flex items-center gap-2">
            <Breadcrumb />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <NotificationBell />
          <ThemeSwitcher />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
