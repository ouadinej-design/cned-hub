"use client";
export default function CoursPage() {
  const matieres = [
    { href: "/cours/maths", icon: "📐", title: "Maths", desc: "Séq.1 — Polynômes du second degré", color: "#818cf8", priority: 1 },
    { href: "/cours/francais", icon: "📖", title: "Français", desc: "Séq.1 — Rimbaud, Les Cahiers de Douai", color: "#60a5fa", priority: 1 },
    { href: "/cours/ses", icon: "📊", title: "SES", desc: "Séq.1 — La coordination par le marché", color: "#34d399", priority: 2 },
    { href: "/cours/hggsp", icon: "🌍", title: "HGGSP", desc: "Séq.1 — S'informer, regard critique", color: "#fbbf24", priority: 2 },
    { href: "/cours/histgeo", icon: "🗺️", title: "Hist-Géo", desc: "Séq.1 — La métropolisation", color: "#fb923c", priority: 2 },
    { href: "/cours/emc", icon: "⚖️", title: "EMC", desc: "Séq.1 — Valeurs de la République", color: "#c084fc", priority: 3 },
    { href: "/cours/enssci", icon: "🔬", title: "Ens. Scientifique", desc: "Séq.1 — La Terre, un astre singulier", color: "#2dd4bf", priority: 3 },
    { href: "/cours/anglais", icon: "🇬🇧", title: "Anglais", desc: "Séq.1 — Portraits of Power (Art & pouvoir)", color: "#818cf8", priority: 2 },
    { href: "/cours/espagnol", icon: "🇪🇸", title: "Espagnol", desc: "Séq.1 — Sin avances ¿no hay futuro?", color: "#f87171", priority: 2 },
  ];
  const priorityLabels = { 1: "🔴 Priorité absolue (épreuves anticipées)", 2: "🟠 Spécialités & langues (CC)", 3: "🟢 Complémentaires" };
  const groups = [1, 2, 3];

  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <a href="/" style={{ fontSize:22, color:"#94a3b8", textDecoration:"none" }}>←</a>
        <div>
          <div style={{ fontSize:24, fontWeight:800 }}>🎓 Cours interactifs</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Prof IA + Exercices + Quiz — Méthode Maîtrise</div>
        </div>
      </div>

      {/* Accès rapides outils */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <a href="/cours/automatismes" style={{ flex:1, display:"block", padding:14, borderRadius:12, background:"linear-gradient(135deg,rgba(236,72,153,.15),rgba(244,63,94,.15))", border:"1px solid rgba(236,72,153,.3)", textDecoration:"none", color:"#f9a8d4", textAlign:"center" }}>
          <div style={{ fontSize:22, marginBottom:2 }}>🧮</div>
          <div style={{ fontSize:13, fontWeight:700 }}>Automatismes</div>
          <div style={{ fontSize:10, color:"#94a3b8" }}>5 min calcul mental</div>
        </a>
        <a href="/cours/bac-blanc" style={{ flex:1, display:"block", padding:14, borderRadius:12, background:"linear-gradient(135deg,rgba(99,102,241,.15),rgba(129,140,248,.15))", border:"1px solid rgba(99,102,241,.3)", textDecoration:"none", color:"#a5b4fc", textAlign:"center" }}>
          <div style={{ fontSize:22, marginBottom:2 }}>📝</div>
          <div style={{ fontSize:13, fontWeight:700 }}>Bac Blanc</div>
          <div style={{ fontSize:10, color:"#94a3b8" }}>Épreuves chronomètrées</div>
        </a>
        <a href="/cours/bilan" style={{ flex:1, display:"block", padding:14, borderRadius:12, background:"linear-gradient(135deg,rgba(34,197,94,.15),rgba(16,185,129,.15))", border:"1px solid rgba(34,197,94,.3)", textDecoration:"none", color:"#86efac", textAlign:"center" }}>
          <div style={{ fontSize:22, marginBottom:2 }}>📊</div>
          <div style={{ fontSize:13, fontWeight:700 }}>Bilan</div>
          <div style={{ fontSize:10, color:"#94a3b8" }}>Analyse semaine</div>
        </a>
      </div>

      {/* Matières par priorité */}
      {groups.map(p => (
        <div key={p}>
          <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:8, marginTop:p>1?16:0 }}>{priorityLabels[p]}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:8 }}>
            {matieres.filter(m => m.priority === p).map((m) => (
              <a key={m.title} href={m.href}
                style={{ display:"block", padding:16, borderRadius:14, background:"#1e293b", textDecoration:"none", color:"#e2e8f0", borderLeft:`4px solid ${m.color}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:28 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:16 }}>{m.title}</div>
                      <div style={{ fontSize:13, color:"#94a3b8" }}>{m.desc}</div>
                    </div>
                  </div>
                  <span style={{ color:"#22c55e", fontSize:13, fontWeight:700 }}>→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
