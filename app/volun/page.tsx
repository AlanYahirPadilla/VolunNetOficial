"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <Heart className="h-16 w-16 text-blue-600 mb-6 animate-pulse" />
      <h1 className="text-4xl font-bold text-gray-800 mb-4">¡Estamos trabajando en ello!</h1>
      <p className="text-gray-600 text-lg mb-6 text-center">
        Esta sección aún está en desarrollo. Pronto podrás acceder a todas sus funcionalidades.
      </p>
      <Link href="/">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg transition">
          Volver al inicio
        </button>
      </Link>
    </div>
  );
}