import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProfileSettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Coming Soon</h2>
          <p className="text-muted-foreground">
            Profile settings and customization options will be available in a future update. This
            section will allow you to manage your account preferences, notification settings, and
            privacy options.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Account Settings</h3>
            <p className="text-muted-foreground text-sm">
              Manage your account details, password, and security settings.
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Notifications</h3>
            <p className="text-muted-foreground text-sm">
              Configure email and push notification preferences.
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Privacy</h3>
            <p className="text-muted-foreground text-sm">
              Control your profile visibility and data sharing settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
