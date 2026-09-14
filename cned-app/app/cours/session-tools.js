"use client";
import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
// MÉTHODE MAÎTRISE — Outils de session v4.0
// ══════════════════════════════════════════════════════════════

const MASTERY_THRESHOLD = 70;

// ─── COMPAT : SessionTimer (gardé pour les 8 matières qui l'importent) ───
export function SessionTimer({ matiere, onPhaseChange }) {
  return null;
}

// ─── HELPERS : stockage maîtrise ───
function getMasteryData(mc) { try { return JSON.parse(localStorage.getItem(`mastery_${mc}`) || "{}"); } catch { return {}; } }
function saveMasteryData(mc, d) { try { localStorage.setItem(`mastery_${mc}`, JSON.stringify(d)); } catch {} }

export function recordMastery(mc, seanceId, correct, total) {
  const data = getMasteryData(mc);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const prev = data[seanceId];
  if (!prev || pct > prev.pct) {
    data[seanceId] = { pct, correct, total, date: new Date().toISOString().split("T")[0] };
    saveMasteryData(mc, data);
  }
  if (pct >= MASTERY_THRESHOLD) scheduleSpacedReview(mc, seanceId);
  return pct;
}

export function getSeanceMastery(mc, seanceId) {
  return getMasteryData(mc)[seanceId] || null;
}

// ─── HELPERS : révision espacée ───
const INTERVALS = [1, 3, 7, 21];
function getSpacedQueue() { try { return JSON.parse(localStorage.getItem("spaced_queue") || "[]"); } catch { return []; } }
function saveSpacedQueue(q) { try { localStorage.setItem("spaced_queue", JSON.stringify(q)); } catch {} }

function scheduleSpacedReview(mc, seanceId) {
  const queue = getSpacedQueue();
  const today = new Date();
  const existing = queue.filter(r => r.matiere === mc && r.seance === seanceId);
  const done = existing.map(r => r.interval);
  INTERVALS.forEach(days => {
    if (!done.includes(days)) {
      const rd = new Date(today); rd.setDate(rd.getDate() + days);
      queue.push({ matiere: mc, seance: seanceId, interval: days, reviewDate: rd.toISOString().split("T")[0], done: false });
    }
  });
  saveSpacedQueue(queue);
}

export function markReviewDone(mc, seanceId, interval) {
  const queue = getSpacedQueue();
  const idx = queue.findIndex(r => r.matiere === mc && r.seance === seanceId && r.interval === interval && !r.done);
  if (idx >= 0) queue[idx].done = true;
  saveSpacedQueue(queue);
}

// ══════════════════════════════════════════════
// 1. VERROU DE MAÎTRISE
// ══════════════════════════════════════════════
export function MasteryGate({ matiereCode, seances, onSelectSeance, currentProgress }) {
  const [mastery, setMastery] = useState({});
  useEffect(() => { setMastery(getMasteryData(matiereCode)); }, [matiereCode]);
  const isUnlocked = (idx) => {
    if (idx === 0) return true;
    const prev = mastery[seances[idx - 1].id];
    return prev && prev.pct >= MASTERY_THRESHOLD;
  };
  return (<div>{seances.map((s, i) => {
    const unlocked = isUnlocked(i);
    const m = mastery[s.id];
    const pct = m ? m.pct : 0;
    const d = currentProgress ? [currentProgress(s.id,"lessons"), currentProgress(s.id,"exercises"), currentProgress(s.id,"quiz")] : [false,false,false];
    const cc = d.filter(Boolean).length;
    return (
      <div key={s.id} onClick={() => unlocked && onSelectSeance(i)}
        style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10, cursor:unlocked?"pointer":"not-allowed", opacity:unlocked?1:0.5,
          borderLeft:`4px solid ${!unlocked?"#64748b":pct>=MASTERY_THRESHOLD?"#22c55e":cc>0?"#f59e0b":"#334155"}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <span style={{ fontSize:12, color:"#818cf8", fontWeight:600 }}>Séance {s.id}</span>
              {!unlocked && <span style={{ fontSize:11, background:"rgba(239,68,68,.15)", color:"#f87171", padding:"2px 8px", borderRadius:8, fontWeight:600 }}>🔒 &lt;70%</span>}
              {unlocked && m && pct>=MASTERY_THRESHOLD && <span style={{ fontSize:11, background:"rgba(34,197,94,.15)", color:"#22c55e", padding:"2px 8px", borderRadius:8, fontWeight:600 }}>✓ {pct}%</span>}
            </div>
            <div style={{ fontWeight:700, fontSize:15 }}>{s.title}</div>
          </div>
          <div style={{ display:"flex", gap:4 }}>{["📖","✏️","🧪"].map((e,j) => <span key={j} style={{ fontSize:16, opacity:d[j]?1:0.3 }}>{e}</span>)}</div>
        </div>
        {unlocked && m && pct<MASTERY_THRESHOLD && (
          <div style={{ marginTop:8, fontSize:12, color:"#fbbf24", background:"rgba(251,191,36,.08)", padding:"6px 10px", borderRadius:8 }}>
            ⚠️ Score : {pct}% — Refais les exos pour atteindre 70%
          </div>
        )}
      </div>
    );
  })}</div>);
}

// ══════════════════════════════════════════════
// 2. RÉVISION ESPACÉE
// ══════════════════════════════════════════════
export function SpacedRevision({ matiereCode, seances, onGoToSeance }) {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const q = getSpacedQueue();
    const today = new Date().toISOString().split("T")[0];
    setReviews(q.filter(r => r.matiere === matiereCode && !r.done && r.reviewDate <= today));
  }, [matiereCode]);
  if (reviews.length === 0) return null;
  const label = (d) => d===1?"J+1":d===3?"J+3":d===7?"J+7":"J+21";
  return (
    <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16, border:"2px solid #f59e0b" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
        <span style={{ fontSize:18 }}>🔄</span>
        <span style={{ fontWeight:700, fontSize:14, color:"#fbbf24" }}>Révisions du jour</span>
      </div>
      <div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>Réviser à J+1, J+3, J+7 et J+21 ancre la mémoire.</div>
      {reviews.map((r, i) => {
        const seance = seances.find(s => s.id === r.seance);
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", background:"#0f172a", borderRadius:10, marginBottom:6 }}>
            <div>
              <span style={{ fontSize:11, fontWeight:700, color:"#818cf8", marginRight:8 }}>{label(r.interval)}</span>
              <span style={{ fontSize:13, fontWeight:600 }}>Séance {r.seance}{seance ? ` — ${seance.title}` : ""}</span>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => onGoToSeance && onGoToSeance(seances.findIndex(s => s.id === r.seance))}
                style={{ padding:"4px 10px", borderRadius:8, border:"none", background:"#6366f1", color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}>Réviser</button>
              <button onClick={() => { markReviewDone(r.matiere, r.seance, r.interval); setReviews(rv => rv.filter((_,j) => j!==i)); }}
                style={{ padding:"4px 10px", borderRadius:8, border:"none", background:"rgba(34,197,94,.15)", color:"#22c55e", fontSize:11, fontWeight:600, cursor:"pointer" }}>✓ Fait</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════
// 3. AUTOMATISMES WIDGET
// ══════════════════════════════════════════════
const AUTO_Q = [
  {q:"7 × 8",a:"56",c:"Calcul"},{q:"15²",a:"225",c:"Calcul"},{q:"√144",a:"12",c:"Calcul"},
  {q:"3/4 + 1/3",a:"13/12",c:"Fractions"},{q:"2/5 × 5/6",a:"1/3",c:"Fractions"},
  {q:"(x+3)²",a:"x²+6x+9",c:"Identités"},{q:"(2x−1)²",a:"4x²-4x+1",c:"Identités"},{q:"(x+5)(x−5)",a:"x²-25",c:"Identités"},
  {q:"Δ de x²−5x+6",a:"1",c:"2nd degré"},{q:"Racines de x²−5x+6",a:"2 et 3",c:"2nd degré"},
  {q:"f(x)=3x²+2x, f'(x)",a:"6x+2",c:"Dérivation"},{q:"f(x)=x³, f'(x)",a:"3x²",c:"Dérivation"},
  {q:"P(A∪B) si P(A)=0.3 P(B)=0.5 P(A∩B)=0.1",a:"0.7",c:"Probas"},
  {q:"u₀=3 r=5 u₁₀ arithmétique",a:"53",c:"Suites"},{q:"u₀=2 q=3 u₄ géométrique",a:"162",c:"Suites"},
  {q:"e⁰",a:"1",c:"Expo"},{q:"eᵃ×eᵇ",a:"e^(a+b)",c:"Expo"},
  {q:"f(x)=5x−7, f'(x)",a:"5",c:"Dérivation"},{q:"√196",a:"14",c:"Calcul"},{q:"11²",a:"121",c:"Calcul"},
];

export function AutomatismesWidget() {
  const [started, setStarted] = useState(false);
  const [qs, setQs] = useState([]);
  const [qi, setQi] = useState(0);
  const [inp, setInp] = useState("");
  const [res, setRes] = useState(null);
  const [sc, setSc] = useState({ok:0,ko:0});
  const [tl, setTl] = useState(300);
  const [fin, setFin] = useState(false);
  const tr = useRef(null);
  const start = () => { setQs([...AUTO_Q].sort(()=>Math.random()-.5).slice(0,10)); setQi(0); setInp(""); setRes(null); setSc({ok:0,ko:0}); setTl(300); setFin(false); setStarted(true); };
  useEffect(() => { if(!started||fin) return; tr.current=setInterval(()=>{ setTl(t=>{ if(t<=1){setFin(true);return 0;} return t-1; }); },1000); return ()=>clearInterval(tr.current); },[started,fin]);
  const chk = () => { if(!inp.trim()) return; const q=qs[qi]; const n=s=>s.toLowerCase().replace(/\s+/g,"").replace(/,/g,"."); const ok=n(inp)===n(q.a)||inp.trim().toLowerCase()===q.a.toLowerCase(); setRes(ok); setSc(s=>ok?{...s,ok:s.ok+1}:{...s,ko:s.ko+1}); try{const td=new Date().toISOString().split("T")[0];const l=JSON.parse(localStorage.getItem("automatismes_log")||"{}");if(!l[td])l[td]=[];l[td].push({q:q.q,ok,cat:q.c,ts:Date.now()});localStorage.setItem("automatismes_log",JSON.stringify(l));}catch{} };
  const nxt = () => { if(qi<qs.length-1){setQi(qi+1);setInp("");setRes(null);}else{setFin(true);} };
  const mm=String(Math.floor(tl/60)).padStart(2,"0"), ss=String(tl%60).padStart(2,"0");
  const td=(()=>{try{const d=new Date().toISOString().split("T")[0];const l=JSON.parse(localStorage.getItem("automatismes_log")||"{}");return(l[d]||[]).length>=5;}catch{return false;}})();
  if(!started) return (
    <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16, border:td?"2px solid #22c55e":"2px solid #ec4899" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <span style={{ fontSize:18 }}>🧮</span><span style={{ fontWeight:700, fontSize:14, color:"#ec4899" }}>Automatismes — 5 min/jour</span>
        {td && <span style={{ fontSize:11, background:"rgba(34,197,94,.15)", color:"#22c55e", padding:"2px 8px", borderRadius:8, fontWeight:600 }}>✓ Fait</span>}
      </div>
      <div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>10 questions sans calculatrice. Comme au bac.</div>
      <button onClick={start} style={{ width:"100%", padding:12, borderRadius:10, border:"none", background:"#ec4899", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>{td?"🔄 Refaire":"🚀 Lancer"}</button>
    </div>
  );
  if(fin){const t=sc.ok+sc.ko;const p=t>0?Math.round(sc.ok/t*100):0;return(
    <div style={{ background:"#1e293b", borderRadius:14, padding:20, marginBottom:16, border:"2px solid #ec4899", textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:8 }}>{p>=80?"🏆":p>=60?"👍":"💪"}</div>
      <div style={{ fontSize:22, fontWeight:800 }}>{sc.ok}/{t}</div>
      <div style={{ fontSize:14, fontWeight:600, color:p>=80?"#22c55e":p>=60?"#fbbf24":"#f87171", marginTop:4 }}>{p>=80?"Réflexes au point.":p>=60?"Pas mal.":"À travailler."}</div>
      <button onClick={start} style={{ marginTop:12, padding:"10px 20px", borderRadius:10, border:"none", background:"#ec4899", color:"#fff", fontWeight:600, cursor:"pointer" }}>Relancer</button>
    </div>
  );}
  const q=qs[qi];
  return (
    <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16, border:"2px solid #ec4899" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:12, fontWeight:700, color:"#ec4899" }}>🧮 {q.c}</span>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:12, color:"#94a3b8" }}>{qi+1}/{qs.length}</span>
          <span style={{ fontSize:14, fontWeight:800, fontFamily:"monospace", color:tl<60?"#ef4444":"#e2e8f0" }}>{mm}:{ss}</span>
        </div>
      </div>
      <div style={{ background:"#0f172a", borderRadius:10, padding:16, marginBottom:10, textAlign:"center" }}>
        <div style={{ fontSize:18, fontWeight:700 }}>{q.q} = ?</div>
      </div>
      {res===null?(
        <div style={{ display:"flex", gap:8 }}>
          <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&chk()} placeholder="Réponse..." autoFocus style={{ flex:1, padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:14 }}/>
          <button onClick={chk} style={{ padding:"10px 16px", borderRadius:10, border:"none", background:"#ec4899", color:"#fff", fontWeight:600, cursor:"pointer" }}>OK</button>
        </div>
      ):(
        <div>
          <div style={{ padding:10, borderRadius:8, background:res?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)", border:`1px solid ${res?"#22c55e":"#ef4444"}`, marginBottom:8, textAlign:"center" }}>
            <span style={{ fontWeight:700, color:res?"#22c55e":"#ef4444" }}>{res?"✓ Correct !":"✗ Réponse : "+q.a}</span>
          </div>
          <button onClick={nxt} style={{ width:"100%", padding:10, borderRadius:10, border:"none", background:"#6366f1", color:"#fff", fontWeight:600, cursor:"pointer" }}>{qi<qs.length-1?"Suivante →":"Score"}</button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// 4. FLASHCARDS ERREURS
// ══════════════════════════════════════════════
export function RevisionFlash({ matiere, matiereCode }) {
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [scores, setScores] = useState({ ok:0, ko:0 });
  useEffect(() => {
    try {
      const log = JSON.parse(localStorage.getItem("difficulties_log") || "{}");
      const errors = []; const now = new Date();
      Object.entries(log).forEach(([date, mats]) => {
        const dd = Math.floor((now - new Date(date)) / 86400000);
        if (dd <= 14 && mats[matiere]) mats[matiere].filter(e => e.type === "exercice").forEach(e => errors.push({ q:e.question, a:e.correctAnswer, hint:e.hint, seance:e.seance, age:dd }));
      });
      errors.sort((a, b) => a.age - b.age);
      const unique = []; const seen = new Set();
      errors.forEach(e => { if (!seen.has(e.q)) { seen.add(e.q); unique.push(e); } });
      setCards(unique.slice(0, 8));
    } catch {}
  }, [matiere]);
  if (cards.length === 0) return null;
  if (done) return (<div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:12, textAlign:"center" }}><div style={{ fontSize:18, fontWeight:800 }}>🔄 Révision terminée</div><div style={{ fontSize:13, color:"#94a3b8" }}>{scores.ok} ok · {scores.ko} à revoir</div></div>);
  const c = cards[idx];
  return (
    <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:12, border:"1px solid #f59e0b" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontSize:12, fontWeight:700, color:"#f59e0b" }}>🔄 Erreurs récentes</span><span style={{ fontSize:11, color:"#64748b" }}>{idx+1}/{cards.length}</span></div>
      <div onClick={()=>setFlipped(!flipped)} style={{ background:"#0f172a", borderRadius:10, padding:16, minHeight:80, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {!flipped?(<div style={{ textAlign:"center" }}><div style={{ fontSize:14, fontWeight:600 }}>{c.q}</div><div style={{ fontSize:11, color:"#64748b" }}>Tape pour voir</div></div>)
        :(<div style={{ textAlign:"center" }}><div style={{ fontSize:15, fontWeight:700, color:"#4ade80" }}>{c.a}</div>{c.hint&&<div style={{ fontSize:11, color:"#fbbf24" }}>💡 {c.hint}</div>}</div>)}
      </div>
      {flipped&&(<div style={{ display:"flex", gap:8, marginTop:10 }}>
        <button onClick={()=>{setScores(s=>({...s,ok:s.ok+1}));setFlipped(false);if(idx<cards.length-1)setIdx(idx+1);else setDone(true);}} style={{ flex:1, padding:10, borderRadius:8, border:"none", background:"rgba(34,197,94,.15)", color:"#4ade80", fontSize:13, fontWeight:700, cursor:"pointer" }}>✅ Maîtrise</button>
        <button onClick={()=>{setScores(s=>({...s,ko:s.ko+1}));setFlipped(false);if(idx<cards.length-1)setIdx(idx+1);else setDone(true);}} style={{ flex:1, padding:10, borderRadius:8, border:"none", background:"rgba(239,68,68,.15)", color:"#f87171", fontSize:13, fontWeight:700, cursor:"pointer" }}>❌ Revoir</button>
      </div>)}
    </div>
  );
}

// ══════════════════════════════════════════════
// 5. SCORE DE SESSION
// ══════════════════════════════════════════════
export function SessionScore({ attempted, correct, startTime }) {
  if (attempted === 0) return null;
  const pct = Math.round((correct / attempted) * 100);
  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0;
  const quality = pct >= 80 ? "Excellente" : pct >= 60 ? "Bonne" : pct >= 40 ? "À améliorer" : "Difficile";
  const qColor = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : pct >= 40 ? "#f97316" : "#ef4444";
  return (
    <div style={{ background:"#1e293b", borderRadius:14, padding:14, marginTop:12, border:`1px solid ${qColor}40` }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontSize:13, fontWeight:700 }}>🏆 Score</span><span style={{ fontSize:11, color:"#64748b" }}>{elapsed} min</span></div>
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ width:56, height:56, borderRadius:"50%", border:`3px solid ${qColor}`, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:18, fontWeight:800, color:qColor }}>{pct}%</span></div>
        <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:qColor }}>{quality}</div><div style={{ fontSize:12, color:"#94a3b8" }}>{correct}/{attempted}</div></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// 6. TABLEAU DE BORD TEMPS
// ══════════════════════════════════════════════
export function TimeDistributionAlert() {
  const [data, setData] = useState(null);
  useEffect(() => {
    try {
      const log = JSON.parse(localStorage.getItem("activity_log") || "{}");
      const now = new Date(); const counts = {};
      for (let i = 0; i < 7; i++) { const d = new Date(now); d.setDate(d.getDate()-i); const k = d.toISOString().split("T")[0]; if(log[k]) Object.keys(log[k]).forEach(m => { counts[m]=(counts[m]||0)+1; }); }
      if (Object.keys(counts).length > 0) setData(counts);
    } catch {}
  }, []);
  if (!data) return null;
  const frMa = (data["FR"]||0) + (data["MA"]||0);
  const total = Object.values(data).reduce((a,b) => a+b, 0);
  const frMaPct = total > 0 ? Math.round(frMa / total * 100) : 0;
  const ok = frMaPct >= 50;
  const colors = {FR:"#3b82f6",MA:"#ec4899",SE:"#10b981",HG:"#f59e0b",HI:"#f97316",AN:"#6366f1",ES:"#ef4444",SC:"#14b8a6",EM:"#a855f7"};
  const names = {FR:"Fr",MA:"Ma",SE:"SES",HG:"HG",HI:"HGéo",AN:"Ang",ES:"Esp",SC:"Sci",EM:"EMC"};
  return (
    <div style={{ background:"#1e293b", borderRadius:14, padding:14, marginBottom:12, border:`1px solid ${ok?"#22c55e40":"#ef444440"}` }}>
      <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>📊 Répartition semaine</div>
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>
        {Object.entries(data).sort((a,b)=>b[1]-a[1]).map(([m,c])=>(
          <div key={m} style={{ padding:"4px 10px", borderRadius:8, background:`${colors[m]||"#334155"}20`, color:colors[m]||"#94a3b8", fontSize:11, fontWeight:700 }}>{names[m]||m} {c}</div>
        ))}
      </div>
      {!ok && <div style={{ fontSize:12, color:"#fbbf24", background:"rgba(251,191,36,.08)", padding:"6px 10px", borderRadius:8 }}>⚠️ FR+MA = {frMaPct}% — objectif &gt;50%</div>}
    </div>
  );
}
