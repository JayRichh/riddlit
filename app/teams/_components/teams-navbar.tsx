/*
<ai_context>
Teams navbar component for the Riddlix app.
Provides navigation and actions for the teams section.
</ai_context>
*/

'use client'

import { UserButton } from '@clerk/nextjs'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/lib/components/ui/button'
import { Input } from '@/lib/components/ui/input'

export function TeamsNavbar() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="border-border bg-background flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Teams</h1>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-10"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Link href="/teams/create">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </Link>

        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}
