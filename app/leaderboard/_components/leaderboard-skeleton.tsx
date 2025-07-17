import { Skeleton } from '@/lib/components/ui/skeleton'

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <div className="border-b p-4">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
