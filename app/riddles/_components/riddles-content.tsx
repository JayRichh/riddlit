'use client'

import { formatDistanceToNow } from 'date-fns'
import { Clock, Eye, Trophy, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { SelectRiddle } from '@/db/schema/riddles'
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

interface RiddlesContentProps {
  riddles: (SelectRiddle & { responseCount: number })[]
}

export function RiddlesContent({ riddles }: RiddlesContentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')

  const filteredRiddles = riddles.filter((riddle) => {
    const matchesSearch =
      riddle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (riddle.description && riddle.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || riddle.category === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || riddle.difficulty === difficultyFilter

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const categories = [...new Set(riddles.map((r) => r.category))]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      case 'expert':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search riddles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
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
            <SelectTrigger className="w-[130px]">
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
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {filteredRiddles.length} riddle{filteredRiddles.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Riddles grid */}
      {filteredRiddles.length === 0 ? (
        <div className="flex h-96 items-center justify-center">
          <p className="text-muted-foreground">No riddles found matching your criteria.</p>
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
                <CardTitle className="line-clamp-2 text-lg">{riddle.title}</CardTitle>
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
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(riddle.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/riddles/${riddle.slug}`}>
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
