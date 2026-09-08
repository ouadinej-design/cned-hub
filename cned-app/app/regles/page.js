"use client";
import { REGLES, DATES_CLES, SEMESTRES } from "../../data/cned-data";

export default function ReglesPage() {
  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <a href="/" style={{ fontSize:22, color:"#94a3b8", textDecoration:"none" }}>←</a>
        <div>
          <div style={{ fontSize:24, fontWeight:800 }}>⚠️ Règles CNED</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Contrôle continu — Éligibilité bac</div>
        </div>
      </div>

      <div style={{ background:"#450a0a", borderRadius:14, padding:16, marginBottom:16, border:"1px solid #991b1b" }}>
        <div style={{ fontWeight:700, fontSize:16, color:"#fca5a5", marginBottom:8 }}>🔴 Règles obligatoires</div>
        {REGLES.filter(r=>r.type==="critical").map((r,i) => (
          <div key={i} style={{ padding:10, marginBottom:6, background:"rgba(239,68,68,.1)", borderRadius:8, fontSize:13, color:"#fca5a5", borderLeft:"3px solid #ef4444" }}>{r.text}</div>
        ))}
      </div>

      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:16, color:"#fbbf24", marginBottom:8 }}>⚠️ Règles importantes</div>
        {REGLES.filter(r=>r.type==="warning").map((r,i) => (
          <div key={i} style={{ padding:10, marginBottom:6, background:"rgba(245,158,11,.08)", borderRadius:8, fontSize:13, color:"#fcd34d", borderLeft:"3px solid #f59e0b" }}>{r.text}</div>
        ))}
      </div>

      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:16, color:"#60a5fa", marginBottom:8 }}>ℹ️ Informations</div>
        {REGLES.filter(r=>r.type==="info").map((r,i) => (
          <div key={i} style={{ padding:10, marginBottom:6, background:"rgba(59,130,246,.08)", borderRadius:8, fontSize:13, color:"#93c5fd", borderLeft:"3px solid #3b82f6" }}>{r.text}</div>
        ))}
      </div>

      <div style={{ background:"#1e293b", borderRadius:14, padding:16 }}>
        <div style={{ fontWeight:700, fontSize:16, marginBottom:12 }}>📅 Dates clés de l'année</div>
        {DATES_CLES.map((d,i) => (
          <div key={i} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:i<DATES_CLES.length-1?"1px solid #334155":"none" }}>
            <div style={{ minWidth:90, fontSize:12, fontWeight:600, color:d.critical?"#ef4444":"#94a3b8" }}>{new Date(d.date).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
              <span>{d.icon}</span>
              <span style={{ fontSize:13, color:d.critical?"#fca5a5":"#e2e8f0", fontWeight:d.critical?700:400 }}>{d.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
