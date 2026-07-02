export default function HomeLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-20 bg-surface-container-lowest border-b border-outline-variant"></div>
      
      <main className="flex-1">
        <section className="max-w-container-max mx-auto px-4 md:px-8 py-stack-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-stack-md">
              <div className="h-16 bg-surface-container-high rounded-lg animate-pulse"></div>
              <div className="h-12 bg-surface-container-high rounded-lg animate-pulse w-3/4"></div>
              <div className="h-6 bg-surface-container-high rounded animate-pulse w-full"></div>
              <div className="h-6 bg-surface-container-high rounded animate-pulse w-5/6"></div>
              <div className="flex gap-4 mt-2">
                <div className="h-12 bg-primary-container rounded-lg animate-pulse w-40"></div>
                <div className="h-12 bg-surface-container-high rounded-lg animate-pulse w-36"></div>
              </div>
            </div>
            <div className="h-[400px] bg-surface-container-high rounded-2xl animate-pulse"></div>
          </div>
        </section>

        <section className="bg-surface-gray py-stack-lg">
          <div className="max-w-container-max mx-auto px-4 md:px-8">
            <div className="h-10 bg-surface-container-high rounded-lg animate-pulse w-64 mx-auto mb-stack-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface p-8 rounded-2xl">
                  <div className="w-12 h-12 bg-primary-container rounded-lg animate-pulse mb-6"></div>
                  <div className="h-6 bg-surface-container-high rounded animate-pulse w-3/4 mb-3"></div>
                  <div className="h-4 bg-surface-container-high rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-surface-container-high rounded animate-pulse w-5/6 mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-stack-lg">
          <div className="max-w-container-max mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center mb-stack-md">
              <div className="h-8 bg-surface-container-high rounded-lg animate-pulse w-48"></div>
              <div className="h-5 bg-surface-container-high rounded-lg animate-pulse w-24"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl shadow-card overflow-hidden">
                  <div className="h-48 bg-surface-container-high animate-pulse"></div>
                  <div className="p-5">
                    <div className="h-5 bg-surface-container-high rounded animate-pulse w-1/2 mb-2"></div>
                    <div className="h-4 bg-surface-container-high rounded animate-pulse w-3/4 mb-4"></div>
                    <div className="h-10 bg-primary-container rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className="bg-surface-dim py-stack-lg">
        <div className="max-w-container-max mx-auto px-4 md:px-8">
          <div className="h-6 bg-surface-container-high rounded animate-pulse w-48 mb-4"></div>
          <div className="h-4 bg-surface-container-high rounded animate-pulse w-64"></div>
        </div>
      </div>
    </div>
  );
}
