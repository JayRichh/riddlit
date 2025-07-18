'use client'

import { useEffect, useState } from 'react'

interface UserPreferences {
  riddlesView: 'public' | 'team'
  selectedTeamId: string | null
  filterPreferences: {
    category: string
    difficulty: string
    showExpired: boolean
  }
  uiPreferences: {
    gridView: boolean
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
}

const defaultPreferences: UserPreferences = {
  riddlesView: 'team', // Changed from 'public' to 'team'
  selectedTeamId: null, // Default to "All My Teams"
  filterPreferences: {
    category: 'all',
    difficulty: 'all',
    showExpired: false,
  },
  uiPreferences: {
    gridView: true,
    sortBy: 'availableFrom',
    sortOrder: 'desc',
  },
}

const STORAGE_KEY = 'riddlix-user-preferences'

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to handle new preference additions
        setPreferences({ ...defaultPreferences, ...parsed })
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
      } catch (error) {
        console.warn('Failed to save user preferences:', error)
      }
    }
  }, [preferences, isLoaded])

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }))
  }

  const updateRiddlesView = (view: 'public' | 'team') => {
    setPreferences((prev) => ({ ...prev, riddlesView: view }))
  }

  const updateSelectedTeamId = (teamId: string | null) => {
    setPreferences((prev) => ({ ...prev, selectedTeamId: teamId }))
  }

  const updateFilterPreferences = (filters: Partial<UserPreferences['filterPreferences']>) => {
    setPreferences((prev) => ({
      ...prev,
      filterPreferences: { ...prev.filterPreferences, ...filters },
    }))
  }

  const updateUIPreferences = (ui: Partial<UserPreferences['uiPreferences']>) => {
    setPreferences((prev) => ({
      ...prev,
      uiPreferences: { ...prev.uiPreferences, ...ui },
    }))
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
  }

  return {
    preferences,
    isLoaded,
    updatePreferences,
    updateRiddlesView,
    updateSelectedTeamId,
    updateFilterPreferences,
    updateUIPreferences,
    resetPreferences,
  }
}

// Hook specifically for view selector persistence
export function useViewPersistence() {
  const { preferences, isLoaded, updateRiddlesView, updateSelectedTeamId } = useUserPreferences()

  return {
    view: preferences.riddlesView,
    selectedTeamId: preferences.selectedTeamId,
    isLoaded,
    setView: updateRiddlesView,
    setSelectedTeamId: updateSelectedTeamId,
  }
}
