'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { SelectNotification } from '@/db/schema/notifications'
import {
  getUnreadNotificationCount,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/lib/actions/db/notification-actions'
import { Badge } from '@/lib/components/ui/badge'
import { Button } from '@/lib/components/ui/button'
import { NotificationItem } from '@/lib/components/ui/notification-item'
import { Separator } from '@/lib/components/ui/separator'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<SelectNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch unread count on mount and set up polling
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications()
    }
  }, [isOpen, notifications.length])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest('[data-notification-dropdown]')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const fetchUnreadCount = async () => {
    try {
      const result = await getUnreadNotificationCount()
      if (result.isSuccess) {
        setUnreadCount(result.data)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const result = await getUnreadNotifications()
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
        setUnreadCount((prev) => Math.max(0, prev - 1))
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
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return (
    <div className="relative" data-notification-dropdown>
      <Button
        variant="ghost"
        size="icon"
        className={`relative ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="absolute -top-1 -right-1"
            >
              <Badge
                variant="destructive"
                className="flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-background absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border shadow-lg"
          >
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
                  <Bell className="mb-2 h-8 w-8" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-sm"
                    onClick={() => {
                      setIsOpen(false)
                      window.location.href = '/notifications'
                    }}
                  >
                    View all notifications
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
