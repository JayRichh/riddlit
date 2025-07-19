/*
<ai_context>
Riddles navbar component for the Riddlit app.
Provides navigation and actions for the riddles section.
</ai_context>
*/

'use client'

import { UserButton } from '@clerk/nextjs'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/lib/components/ui/button'
import { Input } from '@/lib/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select'

export function RiddlesNavbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')

  return (
    <header className="border-border bg-background flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Riddles</h1>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search riddles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="logic">Logic</SelectItem>
            <SelectItem value="math">Math</SelectItem>
            <SelectItem value="wordplay">Wordplay</SelectItem>
            <SelectItem value="trivia">Trivia</SelectItem>
            <SelectItem value="visual">Visual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-4">
        <Link href="/riddles/suggest">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Suggest Riddle
          </Button>
        </Link>

        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}
