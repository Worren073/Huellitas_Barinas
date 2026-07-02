export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface-container-lowest border-b border-outline-variant h-20" />
      <main className="flex-1 max-w-container-max mx-auto w-full px-4 md:px-8 py-8">
        <div className="mb-8">
          <div className="h-10 w-64 bg-surface-gray rounded-lg animate-pulse" />
          <div className="flex gap-2 mt-4">
            <div className="h-6 w-24 bg-surface-gray rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-surface-gray rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-surface-gray rounded-full animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl shadow-card overflow-hidden">
              <div className="h-56 bg-surface-gray animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-32 bg-surface-gray rounded animate-pulse" />
                <div className="h-4 w-48 bg-surface-gray rounded animate-pulse" />
                <div className="h-8 bg-surface-gray rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
