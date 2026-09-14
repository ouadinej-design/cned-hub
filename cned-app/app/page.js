"use client";
import { useState, useRef, useEffect } from "react";
import { TimeDistributionAlert } from "./cours/session-tools";
import { DEVOIRS, MATIERES } from "../data/cned-data";

export default function Home() {
  const cards = [
    { href:"/planning", icon:"📅", title:"Planning", desc:"Emploi du temps jour par jour", color:"#6366f1" },
    { href:"/progres", icon:"🌟", title:"Mon suivi", desc:"Ta progression, tes matières à jour", color:"#22c55e" },
    { href:"/devoirs", icon:"📋", title:"Devoirs", desc:"Suivi des devoirs CNED", color:"#ef4444" },
    { href:"/cours", icon:"📖", title:"Cours", desc:"9 matières + Prof IA", color:"#3b82f6" },
    { href:"/regles", icon:"⚠️", title:"Règles CNED", desc:"Contrôle continu & dates clés", color:"#f59e0b" },
  ];

  const [tapCount, setTapCount] = useState(0);
  const lastTap = useRef(0);
  const [nextDevoir, setNextDevoir] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const upcoming = DEVOIRS
      .filter(d => d.deadline >= today)
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
    if (upcoming.length > 0) setNextDevoir(upcoming[0]);
  }, []);

  const handleLogoTap = () => {
    const now = Date.now();
    if (now - lastTap.current > 1200) {
      setTapCount(1);
    } else {
      const next = tapCount + 1;
      setTapCount(next);
      if (next >= 5) {
        window.location.href = "/rapport";
        return;
      }
    }
    lastTap.current = now;
  };

  const daysUntil = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.ceil((d - now) / 86400000);
  };

  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"24px 16px 80px" }}>
      <div onClick={handleLogoTap} style={{ textAlign:"center", marginBottom:24, cursor:"pointer", userSelect:"none", WebkitTapHighlightColor:"transparent" }}>
        <div style={{ fontSize:26, fontWeight:800 }}>CNED Hub</div>
        <div style={{ fontSize:13, color:"#94a3b8" }}>Première 2026-2027 — Méthode Maîtrise</div>
      </div>

      {/* Alerte prochain devoir */}
      {nextDevoir && daysUntil(nextDevoir.deadline) <= 14 && (
        <a href="/devoirs" style={{ display:"block", background:"rgba(239,68,68,.1)", borderRadius:14, padding:14, marginBottom:12, border:"1px solid rgba(239,68,68,.3)", textDecoration:"none", color:"#e2e8f0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#fca5a5" }}>⏰ Prochain devoir</div>
              <div style={{ fontSize:15, fontWeight:700, marginTop:2 }}>{nextDevoir.id} — {MATIERES[nextDevoir.m]?.nom}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:20, fontWeight:800, color: daysUntil(nextDevoir.deadline) <= 7 ? "#ef4444" : "#fbbf24" }}>J-{daysUntil(nextDevoir.deadline)}</div>
              <div style={{ fontSize:11, color:"#94a3b8" }}>{nextDevoir.deadline}</div>
            </div>
          </div>
        </a>
      )}

      {/* Tableau de bord répartition temps */}
      <TimeDistributionAlert />

      {/* Accès rapides Méthode Maîtrise */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <a href="/cours/automatismes" style={{ flex:1, display:"block", padding:12, borderRadius:12, background:"rgba(236,72,153,.1)", border:"1px solid rgba(236,72,153,.3)", textDecoration:"none", color:"#f9a8d4", textAlign:"center" }}>
          <div style={{ fontSize:20, marginBottom:4 }}>🧮</div>
          <div style={{ fontSize:12, fontWeight:700 }}>Automatismes</div>
          <div style={{ fontSize:10, color:"#94a3b8" }}>5 min/jour</div>
        </a>
        <a href="/cours/bac-blanc" style={{ flex:1, display:"block", padding:12, borderRadius:12, background:"rgba(99,102,241,.1)", border:"1px solid rgba(99,102,241,.3)", textDecoration:"none", color:"#a5b4fc", textAlign:"center" }}>
          <div style={{ fontSize:20, marginBottom:4 }}>📝</div>
          <div style={{ fontSize:12, fontWeight:700 }}>Bac Blanc</div>
          <div style={{ fontSize:10, color:"#94a3b8" }}>Conditions réelles</div>
        </a>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        {cards.map(c => (
          <a key={c.title} href={c.href} style={{ display:"block", padding:20, background:"#1e293b", borderRadius:14, textDecoration:"none", color:"#e2e8f0", borderTop:`3px solid ${c.color}` }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{c.icon}</div>
            <div style={{ fontWeight:700, fontSize:16 }}>{c.title}</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>{c.desc}</div>
          </a>
        ))}
      </div>

      <div style={{ background:"rgba(239,68,68,.1)", borderRadius:14, padding:16, border:"1px solid rgba(239,68,68,.3)" }}>
        <div style={{ fontWeight:700, fontSize:13, color:"#fca5a5", marginBottom:4 }}>⚠️ Rappel contrôle continu</div>
        <div style={{ fontSize:12, color:"#fca5a5" }}>Bac = 40% CC + 60% épreuves. 100% devoirs rendus à temps. 14j min entre 2 devoirs même matière.</div>
      </div>
      <div style={{ textAlign:"center", fontSize:11, color:"#475569", marginTop:20 }}>v4.0 — Méthode Maîtrise</div>
    </div>
  );
}
