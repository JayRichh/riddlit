'use client'

import { Bell, MessageSquare, Shield, Trophy, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  NotificationEvent,
  NotificationType,
  SelectNotificationPreference,
} from '@/db/schema/notifications'
import {
  getUserNotificationPreferences,
  updateNotificationPreference,
} from '@/lib/actions/db/notification-actions'
// import { Button as _Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { Label } from '@/lib/components/ui/label'
import { Separator } from '@/lib/components/ui/separator'
import { Switch } from '@/lib/components/ui/switch'
import { useToast } from '@/lib/hooks/use-toast'

interface NotificationPreferencesProps {
  userId: string
}

interface PreferenceConfig {
  type: NotificationType
  event: NotificationEvent
  label: string
  description: string
}

const notificationConfigs: PreferenceConfig[] = [
  // Riddle preferences
  {
    type: 'riddle',
    event: 'riddle_created',
    label: 'New riddle created',
    description: 'Get notified when someone creates a new riddle',
  },
  {
    type: 'riddle',
    event: 'riddle_solved',
    label: 'Riddle solved',
    description: 'Get notified when someone solves your riddle',
  },
  {
    type: 'riddle',
    event: 'daily_riddle_available',
    label: 'Daily riddle available',
    description: 'Get notified when the daily riddle is available',
  },

  // Team preferences
  {
    type: 'team',
    event: 'team_join_request',
    label: 'Team invitations',
    description: 'Get notified when someone invites you to a team',
  },
  {
    type: 'team',
    event: 'team_member_joined',
    label: 'Team member joined',
    description: 'Get notified when someone joins your team',
  },
  {
    type: 'team',
    event: 'team_riddle_created',
    label: 'Team riddle created',
    description: 'Get notified when a team member creates a riddle',
  },

  // Achievement preferences
  {
    type: 'achievement',
    event: 'streak_milestone',
    label: 'Achievement earned',
    description: 'Get notified when you earn a new achievement',
  },
  {
    type: 'achievement',
    event: 'leaderboard_position',
    label: 'Leaderboard rank change',
    description: 'Get notified when your leaderboard position changes',
  },

  // Admin & System preferences
  {
    type: 'admin',
    event: 'announcement',
    label: 'Admin announcements',
    description: 'Get notified about important system announcements',
  },
  {
    type: 'system',
    event: 'feature_update',
    label: 'System updates',
    description: 'Get notified about system updates and maintenance',
  },
]

export function NotificationPreferences({ userId: _userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<SelectNotificationPreference[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingPreferences, setSavingPreferences] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const userId = _userId
  if (userId) {
    console.log('ello - userId:', userId)
  }

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      setIsLoading(true)
      const result = await getUserNotificationPreferences()
      if (result.isSuccess) {
        setPreferences(result.data)
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPreferenceKey = (type: NotificationType, event: NotificationEvent) => `${type}-${event}`

  const isPreferenceEnabled = (type: NotificationType, event: NotificationEvent): boolean => {
    const preference = preferences.find(
      (p) => p.notificationType === type && p.notificationEvent === event,
    )
    return preference?.enabled ?? true // Default to enabled if no preference found
  }

  const handlePreferenceChange = async (
    type: NotificationType,
    event: NotificationEvent,
    enabled: boolean,
  ) => {
    const key = getPreferenceKey(type, event)
    setSavingPreferences((prev) => new Set(prev).add(key))

    try {
      const result = await updateNotificationPreference(type, event, enabled)
      if (result.isSuccess) {
        // Update local state
        setPreferences((prev) => {
          const filtered = prev.filter(
            (p) => !(p.notificationType === type && p.notificationEvent === event),
          )
          return [...filtered, result.data]
        })

        toast({
          title: 'Preferences updated',
          description: 'Your notification preferences have been saved.',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update preferences. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating preference:', error)
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSavingPreferences((prev) => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }

  const groupedConfigs = notificationConfigs.reduce(
    (acc, config) => {
      if (!acc[config.type]) acc[config.type] = []
      acc[config.type].push(config)
      return acc
    },
    {} as Record<NotificationType, PreferenceConfig[]>,
  )

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'riddle':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'team':
        return <Users className="h-4 w-4 text-green-500" />
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-500" />
      case 'system':
        return <Shield className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'riddle':
        return 'Riddle Notifications'
      case 'team':
        return 'Team Notifications'
      case 'achievement':
        return 'Achievement Notifications'
      case 'admin':
        return 'Admin Notifications'
      case 'system':
        return 'System Notifications'
      default:
        return 'Notifications'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-48 animate-pulse rounded" />
                </div>
                <div className="bg-muted h-6 w-11 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Customize how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedConfigs).map(([type, configs], index) => (
            <div key={type}>
              {index > 0 && <Separator />}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(type as NotificationType)}
                  <h3 className="font-medium">{getTypeLabel(type as NotificationType)}</h3>
                </div>
                <div className="ml-6 space-y-3">
                  {configs.map((config) => {
                    const key = getPreferenceKey(config.type, config.event)
                    const isEnabled = isPreferenceEnabled(config.type, config.event)
                    const isSaving = savingPreferences.has(key)

                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor={key}>{config.label}</Label>
                          <p className="text-muted-foreground text-sm">{config.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSaving && (
                            <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2" />
                          )}
                          <Switch
                            id={key}
                            checked={isEnabled}
                            onCheckedChange={(enabled: boolean) =>
                              handlePreferenceChange(config.type, config.event, enabled)
                            }
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
