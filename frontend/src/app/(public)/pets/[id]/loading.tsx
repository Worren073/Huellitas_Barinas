export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface-container-lowest border-b border-outline-variant h-20" />
      <main className="flex-1 max-w-container-max mx-auto w-full px-4 md:px-8 py-8">
        <div className="mb-8">
          <div className="h-12 w-48 bg-surface-gray rounded-lg animate-pulse" />
          <div className="flex gap-2 mt-4">
            <div className="h-6 w-32 bg-surface-gray rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-surface-gray rounded-full animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-[500px] bg-surface-gray rounded-2xl animate-pulse" />
            <div className="h-40 bg-surface-gray rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-48 bg-surface-gray rounded-2xl animate-pulse" />
            <div className="h-64 bg-surface-gray rounded-2xl animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
