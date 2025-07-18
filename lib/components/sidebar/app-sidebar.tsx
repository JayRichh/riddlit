/*
<ai_context>
Enhanced sidebar component with hierarchical navigation, collapsible groups, and smooth animations.
Features: Toggle button, subroute detection, cursor pointer styling, fade animations, icon-only view.
Optimized with React.memo, localStorage persistence, and proper memoization for performance.
</ai_context>
*/

'use client'

import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Bell,
  CheckCircle,
  ChevronRight,
  Contact,
  Home,
  Menu,
  MessageCircle,
  Plus,
  Puzzle,
  Settings,
  TrendingUp,
  Trophy,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { getUnreadNotificationCount } from '@/lib/actions/db/notification-actions'
import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { Button } from '@/lib/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/lib/components/ui/sidebar'

interface NavigationItem {
  title: string
  href: string
  icon: React.ElementType
  children?: NavigationItem[]
  badge?: number
}

interface NavigationGroup {
  title: string
  items: NavigationItem[]
  defaultOpen?: boolean
  requiresProUser?: boolean
}

// Custom hook for state persistence with localStorage - hydration-safe
const usePersistedState = <T,>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prevState: T) => T)) => void] => {
  const [state, setState] = useState<T>(defaultValue)

  // Handle hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key)
        if (item) {
          setState(JSON.parse(item))
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error)
      }
    }
  }, [key])

  const setPersistedState = useCallback(
    (value: T | ((prevState: T) => T)) => {
      try {
        setState((prevState) => {
          const valueToStore = value instanceof Function ? value(prevState) : value
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
          }
          return valueToStore
        })
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key],
  )

  return [state, setPersistedState]
}

// Memoized navigation item component
const NavigationItemComponent = memo(
  ({
    item,
    level,
    pathname,
    isCollapsed,
    expandedItems,
    toggleItem,
  }: {
    item: NavigationItem
    level: number
    pathname: string
    isCollapsed: boolean
    expandedItems: Record<string, boolean>
    toggleItem: (itemTitle: string) => void
  }) => {
    const isActive = useMemo(() => {
      if (item.href === '/dashboard') {
        return pathname === '/dashboard'
      }
      return pathname?.startsWith(item.href)
    }, [item.href, pathname])

    const isParentActive = useMemo(() => {
      if (isActive) return true
      if (item.children) {
        return item.children.some((child) => {
          if (child.href === '/dashboard') {
            return pathname === '/dashboard'
          }
          return pathname?.startsWith(child.href)
        })
      }
      return false
    }, [item.children, pathname, isActive])

    const hasChildren = useMemo(() => item.children && item.children.length > 0, [item.children])
    const isExpanded = expandedItems[item.title.toLowerCase()]
    const IconComponent = item.icon

    const handleToggle = useCallback(() => {
      toggleItem(item.title)
    }, [item.title, toggleItem])

    return (
      <div className="space-y-1">
        <div className="flex items-center">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="h-8 w-6 shrink-0 cursor-pointer p-0 hover:bg-transparent"
            >
              <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </Button>
          ) : (
            <div className="w-6 shrink-0" />
          )}
          <Link href={item.href} className="min-w-0 flex-1" prefetch={true}>
            <motion.div
              whileHover={{ opacity: 0.95 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                className={`w-full cursor-pointer justify-start gap-2 ${level === 0 ? 'pl-2' : `pl-${Math.min(2 + level * 2, 8)}`} ${isParentActive && !isActive ? 'bg-muted/50' : ''} hover:bg-muted/70 transition-all duration-200`}
                style={{ paddingLeft: level === 0 ? '0.5rem' : `${0.5 + level * 0.75}rem` }}
              >
                <IconComponent className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
                {item.badge && (
                  <span className="bg-primary text-primary-foreground ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs">
                    {item.badge}
                  </span>
                )}
              </Button>
            </motion.div>
          </Link>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6 space-y-1 overflow-hidden">
            {item.children?.map((child) => (
              <NavigationItemComponent
                key={child.href}
                item={child}
                level={level + 1}
                pathname={pathname}
                isCollapsed={isCollapsed}
                expandedItems={expandedItems}
                toggleItem={toggleItem}
              />
            ))}
          </div>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison for better memoization
    return (
      prevProps.item.href === nextProps.item.href &&
      prevProps.item.title === nextProps.item.title &&
      prevProps.level === nextProps.level &&
      prevProps.pathname === nextProps.pathname &&
      prevProps.isCollapsed === nextProps.isCollapsed &&
      prevProps.expandedItems[prevProps.item.title.toLowerCase()] ===
        nextProps.expandedItems[nextProps.item.title.toLowerCase()] &&
      prevProps.toggleItem === nextProps.toggleItem
    )
  },
)

NavigationItemComponent.displayName = 'NavigationItemComponent'

// Memoized navigation group component
const NavigationGroupComponent = memo(
  ({
    group,
    isProUser,
    isCollapsed,
    expandedGroups,
    toggleGroup,
    pathname,
    expandedItems,
    toggleItem,
  }: {
    group: NavigationGroup
    isProUser: boolean
    isCollapsed: boolean
    expandedGroups: Record<string, boolean>
    toggleGroup: (groupTitle: string) => void
    pathname: string
    expandedItems: Record<string, boolean>
    toggleItem: (itemTitle: string) => void
  }) => {
    if (group.requiresProUser && !isProUser) return null

    const isExpanded = expandedGroups[group.title.toLowerCase()]

    const handleToggle = useCallback(() => {
      toggleGroup(group.title)
    }, [group.title, toggleGroup])

    return (
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="hover:bg-muted/50 h-auto w-full cursor-pointer justify-start gap-2 px-2 py-1.5"
        >
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="h-3 w-3" />
          </motion.div>
          {!isCollapsed && (
            <p className="text-muted-foreground text-xs font-medium">{group.title}</p>
          )}
        </Button>

        {isExpanded && (
          <div className="space-y-1 overflow-hidden">
            {group.items.map((item) => (
              <NavigationItemComponent
                key={item.href}
                item={item}
                level={0}
                pathname={pathname}
                isCollapsed={isCollapsed}
                expandedItems={expandedItems}
                toggleItem={toggleItem}
              />
            ))}
          </div>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison for better memoization - avoid expensive JSON.stringify
    const groupKey = prevProps.group.title.toLowerCase()
    return (
      prevProps.group.title === nextProps.group.title &&
      prevProps.isProUser === nextProps.isProUser &&
      prevProps.isCollapsed === nextProps.isCollapsed &&
      prevProps.pathname === nextProps.pathname &&
      prevProps.expandedGroups[groupKey] === nextProps.expandedGroups[groupKey] &&
      prevProps.toggleGroup === nextProps.toggleGroup &&
      prevProps.toggleItem === nextProps.toggleItem &&
      Object.keys(prevProps.expandedItems).length === Object.keys(nextProps.expandedItems).length &&
      Object.keys(prevProps.expandedItems).every(
        (key) => prevProps.expandedItems[key] === nextProps.expandedItems[key],
      )
    )
  },
)

NavigationGroupComponent.displayName = 'NavigationGroupComponent'

export const AppSidebar = memo(
  ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const pathname = usePathname()
    const { user } = useUser()
    const [isProUser, setIsProUser] = useState(false)
    const [notificationCount, setNotificationCount] = useState(0)
    const [isCollapsed, setIsCollapsed] = usePersistedState('sidebar-collapsed', false)
    const [expandedGroups, setExpandedGroups] = usePersistedState('sidebar-expanded-groups', {
      main: true,
      personal: true,
      admin: true,
    })
    const [expandedItems, setExpandedItems] = usePersistedState('sidebar-expanded-items', {})

    // Static navigation groups to prevent recreation on every render
    const navigationGroups = useMemo(
      (): NavigationGroup[] => [
        {
          title: 'Main',
          defaultOpen: true,
          items: [
            {
              title: 'Dashboard',
              href: '/dashboard',
              icon: Home,
            },
            {
              title: 'Teams',
              href: '/teams',
              icon: Users,
              children: [
                { title: 'Browse Teams', href: '/teams', icon: Users },
                { title: 'Create Team', href: '/teams/create', icon: Plus },
              ],
            },
            {
              title: 'Riddles',
              href: '/riddles',
              icon: Puzzle,
              children: [
                { title: 'Browse Riddles', href: '/riddles', icon: Puzzle },
                { title: 'Create Riddle', href: '/riddles/create', icon: Plus },
                { title: 'Suggest Riddle', href: '/riddles/suggest', icon: MessageCircle },
              ],
            },
            {
              title: 'Leaderboard',
              href: '/leaderboard',
              icon: Trophy,
              children: [
                { title: 'Overall', href: '/leaderboard', icon: Trophy },
                { title: 'Teams', href: '/leaderboard/teams', icon: Users },
                { title: 'Trends', href: '/leaderboard/trends', icon: TrendingUp },
              ],
            },
          ],
        },
        {
          title: 'Personal',
          defaultOpen: true,
          items: [
            {
              title: 'Profile',
              href: '/profile',
              icon: User,
              children: [
                { title: 'Overview', href: '/profile', icon: User },
                { title: 'Settings', href: '/profile/settings', icon: Settings },
              ],
            },
            { title: 'Contacts', href: '/contacts', icon: Contact },
            {
              title: 'Notifications',
              href: '/notifications',
              icon: Bell,
              badge: notificationCount > 0 ? notificationCount : undefined,
            },
          ],
        },
        {
          title: 'Admin',
          defaultOpen: true,
          requiresProUser: true,
          items: [
            {
              title: 'Content Management',
              href: '/admin',
              icon: Settings,
              children: [
                { title: 'Pending Riddles', href: '/admin', icon: Settings },
                { title: 'Approved Riddles', href: '/admin/approved', icon: CheckCircle },
                { title: 'Rejected Riddles', href: '/admin/rejected', icon: XCircle },
                { title: 'Riddle Requests', href: '/admin/riddle-requests', icon: MessageCircle },
              ],
            },
            { title: 'Notifications', href: '/admin/notifications', icon: Bell },
            { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
          ],
        },
      ],
      [notificationCount],
    )

    // Memoized callbacks to prevent recreation
    const toggleGroup = useCallback(
      (groupTitle: string) => {
        setExpandedGroups((prev) => ({
          ...prev,
          [groupTitle.toLowerCase()]: !prev[groupTitle.toLowerCase() as keyof typeof prev],
        }))
      },
      [setExpandedGroups],
    )

    const toggleItem = useCallback(
      (itemTitle: string) => {
        setExpandedItems((prev) => ({
          ...prev,
          [itemTitle.toLowerCase()]: !(prev as Record<string, boolean>)[itemTitle.toLowerCase()],
        }))
      },
      [setExpandedItems],
    )

    const handleSidebarToggle = useCallback(() => {
      setIsCollapsed(!isCollapsed)
    }, [isCollapsed, setIsCollapsed])

    // Optimized user profile check with caching to prevent re-renders
    useEffect(() => {
      let isMounted = true

      const checkUserMembership = async () => {
        if (!user?.id) return

        try {
          const profileResult = await getProfileByUserId(user.id)
          if (profileResult.isSuccess && isMounted) {
            const isPro = profileResult.data.membership === 'pro'
            setIsProUser(isPro)
          }
        } catch (error) {
          console.warn('Error checking user membership:', error)
        }
      }

      checkUserMembership()

      return () => {
        isMounted = false
      }
    }, [user?.id])

    // Fetch notification count
    useEffect(() => {
      let isMounted = true

      const fetchNotificationCount = async () => {
        if (!user?.id) return

        try {
          const result = await getUnreadNotificationCount()
          if (result.isSuccess && isMounted) {
            setNotificationCount(result.data)
          }
        } catch (error) {
          console.warn('Error fetching notification count:', error)
        }
      }

      fetchNotificationCount()

      // Set up polling for notification count
      const interval = setInterval(fetchNotificationCount, 30000) // Poll every 30 seconds

      return () => {
        isMounted = false
        clearInterval(interval)
      }
    }, [user?.id])

    return (
      <Sidebar
        collapsible="icon"
        className="border-border bg-background relative shrink-0 border-r"
        {...props}
      >
        {/* Toggle Button */}
        <motion.div
          className="absolute top-4 right-4 z-10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSidebarToggle}
            className="hover:bg-muted/70 h-8 w-8 cursor-pointer p-0"
          >
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </motion.div>
          </Button>
        </motion.div>

        <SidebarHeader className="p-3 pr-12">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/riddlix_text.png"
              alt="Riddlix Logo"
              width={isCollapsed ? 32 : 128}
              height={isCollapsed ? 32 : 48}
              onClick={() => (window.location.href = '/')}
              className="cursor-pointer rounded-md transition-all duration-300 hover:translate-y-1 hover:scale-105 dark:invert"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </motion.div>
        </SidebarHeader>

        <SidebarContent className="px-3">
          <div className="space-y-4">
            {navigationGroups.map((group) => (
              <NavigationGroupComponent
                key={group.title}
                group={group}
                isProUser={isProUser}
                isCollapsed={isCollapsed}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
                pathname={pathname}
                expandedItems={expandedItems}
                toggleItem={toggleItem}
              />
            ))}
          </div>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <motion.div
            className="text-muted-foreground text-center text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {!isCollapsed && 'Riddlix v1.0'}
          </motion.div>
        </SidebarFooter>
      </Sidebar>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison for AppSidebar memoization - avoid expensive JSON.stringify
    return (
      Object.keys(prevProps).length === Object.keys(nextProps).length &&
      Object.keys(prevProps).every(
        (key) =>
          prevProps[key as keyof typeof prevProps] === nextProps[key as keyof typeof nextProps],
      )
    )
  },
)

AppSidebar.displayName = 'AppSidebar'
