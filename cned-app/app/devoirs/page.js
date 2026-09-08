"use client";
import { useState } from "react";
import { DEVOIRS, MATIERES, SEMESTRES } from "../../data/cned-data";

export default function DevoirsPage() {
  const [sent, setSent] = useState(() => { try { const s = typeof window!=="undefined" && localStorage.getItem("dv"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const [filter, setFilter] = useState("all");
  const save = (s) => { setSent(s); try { localStorage.setItem("dv", JSON.stringify(s)); } catch {} };
  const toggle = (id) => { const n = { ...sent }; if (n[id]) delete n[id]; else n[id] = new Date().toISOString().split("T")[0]; save(n); };

  const devoirs = filter === "all" ? DEVOIRS : DEVOIRS.filter(d => d.m === filter);
  const s1 = devoirs.filter(d => d.sem === 1);
  const s2 = devoirs.filter(d => d.sem === 2);
  const s1Done = s1.filter(d => sent[d.id]).length;
  const s2Done = s2.filter(d => sent[d.id]).length;
  const totalDone = Object.keys(sent).length;
  const total = DEVOIRS.length;
  const pct = Math.round(totalDone / total * 100);

  const today = new Date().toISOString().split("T")[0];
  const overdue = DEVOIRS.filter(d => !sent[d.id] && d.deadline < today);

  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <a href="/" style={{ fontSize:22, color:"#94a3b8", textDecoration:"none" }}>←</a>
        <div>
          <div style={{ fontSize:24, fontWeight:800 }}>📋 Suivi des devoirs</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Contrôle continu — {totalDone}/{total} rendus</div>
        </div>
      </div>

      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontWeight:700 }}>Progression globale</span><span style={{ color:"#22c55e", fontWeight:700 }}>{pct}%</span></div>
        <div style={{ height:10, background:"#334155", borderRadius:5, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#22c55e,#4ade80)", borderRadius:5, transition:"width .5s" }} /></div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#94a3b8", marginTop:8 }}>
          <span>S1 : {s1Done}/{s1.length} avant 17 jan</span>
          <span>S2 : {s2Done}/{s2.length} avant 25 avr</span>
        </div>
      </div>

      {overdue.length > 0 && (
        <div style={{ background:"#450a0a", borderRadius:14, padding:14, marginBottom:16, border:"1px solid #991b1b" }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#fca5a5", marginBottom:6 }}>🔴 {overdue.length} devoir(s) en retard !</div>
          {overdue.slice(0,3).map(d => <div key={d.id} style={{ fontSize:12, color:"#fca5a5" }}>• {MATIERES[d.m]?.nom} n°{d.n} — deadline {d.deadline}</div>)}
        </div>
      )}

      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        <div onClick={() => setFilter("all")} style={{ padding:"6px 12px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:filter==="all"?"#6366f1":"#1e293b", color:filter==="all"?"#fff":"#94a3b8" }}>Tous</div>
        {Object.entries(MATIERES).map(([k,v]) => (
          <div key={k} onClick={() => setFilter(k)} style={{ padding:"6px 12px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:filter===k?v.color:"#1e293b", color:filter===k?"#fff":"#94a3b8" }}>{v.court}</div>
        ))}
      </div>

      {[{label:"Semestre 1 — avant 17 jan 2027", items:s1}, {label:"Semestre 2 — avant 25 avr 2027", items:s2}].map((sem,si) => (
        <div key={si} style={{ marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:8, color:si===0?"#60a5fa":"#c084fc" }}>{sem.label}</div>
          {sem.items.map(d => {
            const m = MATIERES[d.m];
            const isDone = !!sent[d.id];
            const isLate = !isDone && d.deadline < today;
            return (
              <div key={d.id} onClick={() => toggle(d.id)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:12, marginBottom:6, borderRadius:10, background:"#1e293b", cursor:"pointer", borderLeft:`3px solid ${isDone?"#22c55e":isLate?"#ef4444":m?.color||"#6366f1"}`, opacity:isDone?0.7:1 }}>
                <div style={{ width:24, height:24, borderRadius:6, border:`2px solid ${isDone?"#22c55e":"#334155"}`, background:isDone?"#22c55e":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {isDone && <span style={{ color:"#fff", fontSize:14, fontWeight:700 }}>✓</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, textDecoration:isDone?"line-through":"none" }}>{m?.nom} — Devoir {d.n}</div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>Séq.{d.seq} · {d.type==="depot"?"À déposer":"En ligne"} · avant le {new Date(d.deadline).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}{d.note ? ` · ${d.note}` : ""}</div>
                </div>
                {isLate && <span style={{ fontSize:11, fontWeight:700, color:"#ef4444" }}>EN RETARD</span>}
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ background:"#1e293b", borderRadius:14, padding:14, fontSize:12, color:"#94a3b8" }}>
        <div style={{ fontWeight:700, marginBottom:6 }}>📏 Rappel règle des 14 jours</div>
        <div>Minimum 14 jours entre 2 devoirs d'une même matière. Les devoirs doivent être rendus dans l'ordre des séquences.</div>
      </div>
    </div>
  );
}
