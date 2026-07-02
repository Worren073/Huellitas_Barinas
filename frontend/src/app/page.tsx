import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">
          Huellitas Barinas
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Encuentra tu nuevo compañero de vida. Miles de mascotas esperan un hogar.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/catalog"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Ver Mascotas
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
