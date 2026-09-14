"use client";
import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════
// 1. TIMER 25-25-10 — Guide visuel par phases
// ══════════════════════════════════════════════
const PHASES = [
  { label: "📖 Cours — Comprendre & reformuler", duration: 25*60, color: "#6366f1", icon: "📖" },
  { label: "✏️ Exercices — Pratiquer & se tester", duration: 25*60, color: "#f59e0b", icon: "✏️" },
  { label: "🧠 Bilan — Qu'ai-je retenu ?", duration: 10*60, color: "#22c55e", icon: "🧠" },
];

export function SessionTimer({ matiere, onPhaseChange }) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(0);
  const [left, setLeft] = useState(PHASES[0].duration);
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!active || paused) return;
    ref.current = setInterval(() => {
      setLeft(l => {
        if (l <= 1) {
          // Phase terminée
          if (phase < 2) {
            const next = phase + 1;
            setPhase(next);
            if (onPhaseChange) onPhaseChange(next);
            try { new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==").play(); } catch {}
            return PHASES[next].duration;
          } else {
            setActive(false);
            setPaused(false);
            if (onPhaseChange) onPhaseChange(-1);
            return 0;
          }
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [active, paused, phase]);

  const mm = String(Math.floor(left/60)).padStart(2,"0");
  const ss = String(left%60).padStart(2,"0");
  const p = PHASES[phase];
  const pct = ((p.duration - left) / p.duration) * 100;

  if (!active) return (
    <button onClick={() => { setActive(true); setPhase(0); setLeft(PHASES[0].duration); setPaused(false); if(onPhaseChange) onPhaseChange(0); }}
      style={{ width:"100%", padding:14, borderRadius:12, border:"2px solid #6366f1", background:"rgba(99,102,241,.1)", color:"#818cf8", fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:12 }}>
      ⏱️ Lancer la session 25-25-10
    </button>
  );

  return (
    <div style={{ background:"#1e293b", borderRadius:14, padding:14, marginBottom:12, border:`2px solid ${p.color}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ fontSize:13, fontWeight:700, color:p.color }}>{p.label}</span>
        <span style={{ fontSize:11, color:"#64748b" }}>{phase+1}/3</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
        <span style={{ fontSize:28, fontWeight:800, fontFamily:"monospace", color:"#e2e8f0" }}>{mm}:{ss}</span>
        <div style={{ flex:1 }}>
          <div style={{ height:6, borderRadius:3, background:"#334155", overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:3, background:p.color, width:`${pct}%`, transition:"width 1s linear" }} />
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:6 }}>
        <button onClick={() => setPaused(!paused)}
          style={{ flex:1, padding:8, borderRadius:8, border:"none", background:paused?"#22c55e":"#334155", color:"#e2e8f0", fontSize:12, fontWeight:600, cursor:"pointer" }}>
          {paused ? "▶ Reprendre" : "⏸ Pause"}
        </button>
        {phase < 2 && <button onClick={() => { setPhase(phase+1); setLeft(PHASES[phase+1].duration); if(onPhaseChange) onPhaseChange(phase+1); }}
          style={{ flex:1, padding:8, borderRadius:8, border:"none", background:"rgba(99,102,241,.2)", color:"#818cf8", fontSize:12, fontWeight:600, cursor:"pointer" }}>
          Phase suivante →
        </button>}
        <button onClick={() => { setActive(false); setPaused(false); setPhase(0); setLeft(PHASES[0].duration); if(onPhaseChange) onPhaseChange(-1); }}
          style={{ padding:8, borderRadius:8, border:"none", background:"rgba(239,68,68,.15)", color:"#f87171", fontSize:12, cursor:"pointer" }}>
          ✕
        </button>
      </div>
      <div style={{ display:"flex", gap:4, marginTop:8 }}>
        {PHASES.map((ph,i) => (
          <div key={i} style={{ flex:i<2?25:10, height:3, borderRadius:2, background:i<phase?ph.color:i===phase?ph.color+"80":"#334155" }} />
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// 2. FLASHCARDS DE RÉVISION — Erreurs passées
// ══════════════════════════════════════════════
export function RevisionFlash({ matiere, matiereCode }) {
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [scores, setScores] = useState({ ok: 0, ko: 0 });

  useEffect(() => {
    try {
      const log = JSON.parse(localStorage.getItem("difficulties_log") || "{}");
      const errors = [];
      const now = new Date();
      Object.entries(log).forEach(([date, mats]) => {
        const daysDiff = Math.floor((now - new Date(date)) / 86400000);
        if (daysDiff <= 14 && mats[matiere]) {
          mats[matiere].filter(e => e.type === "exercice").forEach(e => {
            errors.push({ q: e.question, a: e.correctAnswer, hint: e.hint, seance: e.seance, date, age: daysDiff });
          });
        }
      });
      // Priorité aux erreurs récentes, max 8 flashcards
      errors.sort((a, b) => a.age - b.age);
      const unique = []; const seen = new Set();
      errors.forEach(e => { if (!seen.has(e.q)) { seen.add(e.q); unique.push(e); } });
      setCards(unique.slice(0, 8));
    } catch {}
  }, [matiere]);

  if (cards.length === 0) return null;
  if (done) return (
    <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:12, border:"1px solid #334155", textAlign:"center" }}>
      <div style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>🔄 Révision terminée</div>
      <div style={{ fontSize:13, color:"#94a3b8" }}>{scores.ok} maîtrisé{scores.ok>1?"s":""} · {scores.ko} à revoir</div>
    </div>
  );

  const card = cards[idx];
  return (
    <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:12, border:"1px solid #f59e0b" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:12, fontWeight:700, color:"#f59e0b" }}>🔄 Révision — Erreurs récentes</span>
        <span style={{ fontSize:11, color:"#64748b" }}>{idx+1}/{cards.length}</span>
      </div>
      <div onClick={() => setFlipped(!flipped)}
        style={{ background:"#0f172a", borderRadius:10, padding:16, minHeight:80, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid #334155" }}>
        {!flipped ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#e2e8f0", marginBottom:6 }}>{card.q}</div>
            <div style={{ fontSize:11, color:"#64748b" }}>Tape pour voir la réponse</div>
          </div>
        ) : (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#4ade80", marginBottom:4 }}>{card.a}</div>
            {card.hint && <div style={{ fontSize:11, color:"#fbbf24" }}>💡 {card.hint}</div>}
            <div style={{ fontSize:10, color:"#64748b", marginTop:4 }}>{card.seance}</div>
          </div>
        )}
      </div>
      {flipped && (
        <div style={{ display:"flex", gap:8, marginTop:10 }}>
          <button onClick={() => { setScores(s => ({...s, ok: s.ok+1})); setFlipped(false); if(idx<cards.length-1) setIdx(idx+1); else setDone(true); }}
            style={{ flex:1, padding:10, borderRadius:8, border:"none", background:"rgba(34,197,94,.15)", color:"#4ade80", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            ✅ Je maîtrise
          </button>
          <button onClick={() => { setScores(s => ({...s, ko: s.ko+1})); setFlipped(false); if(idx<cards.length-1) setIdx(idx+1); else setDone(true); }}
            style={{ flex:1, padding:10, borderRadius:8, border:"none", background:"rgba(239,68,68,.15)", color:"#f87171", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            ❌ À revoir
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// 3. SCORE DE QUALITÉ DE SESSION
// ══════════════════════════════════════════════
export function SessionScore({ attempted, correct, startTime }) {
  if (attempted === 0) return null;
  const pct = Math.round((correct / attempted) * 100);
  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0;
  const quality = pct >= 80 ? "Excellente" : pct >= 60 ? "Bonne" : pct >= 40 ? "À améliorer" : "Difficile";
  const qColor = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : pct >= 40 ? "#f97316" : "#ef4444";
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "👍" : pct >= 40 ? "💪" : "📚";

  return (
    <div style={{ background:"#1e293b", borderRadius:14, padding:14, marginTop:12, border:`1px solid ${qColor}40` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{emoji} Score de session</span>
        <span style={{ fontSize:11, color:"#64748b" }}>{elapsed} min</span>
      </div>
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ width:56, height:56, borderRadius:"50%", border:`3px solid ${qColor}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <span style={{ fontSize:18, fontWeight:800, color:qColor }}>{pct}%</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, color:qColor, marginBottom:2 }}>{quality}</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>{correct}/{attempted} exercices réussis</div>
          <div style={{ height:4, borderRadius:2, background:"#334155", marginTop:4, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:2, background:qColor, width:`${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
