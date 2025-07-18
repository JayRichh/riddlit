'use client'

import { ChevronDown, Globe, Users } from 'lucide-react'
import { useState } from 'react'

import { SelectTeam } from '@/db/schema/teams'
import { useViewPersistence } from '@/lib/hooks/use-user-preferences'
import { cn } from '@/lib/utils'

interface RefinedViewSelectorProps {
  view: 'public' | 'team'
  onViewChange: (view: 'public' | 'team') => void
  teams: (SelectTeam & { memberCount: number; role: string })[]
  selectedTeamId: string | null
  onTeamChange: (teamId: string | null) => void
}

export function RefinedViewSelector({
  view,
  onViewChange,
  teams,
  selectedTeamId,
  onTeamChange,
}: RefinedViewSelectorProps) {
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false)

  const handleViewChange = (newView: 'public' | 'team') => {
    onViewChange(newView)
    // Default to "All My Teams" (null) instead of first team
    if (newView === 'team' && teams.length > 0 && selectedTeamId === undefined) {
      onTeamChange(null)
    }
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  return (
    <div className="flex items-center gap-3">
      {/* Clean Toggle Buttons - Teams first (default) */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleViewChange('team')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
            view === 'team'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          )}
        >
          <Users className="h-4 w-4" />
          Teams
        </button>
        <button
          onClick={() => handleViewChange('public')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
            view === 'public'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          )}
        >
          <Globe className="h-4 w-4" />
          Public
        </button>
      </div>

      {/* Team Selector */}
      {view === 'team' && teams.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
            className="border-border/40 bg-background/80 hover:bg-background flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
          >
            <span className="max-w-32 truncate">
              {selectedTeam ? selectedTeam.name : 'All My Teams'}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isTeamDropdownOpen && 'rotate-180',
              )}
            />
          </button>

          {isTeamDropdownOpen && (
            <div className="border-border/40 bg-background/95 absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border shadow-lg backdrop-blur-sm">
              <div className="p-1">
                <button
                  onClick={() => {
                    onTeamChange(null)
                    setIsTeamDropdownOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    !selectedTeamId
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted/80 text-foreground',
                  )}
                >
                  <Users className="h-4 w-4" />
                  All My Teams
                </button>

                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => {
                      onTeamChange(team.id)
                      setIsTeamDropdownOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                      selectedTeamId === team.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted/80 text-foreground',
                    )}
                  >
                    <span className="truncate">{team.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {team.memberCount} members
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state for teams */}
      {view === 'team' && teams.length === 0 && (
        <div className="text-muted-foreground px-3 py-2 text-sm">No teams joined yet</div>
      )}
    </div>
  )
}
