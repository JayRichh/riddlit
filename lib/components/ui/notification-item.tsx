'use client'

import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

import { SelectNotification } from '@/db/schema/notifications'
import { Button } from '@/lib/components/ui/button'

interface NotificationItemProps {
  notification: SelectNotification
  onMarkAsRead: (id: string) => void
  onDismiss?: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead, onDismiss }: NotificationItemProps) {
  const isUnread = !notification.read

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id)
    }
  }

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'riddle':
        return '🧩'
      case 'team':
        return '👥'
      case 'achievement':
        return '🏆'
      case 'admin':
        return '📢'
      case 'system':
        return '⚙️'
      default:
        return '📱'
    }
  }

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'riddle':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'team':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'achievement':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'admin':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      case 'system':
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`relative cursor-pointer p-4 transition-all duration-200 ${isUnread ? 'bg-muted/50' : 'hover:bg-muted/30'} ${isUnread ? 'border-l-primary border-l-4' : ''} `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${getNotificationColor()} `}
        >
          {getNotificationIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h4
              className={`truncate text-sm font-medium ${isUnread ? 'text-foreground' : 'text-muted-foreground'} `}
            >
              {notification.title}
            </h4>
            {isUnread && <div className="bg-primary h-2 w-2 flex-shrink-0 rounded-full" />}
          </div>

          <p
            className={`mt-1 line-clamp-2 text-sm ${isUnread ? 'text-foreground' : 'text-muted-foreground'} `}
          >
            {notification.message}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>

            <div className="flex items-center gap-1">
              {isUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkAsRead(notification.id)
                  }}
                  className="hover:bg-primary/10 h-6 w-6 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}

              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDismiss(notification.id)
                  }}
                  className="hover:bg-destructive/10 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
