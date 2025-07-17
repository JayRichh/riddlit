'use client'

import { formatDistanceToNow } from 'date-fns'
import { Clock, Eye, Filter, Search, Trophy, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { SelectRiddle } from '@/db/schema/riddles'
import { SelectTeam } from '@/db/schema/teams'
import { Badge } from '@/lib/components/ui/badge'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { Input } from '@/lib/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select'

import { RefinedViewSelector } from './refined-view-selector'

interface ImprovedRiddlesContentProps {
  publicRiddles: (SelectRiddle & { responseCount: number })[]
  teamRiddles: (SelectRiddle & { responseCount: number })[]
  userTeams: (SelectTeam & { memberCount: number; role: string })[]
}

export function ImprovedRiddlesContent({
  publicRiddles,
  teamRiddles,
  userTeams,
}: ImprovedRiddlesContentProps) {
  const [view, setView] = useState<'public' | 'team'>('public')
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Get the current riddles based on view
  const currentRiddles = useMemo(() => {
    if (view === 'public') {
      return publicRiddles
    } else {
      if (selectedTeamId) {
        return teamRiddles.filter((riddle) => riddle.teamId === selectedTeamId)
      }
      return teamRiddles
    }
  }, [view, selectedTeamId, publicRiddles, teamRiddles])

  // Filter riddles based on search and filters
  const filteredRiddles = useMemo(() => {
    return currentRiddles.filter((riddle) => {
      const matchesSearch =
        riddle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (riddle.description && riddle.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = categoryFilter === 'all' || riddle.category === categoryFilter
      const matchesDifficulty = difficultyFilter === 'all' || riddle.difficulty === difficultyFilter

      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [currentRiddles, searchTerm, categoryFilter, difficultyFilter])

  // Get unique categories from current riddles
  const categories = useMemo(() => {
    return [...new Set(currentRiddles.map((r) => r.category))]
  }, [currentRiddles])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'expert':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTimeRemaining = (availableUntil: Date) => {
    const now = new Date()
    const expires = new Date(availableUntil)
    const remaining = expires.getTime() - now.getTime()

    if (remaining <= 0) return 'Expired'

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getViewTitle = () => {
    if (view === 'public') {
      return 'Public Riddles'
    } else {
      if (selectedTeamId) {
        const team = userTeams.find((t) => t.id === selectedTeamId)
        return `${team?.name} Riddles`
      }
      return 'Team Riddles'
    }
  }

  const getViewDescription = () => {
    if (view === 'public') {
      return 'Active riddles available to all users'
    } else {
      if (selectedTeamId) {
        return 'Riddles created specifically for your team'
      }
      return 'Riddles from all your teams'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with view selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{getViewTitle()}</h1>
          <p className="text-muted-foreground">{getViewDescription()}</p>
        </div>
        <RefinedViewSelector
          view={view}
          onViewChange={setView}
          teams={userTeams}
          selectedTeamId={selectedTeamId}
          onTeamChange={setSelectedTeamId}
        />
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search riddles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="text-muted-foreground text-sm">
          {filteredRiddles.length} riddle{filteredRiddles.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Collapsible filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border p-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-36">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCategoryFilter('all')
              setDifficultyFilter('all')
              setSearchTerm('')
            }}
            className="text-muted-foreground"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Riddles grid */}
      {filteredRiddles.length === 0 ? (
        <div className="flex h-96 items-center justify-center">
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground">No riddles found matching your criteria.</p>
            {view === 'team' && userTeams.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Join a team to see team riddles, or switch to public riddles.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRiddles.map((riddle) => (
            <Card key={riddle.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={getDifficultyColor(riddle.difficulty)}>
                    {riddle.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {riddle.category}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-lg">
                  <Link
                    href={`/riddles/${riddle.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {riddle.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {riddle.description || riddle.question}
                </CardDescription>
              </CardHeader>

              {/* Image preview */}
              {riddle.imageUrl && (
                <div className="relative mx-4 mb-4 h-48 overflow-hidden rounded-lg">
                  <Image
                    src={riddle.imageUrl}
                    alt={riddle.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}

              <CardContent className="space-y-3">
                <div className="text-muted-foreground flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    {riddle.basePoints} points
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="capitalize">{riddle.answerType.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="text-muted-foreground flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {riddle.responseCount} responses
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {getTimeRemaining(riddle.availableUntil)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(riddle.createdAt), { addSuffix: true })}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/riddles/${riddle.slug}`}>
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
