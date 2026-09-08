"use client";
export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-2">CNED Hub — Première 2026-2027</h1>
      <p className="text-center text-gray-500 text-sm mb-8">Planning, cours et suivi des devoirs</p>

      <div className="grid grid-cols-2 gap-4">
        <a href="/planning" className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-400 transition-colors">
          <div className="text-3xl mb-2">📅</div>
          <h2 className="font-bold text-lg">Planning</h2>
          <p className="text-sm text-gray-500 mt-1">Emploi du temps jour par jour</p>
        </a>

        <a href="/devoirs" className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-red-400 transition-colors">
          <div className="text-3xl mb-2">📋</div>
          <h2 className="font-bold text-lg">Devoirs</h2>
          <p className="text-sm text-gray-500 mt-1">Suivi des devoirs CNED</p>
        </a>

        <a href="/cours" className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 transition-colors">
          <div className="text-3xl mb-2">📖</div>
          <h2 className="font-bold text-lg">Cours</h2>
          <p className="text-sm text-gray-500 mt-1">Français, Maths + Prof IA</p>
        </a>

        <a href="/regles" className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-yellow-400 transition-colors">
          <div className="text-3xl mb-2">⚠️</div>
          <h2 className="font-bold text-lg">Règles CNED</h2>
          <p className="text-sm text-gray-500 mt-1">Contrôle continu & dates clés</p>
        </a>
      </div>

      <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-200">
        <p className="text-sm font-bold text-red-700 mb-1">⚠️ Rappel contrôle continu</p>
        <p className="text-xs text-red-600">Bac = 40% contrôle continu + 60% épreuves. 100% des devoirs doivent être rendus à temps. 14 jours minimum entre 2 devoirs d'une même matière.</p>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">v1.0 — Fait avec ❤️ pour la réussite au bac</p>
    </div>
  );
}
