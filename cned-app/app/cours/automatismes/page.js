"use client";
import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════
// FICHES MÉTHODES — à lire AVANT de s'entraîner
// ═══════════════════════════════════════════════════════
const METHODES = [
  {
    cat: "Carrés parfaits",
    icon: "🔢",
    contenu: `APPRENDRE PAR CŒUR ces carrés :
1²=1  2²=4  3²=9  4²=16  5²=25
6²=36  7²=49  8²=64  9²=81  10²=100
11²=121  12²=144  13²=169  14²=196  15²=225
16²=256  17²=289  18²=324  19²=361  20²=400
25²=625  30²=900  50²=2500  100²=10000

Astuce 15² : 15×15 = 15×10 + 15×5 = 150+75 = 225
(pas 125 ! → 125 = 5³, c'est un CUBE)`,
  },
  {
    cat: "Racines carrées",
    icon: "√",
    contenu: `√n = "quel nombre au carré donne n ?"

Méthode : tu RECONNAIS le carré parfait.
√196 → je sais que 14²=196, donc √196=14
√144 → 12²=144, donc √144=12
√225 → 15²=225, donc √225=15

⚠️ Piège : √196 ≠ 73 ! 73² = 5329
Si tu ne reconnais pas, ENCADRE :
10²=100 < 196 < 225=15² → entre 10 et 15
13²=169 < 196 < 225=15² → entre 13 et 15
14²=196 ✓`,
  },
  {
    cat: "Multiplier par 0.25 / 0.5 / 0.75",
    icon: "×",
    contenu: `CONVERTIS en fraction d'abord :
0.25 = 1/4 → divise par 4
0.5  = 1/2 → divise par 2
0.75 = 3/4 → multiplie par 3, divise par 4

Exemple : 0.75 × 40
= 3/4 × 40 = (40÷4) × 3 = 10 × 3 = 30

⚠️ 0.75 × 40 ≠ 45
45 serait si tu avais fait 40 + 40÷8... non !
Toujours : 0.75 = trois quarts`,
  },
  {
    cat: "Tables de multiplication",
    icon: "✕",
    contenu: `Les tables difficiles à retenir :
7×7=49  7×8=56  7×9=63
8×8=64  8×9=72  9×9=81
7×12=84  7×13=91  8×13=104

Astuce pour 7×13 :
7×13 = 7×10 + 7×3 = 70+21 = 91 (pas 92 !)

Vérification : si le résultat est PAIR,
le produit de deux impairs ne l'est JAMAIS.
7×13 : 7 impair × 13 impair → résultat IMPAIR
92 est pair → FAUX ! 91 est impair ✓`,
  },
  {
    cat: "Puissances",
    icon: "^",
    contenu: `NE PAS CONFONDRE carrés et cubes :
15² = 15×15 = 225 (carré)
5³  = 5×5×5 = 125 (cube)

2³=8   3³=27   4³=64   5³=125
2⁴=16  2⁵=32  2⁶=64  2⁷=128  2¹⁰=1024
10³=1000  10⁴=10000

Calcul : 2³ × 3² = 8 × 9 = 72
Méthode : calcule CHAQUE puissance séparément`,
  },
  {
    cat: "Division mentale",
    icon: "÷",
    contenu: `Diviser = chercher le multiplicateur.
256 ÷ 8 = ? → 8 × ? = 256
8×30=240, 256-240=16, 16÷8=2 → 8×32=256

Raccourcis :
÷2 : moitié (facile)
÷4 : moitié de la moitié (256÷4=128÷2=64)
÷5 : ×2 puis ÷10 (35÷5 = 70÷10 = 7)
÷8 : moitié 3 fois (256→128→64→32)
÷25 : ×4 puis ÷100`,
  },
];

// ═══════════════════════════════════════════════════════
// BANQUE DE QUESTIONS — Renforcée calcul mental
// ═══════════════════════════════════════════════════════
const BANQUE = [
  // ── CARRÉS PARFAITS (à connaître par cœur) ──
  { q: "11² = ?", a: "121", cat: "Carrés parfaits", m: "11×11 = 121" },
  { q: "12² = ?", a: "144", cat: "Carrés parfaits", m: "12×12 = 144" },
  { q: "13² = ?", a: "169", cat: "Carrés parfaits", m: "13×13 = 169" },
  { q: "14² = ?", a: "196", cat: "Carrés parfaits", m: "14×14 = 196" },
  { q: "15² = ?", a: "225", cat: "Carrés parfaits", m: "15×15 = 225 (≠ 125 qui est 5³)" },
  { q: "16² = ?", a: "256", cat: "Carrés parfaits", m: "16×16 = 256" },
  { q: "17² = ?", a: "289", cat: "Carrés parfaits", m: "17×17 = 289" },
  { q: "18² = ?", a: "324", cat: "Carrés parfaits", m: "18×18 = 324" },
  { q: "19² = ?", a: "361", cat: "Carrés parfaits", m: "19×19 = 361" },
  { q: "20² = ?", a: "400", cat: "Carrés parfaits", m: "20×20 = 400" },
  { q: "25² = ?", a: "625", cat: "Carrés parfaits", m: "25×25 = 625" },
  { q: "30² = ?", a: "900", cat: "Carrés parfaits", m: "30×30 = 900" },
  // ── RACINES CARRÉES ──
  { q: "√144 = ?", a: "12", cat: "Racines carrées", m: "12²=144, donc √144=12" },
  { q: "√196 = ?", a: "14", cat: "Racines carrées", m: "14²=196, donc √196=14" },
  { q: "√225 = ?", a: "15", cat: "Racines carrées", m: "15²=225, donc √225=15" },
  { q: "√169 = ?", a: "13", cat: "Racines carrées", m: "13²=169, donc √169=13" },
  { q: "√256 = ?", a: "16", cat: "Racines carrées", m: "16²=256, donc √256=16" },
  { q: "√289 = ?", a: "17", cat: "Racines carrées", m: "17²=289, donc √289=17" },
  { q: "√324 = ?", a: "18", cat: "Racines carrées", m: "18²=324, donc √324=18" },
  { q: "√361 = ?", a: "19", cat: "Racines carrées", m: "19²=361, donc √361=19" },
  { q: "√400 = ?", a: "20", cat: "Racines carrées", m: "20²=400, donc √400=20" },
  { q: "√81 = ?", a: "9", cat: "Racines carrées", m: "9²=81, donc √81=9" },
  { q: "√49 = ?", a: "7", cat: "Racines carrées", m: "7²=49, donc √49=7" },
  { q: "√121 = ?", a: "11", cat: "Racines carrées", m: "11²=121, donc √121=11" },
  { q: "√625 = ?", a: "25", cat: "Racines carrées", m: "25²=625, donc √625=25" },
  // ── TABLES DIFFICILES ──
  { q: "7 × 8 = ?", a: "56", cat: "Tables", m: "7×8=56 (à connaître par cœur)" },
  { q: "7 × 9 = ?", a: "63", cat: "Tables", m: "7×9=63 → 7×10-7=63" },
  { q: "7 × 12 = ?", a: "84", cat: "Tables", m: "7×12 = 7×10+7×2 = 70+14 = 84" },
  { q: "7 × 13 = ?", a: "91", cat: "Tables", m: "7×13 = 7×10+7×3 = 70+21 = 91 (impair!)" },
  { q: "8 × 7 = ?", a: "56", cat: "Tables", m: "8×7=56" },
  { q: "8 × 9 = ?", a: "72", cat: "Tables", m: "8×9=72" },
  { q: "8 × 12 = ?", a: "96", cat: "Tables", m: "8×12 = 8×10+8×2 = 80+16 = 96" },
  { q: "8 × 13 = ?", a: "104", cat: "Tables", m: "8×13 = 8×10+8×3 = 80+24 = 104" },
  { q: "9 × 9 = ?", a: "81", cat: "Tables", m: "9×9=81" },
  { q: "9 × 12 = ?", a: "108", cat: "Tables", m: "9×12 = 9×10+9×2 = 90+18 = 108" },
  { q: "6 × 13 = ?", a: "78", cat: "Tables", m: "6×13 = 6×10+6×3 = 60+18 = 78" },
  { q: "9 × 13 = ?", a: "117", cat: "Tables", m: "9×13 = 9×10+9×3 = 90+27 = 117" },
  { q: "6 × 17 = ?", a: "102", cat: "Tables", m: "6×17 = 6×10+6×7 = 60+42 = 102" },
  { q: "7 × 15 = ?", a: "105", cat: "Tables", m: "7×15 = 7×10+7×5 = 70+35 = 105" },
  // ── MULTIPLIER PAR DÉCIMAUX ──
  { q: "0,75 × 40 = ?", a: "30", cat: "Décimaux", m: "0.75=3/4 → 40÷4=10, 10×3=30" },
  { q: "0,25 × 80 = ?", a: "20", cat: "Décimaux", m: "0.25=1/4 → 80÷4=20" },
  { q: "0,5 × 36 = ?", a: "18", cat: "Décimaux", m: "0.5=1/2 → 36÷2=18" },
  { q: "0,75 × 120 = ?", a: "90", cat: "Décimaux", m: "3/4 × 120 = 120÷4×3 = 30×3 = 90" },
  { q: "0,25 × 60 = ?", a: "15", cat: "Décimaux", m: "1/4 × 60 = 60÷4 = 15" },
  { q: "0,5 × 70 = ?", a: "35", cat: "Décimaux", m: "1/2 × 70 = 35" },
  { q: "0,75 × 200 = ?", a: "150", cat: "Décimaux", m: "3/4 × 200 = 200÷4×3 = 50×3 = 150" },
  { q: "0,2 × 45 = ?", a: "9", cat: "Décimaux", m: "0.2=1/5 → 45÷5=9" },
  { q: "1,5 × 20 = ?", a: "30", cat: "Décimaux", m: "1.5×20 = 20+20÷2 = 20+10 = 30" },
  { q: "3/4 de 80 = ?", a: "60", cat: "Décimaux", m: "80÷4=20, 20×3=60" },
  // ── PUISSANCES ──
  { q: "2³ = ?", a: "8", cat: "Puissances", m: "2×2×2=8" },
  { q: "3³ = ?", a: "27", cat: "Puissances", m: "3×3×3=27" },
  { q: "5³ = ?", a: "125", cat: "Puissances", m: "5×5×5=125 (≠ 15² qui vaut 225)" },
  { q: "2⁵ = ?", a: "32", cat: "Puissances", m: "2⁵=32 (2,4,8,16,32)" },
  { q: "2¹⁰ = ?", a: "1024", cat: "Puissances", m: "2¹⁰=1024" },
  { q: "4³ = ?", a: "64", cat: "Puissances", m: "4×4×4=64" },
  { q: "2³ × 3² = ?", a: "72", cat: "Puissances", m: "8×9=72 (chaque puissance séparément)" },
  { q: "10³ = ?", a: "1000", cat: "Puissances", m: "10³=1000" },
  // ── DIVISION MENTALE ──
  { q: "256 ÷ 8 = ?", a: "32", cat: "Division", m: "256÷2=128÷2=64÷2=32" },
  { q: "360 ÷ 12 = ?", a: "30", cat: "Division", m: "12×30=360" },
  { q: "144 ÷ 6 = ?", a: "24", cat: "Division", m: "6×24=144 ou 144÷2=72, 72÷3=24" },
  { q: "225 ÷ 15 = ?", a: "15", cat: "Division", m: "15²=225, donc 225÷15=15" },
  { q: "196 ÷ 14 = ?", a: "14", cat: "Division", m: "14²=196, donc 196÷14=14" },
  { q: "450 ÷ 9 = ?", a: "50", cat: "Division", m: "9×50=450" },
  // ── FRACTIONS ──
  { q: "3/4 + 1/3 = ?", a: "13/12", cat: "Fractions", m: "9/12+4/12=13/12" },
  { q: "2/5 × 5/6 = ?", a: "1/3", cat: "Fractions", m: "10/30=1/3 (simplifier 5)" },
  { q: "7/8 − 1/2 = ?", a: "3/8", cat: "Fractions", m: "7/8-4/8=3/8" },
  { q: "3/4 ÷ 2/3 = ?", a: "9/8", cat: "Fractions", m: "3/4 × 3/2 = 9/8" },
  // ── IDENTITÉS ──
  { q: "(x+3)² = ?", a: "x²+6x+9", cat: "Identités", m: "(a+b)²=a²+2ab+b²" },
  { q: "(2x−1)² = ?", a: "4x²-4x+1", cat: "Identités", m: "(a-b)²=a²-2ab+b²" },
  { q: "(x+5)(x−5) = ?", a: "x²-25", cat: "Identités", m: "(a+b)(a-b)=a²-b²" },
  { q: "(3x+2)² = ?", a: "9x²+12x+4", cat: "Identités", m: "a=3x,b=2 → 9x²+12x+4" },
  { q: "Factoriser x²−16", a: "(x-4)(x+4)", cat: "Identités", m: "a²-b² = (a-b)(a+b)" },
  { q: "Factoriser 4x²+4x+1", a: "(2x+1)²", cat: "Identités", m: "(2x)²+2×2x×1+1²" },
  // ── SECOND DEGRÉ ──
  { q: "Δ de x²−5x+6 = ?", a: "1", cat: "Second degré", m: "b²-4ac = 25-24 = 1" },
  { q: "Racines de x²−5x+6 ?", a: "2 et 3", cat: "Second degré", m: "x=(5±1)/2 → 2 et 3" },
  { q: "Sommet de x²−6x+5 : x=?", a: "3", cat: "Second degré", m: "α=-b/(2a)=6/2=3" },
  // ── DÉRIVATION ──
  { q: "f(x)=3x²+2x, f'(x)=?", a: "6x+2", cat: "Dérivation", m: "(xⁿ)'=nxⁿ⁻¹" },
  { q: "f(x)=x³, f'(x)=?", a: "3x²", cat: "Dérivation", m: "(x³)'=3x²" },
  { q: "f(x)=5x−7, f'(x)=?", a: "5", cat: "Dérivation", m: "(ax+b)'=a" },
];

function normalizeCalc(s) {
  if (!s) return "";
  return s.toLowerCase().replace(/\s+/g,"").replace(/,/g,".").replace(/×/g,"*").replace(/÷/g,"/").replace(/\u00B2/g,"²").replace(/\*\*/g,"^").replace(/negatif/g,"négatif").trim();
}

export default function AutomatismesPage() {
  const [mode, setMode] = useState("menu"); // menu | methodes | playing | results
  const [cat, setCat] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ ok:0, ko:0, details:[] });
  const [timeLeft, setTimeLeft] = useState(300);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [methode, setMethode] = useState(null);

  useEffect(() => {
    try {
      const log = JSON.parse(localStorage.getItem("automatismes_log") || "{}");
      const days = Object.entries(log).sort((a,b) => b[0].localeCompare(a[0])).slice(0,7);
      setHistory(days.map(([date, items]) => ({ date, total:items.length, ok:items.filter(i=>i.ok).length })));
    } catch {}
  }, [mode]);

  const categories = [...new Set(BANQUE.map(b => b.cat))];

  const start = () => {
    const pool = cat === "all" ? BANQUE : BANQUE.filter(b => b.cat === cat);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled); setQi(0); setInput(""); setResult(null);
    setScore({ ok:0, ko:0, details:[] }); setTimeLeft(300); setMode("playing");
  };

  useEffect(() => {
    if (mode !== "playing") return;
    timerRef.current = setInterval(() => { setTimeLeft(t => { if(t<=1){setMode("results");return 0;} return t-1; }); }, 1000);
    return () => clearInterval(timerRef.current);
  }, [mode]);

  useEffect(() => { if (mode==="playing" && result===null && inputRef.current) inputRef.current.focus(); }, [qi, result, mode]);

  const check = () => {
    if (!input.trim()) return;
    const q = questions[qi];
    const uN = normalizeCalc(input), cN = normalizeCalc(q.a);
    const ok = uN===cN || input.trim().toLowerCase()===q.a.toLowerCase();
    setResult(ok);
    setScore(s => ({ ...s, ok:s.ok+(ok?1:0), ko:s.ko+(ok?0:1), details:[...s.details, {q:q.q,a:q.a,user:input.trim(),ok,cat:q.cat,methode:q.m}] }));
    try { const td=new Date().toISOString().split("T")[0]; const l=JSON.parse(localStorage.getItem("automatismes_log")||"{}"); if(!l[td])l[td]=[]; l[td].push({q:q.q,ok,cat:q.cat,ts:Date.now()}); localStorage.setItem("automatismes_log",JSON.stringify(l)); } catch {}
  };

  const next = () => {
    if(qi<questions.length-1){setQi(qi+1);setInput("");setResult(null);}
    else{clearInterval(timerRef.current);setMode("results");}
  };

  const mm = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const ss = String(timeLeft%60).padStart(2,"0");
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDone = history.find(h => h.date === todayStr);

  // ── FICHE MÉTHODE ──
  if (methode !== null) {
    const m = METHODES[methode];
    return (
      <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <span onClick={() => setMethode(null)} style={{ fontSize:22, color:"#94a3b8", cursor:"pointer" }}>←</span>
          <div style={{ fontSize:20, fontWeight:800 }}>{m.icon} {m.cat}</div>
        </div>
        <div style={{ background:"#1e293b", borderRadius:14, padding:20, borderLeft:"4px solid #ec4899" }}>
          <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, lineHeight:1.8, margin:0, color:"#e2e8f0" }}>{m.contenu}</pre>
        </div>
        <button onClick={() => { setMethode(null); setCat(m.cat === "Carrés parfaits" || m.cat === "Tables de multiplication" || m.cat === "Multiplier par 0.25 / 0.5 / 0.75" ? "all" : m.cat); start(); }}
          style={{ marginTop:16, width:"100%", padding:14, borderRadius:12, border:"none", background:"#ec4899", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>
          🚀 S'entraîner maintenant
        </button>
      </div>
    );
  }

  // ── MENU ──
  if (mode === "menu") return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <a href="/cours" style={{ fontSize:22, color:"#94a3b8", textDecoration:"none" }}>←</a>
        <div>
          <div style={{ fontSize:22, fontWeight:800 }}>🧮 Automatismes Maths</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>5 min/jour · Sans calculatrice · Format bac</div>
        </div>
      </div>

      {todayDone && (
        <div style={{ background: todayDone.ok >= todayDone.total * 0.7 ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)", borderRadius:14, padding:14, marginBottom:16, border: todayDone.ok >= todayDone.total * 0.7 ? "1px solid #22c55e40" : "1px solid #ef444440" }}>
          <span style={{ fontWeight:700, color: todayDone.ok >= todayDone.total * 0.7 ? "#22c55e" : "#f87171" }}>Aujourd'hui : {todayDone.ok}/{todayDone.total}</span>
        </div>
      )}

      {/* FICHES MÉTHODES */}
      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16, border:"2px solid #f59e0b" }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:10, color:"#fbbf24" }}>📖 Fiches méthodes — LIS D'ABORD</div>
        <div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>Les techniques pour réussir chaque type de calcul.</div>
        {METHODES.map((m, i) => (
          <div key={i} onClick={() => setMethode(i)}
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", background:"#0f172a", borderRadius:10, marginBottom:6, cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>{m.icon}</span>
              <span style={{ fontSize:14, fontWeight:600 }}>{m.cat}</span>
            </div>
            <span style={{ color:"#fbbf24", fontSize:13 }}>→</span>
          </div>
        ))}
      </div>

      {/* CATÉGORIE */}
      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, marginBottom:10 }}>Catégorie</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <div onClick={() => setCat("all")} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:cat==="all"?"#ec4899":"#0f172a", color:cat==="all"?"#fff":"#94a3b8" }}>
            Tout ({BANQUE.length})
          </div>
          {categories.map(c => (
            <div key={c} onClick={() => setCat(c)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:cat===c?"#ec4899":"#0f172a", color:cat===c?"#fff":"#94a3b8" }}>
              {c} ({BANQUE.filter(b=>b.cat===c).length})
            </div>
          ))}
        </div>
      </div>

      <button onClick={start} style={{ width:"100%", padding:16, borderRadius:14, border:"none", background:"linear-gradient(135deg,#ec4899,#f43f5e)", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer", marginBottom:20 }}>
        🚀 Lancer — 10 questions en 5 min
      </button>

      {history.length > 0 && (
        <div style={{ background:"#1e293b", borderRadius:14, padding:16 }}>
          <div style={{ fontWeight:700, marginBottom:10 }}>📈 Historique</div>
          {history.map(h => { const p = h.total>0?Math.round(h.ok/h.total*100):0; return (
            <div key={h.date} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #334155", fontSize:12 }}>
              <span style={{ color:"#94a3b8" }}>{h.date}</span>
              <span style={{ fontWeight:700, color:p>=70?"#22c55e":"#f59e0b" }}>{h.ok}/{h.total} ({p}%)</span>
            </div>
          ); })}
        </div>
      )}
    </div>
  );

  // ── RÉSULTATS ──
  if (mode === "results") {
    const total = score.ok + score.ko;
    const pct = total > 0 ? Math.round(score.ok / total * 100) : 0;
    const byCat = {};
    score.details.forEach(d => { if(!byCat[d.cat]) byCat[d.cat]={ok:0,ko:0}; if(d.ok) byCat[d.cat].ok++; else byCat[d.cat].ko++; });
    const errors = score.details.filter(d => !d.ok);

    return (
      <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{pct>=80?"🏆":pct>=60?"👍":"💪"}</div>
          <div style={{ fontSize:32, fontWeight:800 }}>{score.ok}/{total}</div>
          <div style={{ fontSize:16, fontWeight:600, color:pct>=80?"#22c55e":pct>=60?"#fbbf24":"#f87171", marginTop:4 }}>
            {pct>=80?"Réflexes au point !":pct>=60?"Progresse — continue.":"À travailler quotidiennement."}
          </div>
        </div>

        <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16 }}>
          <div style={{ fontWeight:700, marginBottom:10 }}>Par catégorie</div>
          {Object.entries(byCat).map(([c,v]) => (
            <div key={c} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0" }}>
              <span style={{ fontSize:13 }}>{c}</span>
              <span style={{ fontSize:13, fontWeight:700, color:v.ko===0?"#22c55e":"#f59e0b" }}>{v.ok}/{v.ok+v.ko}</span>
            </div>
          ))}
        </div>

        {errors.length > 0 && (
          <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16, border:"1px solid rgba(239,68,68,.3)" }}>
            <div style={{ fontWeight:700, marginBottom:10, color:"#fca5a5" }}>❌ À revoir — avec la méthode</div>
            {errors.map((d, i) => (
              <div key={i} style={{ marginBottom:12, padding:12, background:"#0f172a", borderRadius:10, fontSize:13 }}>
                <div style={{ fontWeight:700, marginBottom:4 }}>{d.q}</div>
                <div style={{ color:"#ef4444", fontSize:12 }}>Ta réponse : {d.user}</div>
                <div style={{ color:"#22c55e", fontSize:12, marginBottom:4 }}>Bonne réponse : {d.a}</div>
                {d.methode && <div style={{ color:"#fbbf24", fontSize:12, padding:"6px 8px", background:"rgba(251,191,36,.08)", borderRadius:6, marginTop:4, lineHeight:1.5 }}>💡 {d.methode}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setMode("menu")} style={{ flex:1, padding:14, borderRadius:12, border:"none", background:"#334155", color:"#e2e8f0", fontWeight:700, cursor:"pointer" }}>← Menu</button>
          <button onClick={start} style={{ flex:1, padding:14, borderRadius:12, border:"none", background:"#ec4899", color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄 Relancer</button>
        </div>
      </div>
    );
  }

  // ── JEU ──
  const q = questions[qi];
  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#ec4899" }}>{q.cat}</span>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <span style={{ fontSize:13, color:"#94a3b8" }}>{qi+1}/{questions.length}</span>
          <span style={{ fontSize:20, fontWeight:800, fontFamily:"monospace", color:timeLeft<60?"#ef4444":"#e2e8f0" }}>{mm}:{ss}</span>
        </div>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <div style={{ flex:1, textAlign:"center", padding:8, borderRadius:8, background:"rgba(34,197,94,.1)", color:"#22c55e", fontWeight:700 }}>✓ {score.ok}</div>
        <div style={{ flex:1, textAlign:"center", padding:8, borderRadius:8, background:"rgba(239,68,68,.1)", color:"#ef4444", fontWeight:700 }}>✗ {score.ko}</div>
      </div>

      <div style={{ background:"#1e293b", borderRadius:14, padding:24, marginBottom:16, textAlign:"center", minHeight:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:22, fontWeight:800 }}>{q.q}</div>
      </div>

      {result === null ? (
        <div style={{ display:"flex", gap:8 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && check()}
            placeholder="Ta réponse..." autoFocus autoComplete="off"
            style={{ flex:1, padding:14, borderRadius:12, border:"2px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:16, fontWeight:600 }} />
          <button onClick={check} style={{ padding:"14px 20px", borderRadius:12, border:"none", background:"#ec4899", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>OK</button>
        </div>
      ) : (
        <div>
          <div style={{ padding:14, borderRadius:12, background:result?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)", border:`2px solid ${result?"#22c55e":"#ef4444"}`, marginBottom:10 }}>
            {result ? (
              <div style={{ textAlign:"center", fontWeight:800, fontSize:16, color:"#22c55e" }}>✓ Correct !</div>
            ) : (
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:"#ef4444", marginBottom:4, textAlign:"center" }}>✗ Incorrect</div>
                <div style={{ fontSize:14, color:"#94a3b8", textAlign:"center" }}>Réponse : <strong style={{ color:"#22c55e" }}>{q.a}</strong></div>
                {q.m && <div style={{ fontSize:13, color:"#fbbf24", marginTop:8, padding:"8px 10px", background:"rgba(251,191,36,.08)", borderRadius:8, lineHeight:1.6 }}>💡 {q.m}</div>}
              </div>
            )}
          </div>
          <button onClick={next} style={{ width:"100%", padding:14, borderRadius:12, border:"none", background:"#6366f1", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>
            {qi < questions.length - 1 ? "Question suivante →" : "Voir le score"}
          </button>
        </div>
      )}

      <div style={{ display:"flex", gap:4, marginTop:16 }}>
        {questions.map((_, i) => {
          const d = score.details[i];
          return <div key={i} style={{ flex:1, height:4, borderRadius:2, background:!d?"#334155":d.ok?"#22c55e":"#ef4444" }} />;
        })}
      </div>
    </div>
  );
}
