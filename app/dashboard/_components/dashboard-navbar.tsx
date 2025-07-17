/*
<ai_context>
Dashboard navbar component for the Riddlix app.
Provides navigation and user controls for the dashboard section.
</ai_context>
*/

'use client'

import { UserButton } from '@clerk/nextjs'
import { Bell, Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/lib/components/ui/button'

export function DashboardNavbar() {
  return (
    <header className="border-border bg-background flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <Link href="/riddles/suggest">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Suggest Riddle
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
