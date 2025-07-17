/*
<ai_context>
Global overlay component that prompts new users to set their display name.
Shows on all authenticated pages until the user sets a display name.
</ai_context>
*/

'use client'

import { Sparkles, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { updateProfile } from '@/lib/actions/db/profiles'
import { Button } from '@/lib/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'
import { Input } from '@/lib/components/ui/input'
import { Label } from '@/lib/components/ui/label'

interface DisplayNameSetupOverlayProps {
  userId: string
  onComplete: () => void
}

export function DisplayNameSetupOverlay({ userId, onComplete }: DisplayNameSetupOverlayProps) {
  const [displayName, setDisplayName] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!displayName.trim()) {
      toast.error('Please enter a display name')
      return
    }

    startTransition(async () => {
      try {
        const result = await updateProfile(userId, { displayName: displayName.trim() })

        if (result.isSuccess) {
          toast.success('Display name set successfully!')
          onComplete()
          router.refresh()
        } else {
          toast.error(result.message || 'Failed to set display name')
        }
      } catch (error) {
        console.error('Error setting display name:', error)
        toast.error('Failed to set display name')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <User className="text-primary h-12 w-12" />
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Riddlix!</CardTitle>
          <CardDescription>
            Let&apos;s set up your profile. What would you like to be called?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
                disabled={isPending}
                autoFocus
              />
              <p className="text-muted-foreground text-sm">
                This is how other users will see you on the platform
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <Button type="submit" disabled={isPending || !displayName.trim()} className="w-full">
                {isPending ? 'Setting up...' : 'Continue'}
              </Button>
              <p className="text-muted-foreground text-center text-xs">
                You can change this later in your profile settings
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
