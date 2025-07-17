'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CheckCircle, Filter, Search, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { SelectNotification } from '@/db/schema/notifications'
import {
  deleteAllReadNotifications,
  deleteNotification,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/lib/actions/db/notification-actions'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { Input } from '@/lib/components/ui/input'
import { NotificationItem } from '@/lib/components/ui/notification-item'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select'

export function NotificationsContent() {
  const [notifications, setNotifications] = useState<SelectNotification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<SelectNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const filterNotifications = React.useCallback(() => {
    let filtered = [...notifications]

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((notification) => notification.type === filterType)
    }

    // Status filter
    if (filterStatus === 'unread') {
      filtered = filtered.filter((notification) => !notification.read)
    } else if (filterStatus === 'read') {
      filtered = filtered.filter((notification) => notification.read)
    }

    setFilteredNotifications(filtered)
  }, [notifications, searchQuery, filterType, filterStatus])

  useEffect(() => {
    filterNotifications()
  }, [filterNotifications])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const result = await getUserNotifications(100, 0) // Get more notifications for full history
      if (result.isSuccess) {
        setNotifications(result.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId)
      if (result.isSuccess) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n)),
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead()
      if (result.isSuccess) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: new Date() })))
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const result = await deleteNotification(notificationId)
      if (result.isSuccess) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleDeleteAllRead = async () => {
    try {
      const result = await deleteAllReadNotifications()
      if (result.isSuccess) {
        setNotifications((prev) => prev.filter((n) => !n.read))
      }
    } catch (error) {
      console.error('Error deleting read notifications:', error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const readCount = notifications.filter((n) => n.read).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            {notifications.length > 0 && ` • ${notifications.length} total`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}

          {readCount > 0 && (
            <Button onClick={handleDeleteAllRead} variant="outline" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Read
            </Button>
          )}
        </div>
      </div>

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

            <Select value={filterType} onValueChange={setFilterType}>
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

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
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
                {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : "You'll see notifications here when you have some"}
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
                  >
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDismiss={handleDeleteNotification}
                    />
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
