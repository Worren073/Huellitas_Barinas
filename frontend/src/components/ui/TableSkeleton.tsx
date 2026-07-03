interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse">
      <div className="bg-surface-gray/30 border-b border-outline-variant/30 flex gap-4 p-stack-sm pl-stack-md">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-surface-gray rounded w-24" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-stack-sm pl-stack-md border-b border-outline-variant/10">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="h-4 bg-surface-gray/50 rounded w-24" />
          ))}
        </div>
      ))}
    </div>
  );
}
