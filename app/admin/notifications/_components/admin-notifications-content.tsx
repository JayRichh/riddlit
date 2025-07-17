'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  BarChart3,
  Bell,
  Filter,
  MessageSquare,
  Plus,
  Search,
  Send,
  Shield,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { NotificationEvent, NotificationType, SelectNotification } from '@/db/schema/notifications'
import {
  createSystemAnnouncement,
  createUserNotification,
  deleteNotificationAdmin,
  getAllNotifications,
  getAllUsers,
  getNotificationStats,
} from '@/lib/actions/db/admin-notification-actions'
import { Badge } from '@/lib/components/ui/badge'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { Input } from '@/lib/components/ui/input'
import { Label } from '@/lib/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select'
import { Textarea } from '@/lib/components/ui/textarea'
import { useToast } from '@/lib/hooks/use-toast'

interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
}

export function AdminNotificationsContent() {
  const [notifications, setNotifications] = useState<SelectNotification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<SelectNotification[]>([])
  const [users, setUsers] = useState<{ userId: string; displayName?: string }[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')

  // Create notification form state
  const [createForm, setCreateForm] = useState({
    type: 'admin' as NotificationType,
    event: 'announcement' as NotificationEvent,
    title: '',
    message: '',
    targetType: 'all' as 'all' | 'specific',
    targetUserIds: [] as string[],
  })

  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const [notificationsResult, usersResult, statsResult] = await Promise.all([
        getAllNotifications(100, 0),
        getAllUsers(),
        getNotificationStats(),
      ])

      if (notificationsResult.isSuccess) {
        setNotifications(notificationsResult.data)
      }

      if (usersResult.isSuccess) {
        setUsers(usersResult.data)
      }

      if (statsResult.isSuccess) {
        setStats(statsResult.data)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load admin data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const filterNotifications = React.useCallback(() => {
    let filtered = [...notifications]

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.userId.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((notification) => notification.type === typeFilter)
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter((notification) => notification.userId === userFilter)
    }

    setFilteredNotifications(filtered)
  }, [notifications, searchQuery, typeFilter, userFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    filterNotifications()
  }, [filterNotifications])

  const handleCreateNotification = async () => {
    try {
      setIsCreating(true)

      if (createForm.targetType === 'all') {
        // Send system announcement to all users
        const result = await createSystemAnnouncement(
          createForm.title,
          createForm.message,
          undefined,
          { createdBy: 'admin' },
        )

        if (result.isSuccess) {
          toast({
            title: 'Success',
            description: result.message,
          })
          setCreateForm({
            type: 'admin',
            event: 'announcement',
            title: '',
            message: '',
            targetType: 'all',
            targetUserIds: [],
          })
          fetchData()
        } else {
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
          })
        }
      } else {
        // Send to specific users
        let sent = 0
        let failed = 0

        for (const userId of createForm.targetUserIds) {
          const result = await createUserNotification(
            userId,
            createForm.type,
            createForm.event,
            createForm.title,
            createForm.message,
            { createdBy: 'admin' },
          )

          if (result.isSuccess) {
            sent++
          } else {
            failed++
          }
        }

        toast({
          title: 'Success',
          description: `Sent to ${sent} users. ${failed} failed.`,
        })

        setCreateForm({
          type: 'admin',
          event: 'announcement',
          title: '',
          message: '',
          targetType: 'all',
          targetUserIds: [],
        })
        fetchData()
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create notification. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const result = await deleteNotificationAdmin(notificationId)

      if (result.isSuccess) {
        toast({
          title: 'Success',
          description: 'Notification deleted successfully.',
        })
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete notification. Please try again.',
        variant: 'destructive',
      })
    }
  }

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
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'riddle':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'team':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'achievement':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'system':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (isLoading) {
    return <div>Loading admin notifications...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <BarChart3 className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Bell className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unread}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Notifications</CardTitle>
              <Shield className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType.admin || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Notifications</CardTitle>
              <AlertCircle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType.system || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Notification
          </CardTitle>
          <CardDescription>
            Send notifications to users or create system announcements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={createForm.type}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, type: value as NotificationType }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="riddle">Riddle</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Select
                value={createForm.targetType}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, targetType: value as 'all' | 'specific' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="specific">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={createForm.title}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter notification title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={createForm.message}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Enter notification message"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCreateNotification}
              disabled={isCreating || !createForm.title || !createForm.message}
            >
              {isCreating ? (
                <>
                  <div className="border-primary mr-2 h-4 w-4 animate-spin rounded-full border-b-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setCreateForm({
                  type: 'admin',
                  event: 'announcement',
                  title: '',
                  message: '',
                  targetType: 'all',
                  targetUserIds: [],
                })
              }
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="riddle">Riddles</SelectItem>
                <SelectItem value="team">Teams</SelectItem>
                <SelectItem value="achievement">Achievements</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.userId} value={user.userId}>
                    {user.displayName || user.userId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {filteredNotifications.length} Notification
            {filteredNotifications.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
              <Bell className="mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">No notifications found</h3>
              <p className="text-sm">
                {searchQuery || typeFilter !== 'all' || userFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first notification above'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-muted/50 p-4 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">{getTypeIcon(notification.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                          <span className="text-muted-foreground text-sm">
                            {notification.event}
                          </span>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              Unread
                            </Badge>
                          )}
                        </div>
                        <h3 className="mb-1 text-sm font-medium">{notification.title}</h3>
                        <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                          {notification.message}
                        </p>
                        <div className="text-muted-foreground flex items-center justify-between text-xs">
                          <span>User: {notification.userId}</span>
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
