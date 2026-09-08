"use client";
export default function CoursPage() {
  const matieres = [
    { href: "/cours/maths", icon: "📐", title: "Maths", desc: "Séq.1 — Polynômes du second degré", color: "#818cf8", ready: true },
    { href: "/cours/francais", icon: "📖", title: "Français", desc: "Séq.1 — Rimbaud, Les Cahiers de Douai", color: "#60a5fa", ready: true },
    { href: "/cours/ses", icon: "📊", title: "SES", desc: "Séq.1 — La coordination par le marché", color: "#34d399", ready: true },
    { href: "/cours/hggsp", icon: "🌍", title: "HGGSP", desc: "Séq.1 — S'informer, regard critique", color: "#fbbf24", ready: true },
    { href: "#", icon: "🗺️", title: "Hist-Géo", desc: "Bientôt", color: "#f97316", ready: false },
    { href: "#", icon: "🇬🇧", title: "Anglais", desc: "Bientôt", color: "#6366f1", ready: false },
    { href: "#", icon: "🇪🇸", title: "Espagnol", desc: "Bientôt", color: "#ef4444", ready: false },
    { href: "#", icon: "🔬", title: "Ens. Sci", desc: "Bientôt", color: "#14b8a6", ready: false },
    { href: "#", icon: "⚖️", title: "EMC", desc: "Bientôt", color: "#a855f7", ready: false },
  ];
  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <a href="/" style={{ fontSize:22, color:"#94a3b8", textDecoration:"none" }}>←</a>
        <div>
          <div style={{ fontSize:24, fontWeight:800 }}>🎓 Cours interactifs</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Prof IA + Exercices + Quiz</div>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {matieres.map((m) => (
          <a key={m.title} href={m.ready ? m.href : undefined}
            style={{ display:"block", padding:16, borderRadius:14, background:"#1e293b", textDecoration:"none", color:"#e2e8f0", borderLeft:`4px solid ${m.color}`, opacity:m.ready?1:0.5, cursor:m.ready?"pointer":"not-allowed" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:28 }}>{m.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:16 }}>{m.title}</div>
                  <div style={{ fontSize:13, color:"#94a3b8" }}>{m.desc}</div>
                </div>
              </div>
              {m.ready && <span style={{ color:"#22c55e", fontSize:13, fontWeight:700 }}>→</span>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
