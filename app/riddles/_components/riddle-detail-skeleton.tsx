import { Skeleton } from '@/lib/components/ui/skeleton'

export function RiddleDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Riddle details */}
        <div className="space-y-4">
          <div className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-20" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Response form */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-lg border p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>

      {/* Previous responses */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
