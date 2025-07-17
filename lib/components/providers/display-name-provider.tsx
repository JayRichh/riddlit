/*
<ai_context>
Global provider that checks if authenticated users have a display name set.
Shows the display name setup overlay if the user doesn't have one.
</ai_context>
*/

'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

import { getProfileByUserId } from '@/lib/actions/db/profiles'
import { DisplayNameSetupOverlay } from '@/lib/components/ui/display-name-setup-overlay'

interface DisplayNameProviderProps {
  children: React.ReactNode
}

export function DisplayNameProvider({ children }: DisplayNameProviderProps) {
  const { user, isLoaded } = useUser()
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    const checkDisplayName = async () => {
      if (!isLoaded || !user) return

      try {
        const result = await getProfileByUserId(user.id)

        if (result.isSuccess && result.data) {
          // Check if user has a display name set
          if (!result.data.displayName || result.data.displayName.trim() === '') {
            setShowOverlay(true)
          }
        }
      } catch (error) {
        console.error('Error checking display name:', error)
      }
    }

    checkDisplayName()
  }, [user, isLoaded])

  const handleOverlayComplete = () => {
    setShowOverlay(false)
  }

  return (
    <>
      {children}
      {showOverlay && user && (
        <DisplayNameSetupOverlay userId={user.id} onComplete={handleOverlayComplete} />
      )}
    </>
  )
}
