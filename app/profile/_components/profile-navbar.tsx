'use client'

import { UserButton } from '@clerk/nextjs'
import { Bell, Plus, Settings, User } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/lib/components/ui/button'

export function ProfileNavbar() {
  return (
    <header className="border-border bg-background flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Profile</h1>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Overview
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
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
