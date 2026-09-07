"use client";
export default function CoursPage() {
  const matieres = [
    { href: "/cours/maths", icon: "📐", title: "Maths", desc: "Séq.1 — Polynômes du second degré", color: "#ec4899", ready: true },
    { href: "#", icon: "📖", title: "Français", desc: "Séq.1 — Rimbaud (bientôt)", color: "#3b82f6", ready: false },
    { href: "#", icon: "📊", title: "SES", desc: "Bientôt", color: "#10b981", ready: false },
    { href: "#", icon: "🌍", title: "HGGSP", desc: "Bientôt", color: "#f59e0b", ready: false },
    { href: "#", icon: "🗺️", title: "Hist-Géo", desc: "Bientôt", color: "#f97316", ready: false },
    { href: "#", icon: "🇬🇧", title: "Anglais", desc: "Bientôt", color: "#6366f1", ready: false },
    { href: "#", icon: "🇪🇸", title: "Espagnol", desc: "Bientôt", color: "#ef4444", ready: false },
    { href: "#", icon: "🔬", title: "Ens. Sci", desc: "Bientôt", color: "#14b8a6", ready: false },
    { href: "#", icon: "⚖️", title: "EMC", desc: "Bientôt", color: "#a855f7", ready: false },
  ];
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <a href="/" className="text-2xl text-gray-400 hover:text-gray-600">←</a>
        <div>
          <h1 className="text-2xl font-bold">Cours interactifs</h1>
          <p className="text-sm text-gray-500">Prof IA + Exercices + Quiz</p>
        </div>
      </div>
      <div className="grid gap-3">
        {matieres.map((m) => (
          <a key={m.title} href={m.ready ? m.href : undefined}
            className={`block p-4 rounded-xl border transition-all ${m.ready ? "bg-white border-gray-200 hover:shadow-md cursor-pointer" : "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"}`}
            style={{ borderLeftWidth: 4, borderLeftColor: m.color }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <div className="font-bold">{m.title}</div>
                  <div className="text-sm text-gray-500">{m.desc}</div>
                </div>
              </div>
              {m.ready && <span className="text-green-500 text-sm font-bold">Disponible →</span>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
