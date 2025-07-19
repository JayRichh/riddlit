/*
<ai_context>
Riddles navbar component for the Riddlit app.
Provides navigation and actions for the riddles section.
Updated with notification bell and dark mode toggle.
</ai_context>
*/

'use client'

import { UserButton } from '@clerk/nextjs'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { Breadcrumb } from '@/lib/components/ui/breadcrumb'
import { Button } from '@/lib/components/ui/button'
import { NotificationBell } from '@/lib/components/ui/notification-bell'
import ThemeSwitcher from '@/lib/components/utilities/theme-switcher'

export function ImprovedRiddlesNavbar() {
  return (
    <header className="border-border bg-background flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center space-x-4">
        <Breadcrumb />
      </div>

      <div className="flex items-center space-x-4">
        <Link href="/riddles/suggest">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Suggest Riddle
          </Button>
        </Link>

        <NotificationBell />
        <ThemeSwitcher />
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}
