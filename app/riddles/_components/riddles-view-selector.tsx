'use client'

import { Globe, Users } from 'lucide-react'

import { SelectTeam } from '@/db/schema/teams'
import { Button } from '@/lib/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select'

interface RiddlesViewSelectorProps {
  view: 'public' | 'team'
  onViewChange: (view: 'public' | 'team') => void
  teams: (SelectTeam & { memberCount: number; role: string })[]
  selectedTeamId: string | null
  onTeamChange: (teamId: string | null) => void
}

export function RiddlesViewSelector({
  view,
  onViewChange,
  teams,
  selectedTeamId,
  onTeamChange,
}: RiddlesViewSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant={view === 'public' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('public')}
          className="gap-2"
        >
          <Globe className="h-4 w-4" />
          Public Riddles
        </Button>
        <Button
          variant={view === 'team' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('team')}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Team Riddles
        </Button>
      </div>

      {view === 'team' && teams.length > 0 && (
        <Select
          value={selectedTeamId || 'all'}
          onValueChange={(value) => onTeamChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All My Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name} ({team.memberCount} members)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
