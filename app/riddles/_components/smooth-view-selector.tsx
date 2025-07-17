'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Globe, Users } from 'lucide-react'
import { useState } from 'react'

import { SelectTeam } from '@/db/schema/teams'
import { cn } from '@/lib/utils'

interface SmoothViewSelectorProps {
  view: 'public' | 'team'
  onViewChange: (view: 'public' | 'team') => void
  teams: (SelectTeam & { memberCount: number; role: string })[]
  selectedTeamId: string | null
  onTeamChange: (teamId: string | null) => void
}

export function SmoothViewSelector({
  view,
  onViewChange,
  teams,
  selectedTeamId,
  onTeamChange,
}: SmoothViewSelectorProps) {
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false)

  const handleViewChange = (newView: 'public' | 'team') => {
    onViewChange(newView)
    if (newView === 'team' && teams.length > 0 && !selectedTeamId) {
      onTeamChange(teams[0].id)
    }
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  return (
    <div className="flex items-center gap-2">
      {/* View Toggle */}
      <div className="bg-muted relative inline-flex items-center rounded-full p-1">
        <motion.div
          className="bg-background absolute inset-y-1 rounded-full shadow-sm"
          initial={false}
          animate={{
            x: view === 'public' ? 4 : '50%',
            width: view === 'public' ? 'calc(50% - 4px)' : 'calc(50% - 4px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />

        <button
          onClick={() => handleViewChange('public')}
          className={cn(
            'relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200',
            view === 'public' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Globe className="h-4 w-4" />
          Public
        </button>

        <button
          onClick={() => handleViewChange('team')}
          className={cn(
            'relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200',
            view === 'team' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Users className="h-4 w-4" />
          Teams
        </button>
      </div>

      {/* Team Selector */}
      <AnimatePresence mode="wait">
        {view === 'team' && teams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto' }}
            exit={{ opacity: 0, x: -20, width: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="relative"
          >
            <button
              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
              className="border-border/40 bg-background/60 hover:bg-background/80 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            >
              <span className="max-w-32 truncate">
                {selectedTeam ? selectedTeam.name : 'All Teams'}
              </span>
              <motion.div
                animate={{ rotate: isTeamDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isTeamDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="border-border/40 bg-background/95 absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border shadow-lg backdrop-blur-sm"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state for teams */}
      {view === 'team' && teams.length === 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-sm"
        >
          No teams joined yet
        </motion.div>
      )}
    </div>
  )
}
