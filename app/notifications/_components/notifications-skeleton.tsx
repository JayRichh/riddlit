import { Card, CardContent, CardHeader } from '@/lib/components/ui/card'
import { Skeleton } from '@/lib/components/ui/skeleton'

export function NotificationsSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full sm:w-[180px]" />
            <Skeleton className="h-10 w-full sm:w-[180px]" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3 p-4">
                <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
