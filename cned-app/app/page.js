"use client";
import { useState, useRef } from "react";

const PARENT_PIN = "2027";

export default function Home() {
  const cards = [
    { href:"/planning", icon:"📅", title:"Planning", desc:"Emploi du temps jour par jour", color:"#6366f1" },
    { href:"/devoirs", icon:"📋", title:"Devoirs", desc:"Suivi des devoirs CNED", color:"#ef4444" },
    { href:"/cours", icon:"📖", title:"Cours", desc:"9 matières + Prof IA", color:"#3b82f6" },
    { href:"/regles", icon:"⚠️", title:"Règles CNED", desc:"Contrôle continu & dates clés", color:"#f59e0b" },
  ];

  const [tapCount, setTapCount] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const tapTimer = useRef(null);

  const handleLogoTap = () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      setShowPin(true);
      setTapCount(0);
    } else {
      tapTimer.current = setTimeout(() => setTapCount(0), 1500);
    }
  };

  const tryUnlock = () => {
    if (pin === PARENT_PIN) {
      try { sessionStorage.setItem("parent_ok", "1"); } catch {}
      window.location.href = "/rapport";
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 800);
    }
  };

  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"24px 16px 80px" }}>
      <div onClick={handleLogoTap} style={{ textAlign:"center", marginBottom:28, cursor:"pointer", userSelect:"none", WebkitTapHighlightColor:"transparent" }}>
        <div style={{ fontSize:26, fontWeight:800 }}>CNED Hub</div>
        <div style={{ fontSize:13, color:"#94a3b8" }}>Première 2026-2027</div>
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
      <div style={{ textAlign:"center", fontSize:11, color:"#475569", marginTop:20 }}>v3.1</div>

      {showPin && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:100, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center" }} onClick={() => setShowPin(false)}>
          <div onClick={e => e.stopPropagation()} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{ fontSize:36, marginBottom:14 }}>🔒</div>
            <input type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && tryUnlock()}
              autoFocus placeholder="••••"
              style={{ width:140, padding:14, borderRadius:10, border:`2px solid ${error ? "#ef4444" : "#334155"}`, background:"#1e293b", color:"#e2e8f0", fontSize:20, textAlign:"center", letterSpacing:6, marginBottom:14 }} />
            <button onClick={tryUnlock} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"#6366f1", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>Déverrouiller</button>
          </div>
        </div>
      )}
    </div>
  );
}
