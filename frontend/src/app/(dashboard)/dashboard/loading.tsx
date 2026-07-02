export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-off-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary-container border-t-primary rounded-full animate-spin" />
        <p className="font-body-sm text-on-surface-variant">Cargando...</p>
      </div>
    </div>
  );
}
