export default function PetCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-card overflow-hidden">
      <div className="h-56 bg-surface-gray animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-32 bg-surface-gray rounded animate-pulse" />
        <div className="h-4 w-48 bg-surface-gray rounded animate-pulse" />
        <div className="h-10 bg-surface-gray rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
