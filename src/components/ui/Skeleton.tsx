export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
      <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-t items-center">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === 0 ? 'col-span-5' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-3' : 'col-span-2'}`} />
      ))}
    </div>
  )
}
