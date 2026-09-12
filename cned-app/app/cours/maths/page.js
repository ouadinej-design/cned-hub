"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

function logActivity(matiere) {
  const today = new Date().toISOString().split("T")[0];
  try {
    const log = JSON.parse(localStorage.getItem("activity_log") || "{}");
    if (!log[today]) log[today] = {};
    log[today][matiere] = Date.now();
    localStorage.setItem("activity_log", JSON.stringify(log));
  } catch {}
  supabase.from("activity_log").upsert({ event_date: today, matiere, ts: Date.now() }, { onConflict: "event_date,matiere" }).then(() => {}, () => {});
}

function logDifficulty(matiereFull, seance, question, userAnswer, correctAnswer, hint) {
  const today = new Date().toISOString().split("T")[0];
  try {
    const log = JSON.parse(localStorage.getItem("difficulties_log") || "{}");
    if (!log[today]) log[today] = {};
    if (!log[today][matiereFull]) log[today][matiereFull] = [];
    log[today][matiereFull].push({ type: "exercice", seance, question, userAnswer, correctAnswer, hint, ts: Date.now() });
    localStorage.setItem("difficulties_log", JSON.stringify(log));
  } catch {}
  supabase.from("difficulties_log").insert({ event_date: today, matiere: matiereFull, type: "exercice", seance, question, user_answer: userAnswer, correct_answer: correctAnswer, hint, ts: Date.now() }).then(() => {}, () => {});
}

function logQuizResult(matiereFull, seance, score, total, wrongQuestions) {
  const today = new Date().toISOString().split("T")[0];
  try {
    const log = JSON.parse(localStorage.getItem("difficulties_log") || "{}");
    if (!log[today]) log[today] = {};
    if (!log[today][matiereFull]) log[today][matiereFull] = [];
    log[today][matiereFull].push({ type: "quiz", seance, score, total, wrongQuestions, ts: Date.now() });
    localStorage.setItem("difficulties_log", JSON.stringify(log));
  } catch {}
  supabase.from("difficulties_log").insert({ event_date: today, matiere: matiereFull, type: "quiz", seance, score, total, wrong_questions: wrongQuestions, ts: Date.now() }).then(() => {}, () => {});
}

const SEANCES = [
  {
    id: 1, title: "Développer et factoriser",
    lessons: [
      { title: "Double distributivité", content: "Pour développer (a+b)(c+d), on applique :\n(a+b)(c+d) = ac + ad + bc + bd\n\nExemple : (2x+3)(x−1) = 2x² − 2x + 3x − 3 = 2x² + x − 3" },
      { title: "Identités remarquables", content: "Les trois identités remarquables :\n\n• (a+b)² = a² + 2ab + b²\n• (a−b)² = a² − 2ab + b²\n• (a+b)(a−b) = a² − b²\n\nExemple : (3x+2)² = 9x² + 12x + 4" },
      { title: "Factoriser", content: "Factoriser = écrire comme un produit.\n\nRepérer un facteur commun :\n6x² + 3x = 3x(2x + 1)\n\nReconnaître une identité remarquable :\nx² − 9 = (x−3)(x+3)\n4x² + 12x + 9 = (2x+3)²" }
    ],
    exercises: [
      { q: "Développer (x+5)(x−2)", answer: "x²+3x-10", hint: "Applique (a+b)(c+d) = ac+ad+bc+bd", level: 1 },
      { q: "Factoriser x² − 16", answer: "(x-4)(x+4)", hint: "C'est a²−b² avec a=x et b=4", level: 1 },
      { q: "Développer (2x−3)²", answer: "4x²-12x+9", hint: "(a−b)² = a²−2ab+b²", level: 2 },
      { q: "Factoriser 9x² + 6x + 1", answer: "(3x+1)²", hint: "Reconnaître (a+b)² = a²+2ab+b²", level: 3 }
    ],
    quiz: [
      { q: "(x+3)(x−3) = ?", options: ["x²−9", "x²+9", "x²−6x+9", "x²+6x+9"], correct: 0 },
      { q: "Quelle identité pour x²+10x+25 ?", options: ["(x+5)²", "(x−5)²", "(x+5)(x−5)", "Aucune"], correct: 0 },
      { q: "(a−b)² = ?", options: ["a²−2ab+b²", "a²+2ab+b²", "a²−b²", "a²+b²"], correct: 0 }
    ]
  },
  {
    id: 2, title: "Polynômes ax² + bx + c",
    lessons: [
      { title: "Définition", content: "f(x) = ax² + bx + c avec a ≠ 0.\n\n• a = coefficient de x² (dominant)\n• b = coefficient de x\n• c = terme constant = f(0)" },
      { title: "Calcul d'images", content: "f(x) = 3x²−x+4, f(2) = 3×4 − 2 + 4 = 14\n\nPour les antécédents de k, résoudre f(x) = k." },
      { title: "La parabole", content: "Courbe de f(x) = ax²+bx+c = parabole.\n\n• a > 0 : parabole vers le HAUT (∪) → minimum\n• a < 0 : parabole vers le BAS (∩) → maximum\n\nAxe de symétrie : x = −b/(2a)" },
      { title: "Lecture graphique", content: "Sur le graphique :\n• Sommet S(α ; β)\n• Axe de symétrie x = α\n• Racines = intersections avec l'axe des x\n• c = ordonnée à l'origine" }
    ],
    exercises: [
      { q: "f(x)=2x²−3x+1. Quels sont a, b, c ?", answer: "a=2,b=-3,c=1", hint: "Identifier les coefficients", level: 1 },
      { q: "f(3) pour f(x)=x²−4x+3 ?", answer: "0", hint: "f(3) = 9 − 12 + 3", level: 1 },
      { q: "f(x)=−2x²+x. Parabole vers... ?", answer: "bas", hint: "Signe de a ?", level: 2 }
    ],
    quiz: [
      { q: "Si a < 0, la parabole est tournée vers...", options: ["Le bas (∩)", "Le haut (∪)", "La droite", "La gauche"], correct: 0 },
      { q: "f(0) pour f(x)=3x²−7x+2 ?", options: ["2", "3", "−7", "0"], correct: 0 },
      { q: "L'axe de symétrie est x = ?", options: ["−b/(2a)", "b/(2a)", "−b/a", "c/a"], correct: 0 }
    ]
  },
  {
    id: 3, title: "Forme canonique et variations",
    lessons: [
      { title: "Forme canonique", content: "f(x) = a(x − α)² + β\n\nα = −b/(2a)  (abscisse du sommet)\nβ = f(α)  (ordonnée du sommet)\n\nSommet S(α ; β)" },
      { title: "Mise sous forme canonique", content: "f(x) = 2x²+8x+3 :\n1) α = −8/4 = −2\n2) β = f(−2) = 8−16+3 = −5\n3) f(x) = 2(x+2)² − 5" },
      { title: "Tableau de variations", content: "a > 0 : décroissante puis croissante → minimum β en α\na < 0 : croissante puis décroissante → maximum β en α" }
    ],
    exercises: [
      { q: "α pour f(x)=x²−6x+5 ?", answer: "3", hint: "α = 6/2 = 3", level: 1 },
      { q: "β pour f(x)=x²−6x+5 ?", answer: "-4", hint: "β = f(3) = 9−18+5", level: 2 },
      { q: "Forme canonique de x²−6x+5 ?", answer: "(x-3)²-4", hint: "a(x−α)²+β", level: 2 },
      { q: "Forme canonique de 3x²+12x−7 ?", answer: "3(x+2)²-19", hint: "α=−12/6=−2, β=12−24−7=−19", level: 3 },
      { q: "Forme canonique de −2x²+5x+1 ?", answer: "-2(x-5/4)²+33/8", hint: "α=−5/(2×−2)=5/4, β=f(5/4)=33/8", level: 3 },
      { q: "α et β pour f(x)=½x²−3x+4 ? (réponse: α;β)", answer: "3;-1/2", hint: "α=3/(2×½)=3, β=½×9−9+4=−½", level: 3 },
      { q: "f(x)=ax²+bx+c, sommet S(2;−3), f(0)=5. a=?", answer: "2", hint: "c=5, β=a(0−2)²−3=5 → 4a=8", level: 3 },
      { q: "f(x)=−3x²+18x−25. Maximum = ?", answer: "2", hint: "α=−18/−6=3, β=−27+54−25=2", level: 3 },
      { q: "f(x)=4x²−2x+1. Forme canonique ?", answer: "4(x-1/4)²+3/4", hint: "α=2/8=1/4, β=4/16−2/4+1=3/4", level: 3 },
      { q: "f(x)=−x²+4x−k. Max=7, k=?", answer: "-3", hint: "α=2, max=−4+8−k=4−k=7 → k=−3", level: 3 },
      { q: "Montrer que 2x²−8x+11>0 : minimum = ?", answer: "3", hint: "2(x−2)²+3, min=3>0 donc toujours positif", level: 3 }
    ],
    quiz: [
      { q: "α = ?", options: ["−b/(2a)", "b/(2a)", "−c/a", "Δ/(2a)"], correct: 0 },
      { q: "Si a>0, le sommet est un...", options: ["Minimum", "Maximum", "Point d'inflexion", "Zéro"], correct: 0 },
      { q: "f(x)=3(x−1)²+5. Sommet ?", options: ["S(1;5)", "S(−1;5)", "S(1;−5)", "S(3;5)"], correct: 0 }
    ]
  },
  {
    id: 4, title: "Exercices sur les variations",
    lessons: [
      { title: "Méthode", content: "1) Calculer α = −b/(2a)\n2) Calculer β = f(α)\n3) Signe de a → sens de variation\n4) Dresser le tableau" }
    ],
    exercises: [
      { q: "f(x)=x²+2x−3. Sommet ?", answer: "(-1;-4)", hint: "α=−1, β=1−2−3=−4", level: 1 },
      { q: "f(x)=−x²+6x−8. Max ou min ?", answer: "max", hint: "a<0", level: 1 },
      { q: "f(x)=3x²−12x+7. f croissante sur ?", answer: "[2;+∞[", hint: "a>0, α=2", level: 3 }
    ],
    quiz: [
      { q: "f(x)=−2x²+8x. α = ?", options: ["2", "−2", "4", "8"], correct: 0 },
      { q: "Même f. β = ?", options: ["8", "4", "0", "−8"], correct: 0 },
      { q: "Même f. f décroissante sur...", options: ["[2;+∞[", "]−∞;2]", "ℝ", "[0;4]"], correct: 0 }
    ]
  },
  {
    id: 5, title: "Résolutions guidées d'équations",
    lessons: [
      { title: "ax²+bx=0", content: "x(ax+b) = 0 → x = 0 ou x = −b/a\n\nEx: 3x²−6x = 0 → x(3x−6) = 0 → x=0 ou x=2" },
      { title: "ax²+c=0", content: "x² = −c/a\n• −c/a > 0 : x = ±√(−c/a)\n• −c/a < 0 : pas de solution" },
      { title: "Le discriminant", content: "Δ = b² − 4ac\n\n• Δ < 0 : pas de solution\n• Δ = 0 : x₀ = −b/(2a)\n• Δ > 0 : deux solutions" },
      { title: "Formule des racines", content: "x₁ = (−b − √Δ)/(2a)\nx₂ = (−b + √Δ)/(2a)\n\nEx: x²−5x+6=0, Δ=1, x₁=2, x₂=3" }
    ],
    exercises: [
      { q: "Résoudre 2x²−8x = 0", answer: "0;4", hint: "2x(x−4) = 0", level: 1 },
      { q: "Δ pour x²−3x+2 = 0 ?", answer: "1", hint: "9 − 8", level: 1 },
      { q: "Solutions de x²−3x+2 = 0 ?", answer: "1;2", hint: "x=(3±1)/2", level: 2 },
      { q: "Résoudre 2x²−7x+3 = 0", answer: "0.5;3", hint: "Δ=25, x=(7±5)/4", level: 3 }
    ],
    quiz: [
      { q: "Δ = ?", options: ["b²−4ac", "b²+4ac", "4ac−b²", "√(b²−4ac)"], correct: 0 },
      { q: "Si Δ = 0, combien de solutions ?", options: ["1 (double)", "0", "2", "∞"], correct: 0 },
      { q: "x²−4x+4 = 0 ?", options: ["x=2 (double)", "x=−2", "x=2 et −2", "Pas de solution"], correct: 0 }
    ]
  },
  {
    id: 6, title: "Résolution dans ℝ",
    lessons: [
      { title: "Méthode complète", content: "1) Identifier a, b, c\n2) Δ = b²−4ac\n3) Conclure selon Δ\n4) Calculer les racines" },
      { title: "Problèmes concrets", content: "Trajectoire : f(t) = −2.1t²+2.52t+1.344\nHauteur max : α = 0.6s, f(0.6) = 2.1m\nSol : f(t) = 0 → résoudre" },
      { title: "Polynôme degré 3", content: "P(x)=x³−2x²−11x+12\n1) P(1)=0 → x=1 racine\n2) P(x)=(x−1)(x²−x−12)\n3) x²−x−12=0: x=4, x=−3" }
    ],
    exercises: [
      { q: "Résoudre 3x²−12x+12 = 0", answer: "2", hint: "Δ=0, racine double", level: 1 },
      { q: "Résoudre −x²+5x−6 = 0", answer: "2;3", hint: "Δ=1", level: 2 }
    ],
    quiz: [
      { q: "Δ de 5x²−3x+1=0 ?", options: ["−11", "29", "11", "−29"], correct: 0 },
      { q: "Nb solutions pour 5x²−3x+1=0 ?", options: ["0", "1", "2", "∞"], correct: 0 }
    ]
  },
  {
    id: 7, title: "Forme factorisée",
    lessons: [
      { title: "Les 3 cas", content: "Δ < 0 : pas de factorisation dans ℝ\nΔ = 0 : f(x) = a(x−x₀)²\nΔ > 0 : f(x) = a(x−x₁)(x−x₂)" },
      { title: "Relations de Viète", content: "x₁ + x₂ = −b/a\nx₁ × x₂ = c/a" },
      { title: "Applications", content: "Somme=7, produit=10 → racines de t²−7t+10=0\nΔ=9, t=5 ou t=2" }
    ],
    exercises: [
      { q: "Factoriser x²−5x+6", answer: "(x-2)(x-3)", hint: "Racines 2 et 3", level: 1 },
      { q: "Somme+produit racines de 2x²−10x+8=0 ?", answer: "S=5,P=4", hint: "S=10/2, P=8/2", level: 2 },
      { q: "Deux nombres : somme 9, produit 20 ?", answer: "4;5", hint: "t²−9t+20=0", level: 2 }
    ],
    quiz: [
      { q: "Si Δ<0, forme factorisée ?", options: ["N'existe pas", "Racine double", "2 racines", "Toujours"], correct: 0 },
      { q: "x₁+x₂ = ?", options: ["−b/a", "b/a", "c/a", "−c/a"], correct: 0 },
      { q: "x₁×x₂ = ?", options: ["c/a", "−c/a", "b/a", "−b/a"], correct: 0 }
    ]
  },
  {
    id: 8, title: "Signe d'une fonction du 2nd degré",
    lessons: [
      { title: "Règle du signe", content: "Δ < 0 : f(x) du signe de a pour tout x\nΔ = 0 : du signe de a, nul en x₀\nΔ > 0 : signe de a SAUF entre les racines" },
      { title: "Tableau de signes", content: "a > 0, Δ > 0, racines x₁ < x₂ :\nf(x) : + | 0 | − | 0 | +\n\nRetenir : signe de a à l'extérieur" },
      { title: "Inéquations", content: "x²−3x+2 ≥ 0\nRacines 1,2, a>0\nSolution : ]−∞;1] ∪ [2;+∞[" }
    ],
    exercises: [
      { q: "Signe de x²+1 pour tout x ?", answer: "positif", hint: "Δ<0, a>0", level: 1 },
      { q: "f(x)=−3x²−12x−13. Signe ?", answer: "negatif", hint: "Δ<0, a<0", level: 2 },
      { q: "Résoudre x²−x−6 > 0", answer: "]-∞;-2[∪]3;+∞[", hint: "Racines −2,3, a>0", level: 3 }
    ],
    quiz: [
      { q: "Δ<0, a>0 → f(x) est...", options: ["Toujours +", "Toujours −", "Change", "Nul"], correct: 0 },
      { q: "a>0, racines 1,4. f(x)<0 sur...", options: ["]1;4[", "ℝ\\{1;4}", "]−∞;1[∪]4;+∞[", "∅"], correct: 0 }
    ]
  },
  {
    id: 9, title: "Exercices : études de signes",
    lessons: [
      { title: "Signe d'un produit", content: "f(x)=(2x−4)(x²+x+1)\n1) 2x−4 : nul en 2, − avant, + après\n2) x²+x+1 : Δ<0, toujours +\n3) f a le signe de (2x−4)" },
      { title: "Signe d'un quotient", content: "f(x)=(−x²+2x)/(x−3), ℝ\\{3}\n1) Numérateur : −x(x−2), racines 0,2\n2) Dénominateur : x−3, nul en 3\n3) Tableau à 3 lignes" },
      { title: "Positions relatives", content: "f(x)=3x²+4x−2 vs g(x)=−x²−x+4\nh=g−f=−4x²−5x+6\nh>0 → g au-dessus, h<0 → f au-dessus" }
    ],
    exercises: [
      { q: "f(x)=(x−1)(x²+3). Signe de x²+3 ?", answer: "toujours positif", hint: "Δ<0, a>0", level: 1 },
      { q: "Même f. f(x)>0 quand ?", answer: "x>1", hint: "Signe de f = signe de (x−1)", level: 2 }
    ],
    quiz: [
      { q: "Pour un quotient, on étudie...", options: ["Num. et dén. séparément", "Directement", "Seulement num.", "Seulement dén."], correct: 0 },
      { q: "x²+x+1. Δ = ?", options: ["−3", "5", "0", "3"], correct: 0 }
    ]
  }
];

const LEVELS = { 1: { label: "Facile", c: "#22c55e" }, 2: { label: "Moyen", c: "#f59e0b" }, 3: { label: "Difficile", c: "#ef4444" } };

export default function MathsPage() {
  useEffect(() => {
    let seconds = 0;
    const flush = () => {
      if (seconds > 0) {
        const today = new Date().toISOString().split("T")[0];
        supabase.from("time_log").insert({ event_date: today, matiere: "MA", seconds, ts: Date.now() }).then(() => {}, () => {});
        seconds = 0;
      }
    };
    const iv = setInterval(() => { if (document.visibilityState === "visible") seconds += 30; }, 30000);
    const flushIv = setInterval(flush, 30000);
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", flush);
    return () => { clearInterval(iv); clearInterval(flushIv); flush(); document.removeEventListener("visibilitychange", onHide); window.removeEventListener("beforeunload", flush); };
  }, []);

  const [view, setView] = useState("home");
  const [si, setSi] = useState(0);
  const [li, setLi] = useState(0);
  const [tab, setTab] = useState("cours");
  const [prog, setProg] = useState(() => { try { const s = typeof window!=="undefined" && localStorage.getItem("mp"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const save = (p) => { setProg(p); try { localStorage.setItem("mp", JSON.stringify(p)); } catch {} };
  const mark = (id, t) => { if (!prog[`${id}_${t}`]) { save({ ...prog, [`${id}_${t}`]: true }); logActivity("MA"); } };
  const done = (id, t) => !!prog[`${id}_${t}`];
  const s = SEANCES[si];
  const total = SEANCES.length * 3;
  const cnt = SEANCES.reduce((n, x) => n + (done(x.id,"lessons")?1:0) + (done(x.id,"exercises")?1:0) + (done(x.id,"quiz")?1:0), 0);
  const pct = Math.round(cnt/total*100);

  if (view === "home") return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <a href="/cours" style={{ fontSize:22, color:"#94a3b8", textDecoration:"none" }}>←</a>
        <div>
          <div style={{ fontSize:24, fontWeight:800 }}>📐 Prof de Maths IA</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Séquence 1 — Polynômes du second degré</div>
        </div>
      </div>
      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontWeight:700 }}>Progression</span><span style={{ color:"#818cf8", fontWeight:700 }}>{pct}%</span></div>
        <div style={{ height:10, background:"#334155", borderRadius:5, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#6366f1,#818cf8)", borderRadius:5, transition:"width .5s" }} /></div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:6 }}>{cnt}/{total} complétés</div>
      </div>
      {SEANCES.map((x, i) => { const d = [done(x.id,"lessons"), done(x.id,"exercises"), done(x.id,"quiz")]; const c = d.filter(Boolean).length; return (
        <div key={x.id} onClick={() => { setSi(i); setView("s"); setTab("cours"); setLi(0); }}
          style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10, cursor:"pointer", borderLeft:`4px solid ${c===3?"#22c55e":c>0?"#f59e0b":"#334155"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:12, color:"#818cf8", fontWeight:600 }}>Séance {x.id}</div><div style={{ fontWeight:700, fontSize:15 }}>{x.title}</div></div>
            <div style={{ display:"flex", gap:4 }}>{["📖","✏️","🧪"].map((e,j) => <span key={j} style={{ fontSize:16, opacity:d[j]?1:0.3 }}>{e}</span>)}</div>
          </div>
        </div>
      ); })}
    </div>
  );

  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ background:"#1e293b", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10, borderBottom:"1px solid #334155" }}>
        <span onClick={() => setView("home")} style={{ cursor:"pointer", fontSize:22 }}>←</span>
        <div><div style={{ fontSize:12, color:"#818cf8" }}>Séance {s.id}</div><div style={{ fontWeight:700, fontSize:16 }}>{s.title}</div></div>
      </div>
      <div style={{ display:"flex", padding:"12px 16px", gap:0 }}>
        {[["cours","📖 Cours"],["exercices","✏️ Exos"],["quiz","🧪 Quiz"]].map(([k,l]) => (
          <div key={k} onClick={() => setTab(k)} style={{ flex:1, textAlign:"center", padding:"10px 0", borderRadius:10, background:tab===k?"#6366f1":"transparent", color:tab===k?"#fff":"#94a3b8", fontWeight:600, fontSize:13, cursor:"pointer" }}>
            {l}{done(s.id,k==="cours"?"lessons":k)?" ✓":""}
          </div>
        ))}
      </div>
      <div style={{ padding:"0 16px 80px" }}>
        {tab === "cours" && <Cours s={s} li={li} setLi={setLi} mark={mark} />}
        {tab === "exercices" && <Exos s={s} mark={mark} />}
        {tab === "quiz" && <Quiz s={s} mark={mark} />}
      </div>
    </div>
  );
}

function Cours({ s, li, setLi, mark }) {
  const [dn, setDn] = useState([]);
  const l = s.lessons[li];
  const next = () => { const nd = [...dn, li]; setDn(nd); if (li < s.lessons.length-1) setLi(li+1); if (nd.length >= s.lessons.length) mark(s.id, "lessons"); };
  return (<div>
    <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
      {s.lessons.map((x,i) => <div key={i} onClick={() => setLi(i)} style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:i===li?"#6366f1":dn.includes(i)?"rgba(34,197,94,.15)":"#1e293b", color:i===li?"#fff":dn.includes(i)?"#22c55e":"#94a3b8" }}>{i+1}. {x.title}</div>)}
    </div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18, borderLeft:"4px solid #6366f1" }}>
      <div style={{ fontSize:16, fontWeight:700, marginBottom:10, color:"#818cf8" }}>{l.title}</div>
      <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, lineHeight:1.7, margin:0, color:"#e2e8f0" }}>{l.content}</pre>
    </div>
    <AiChat ctx={`Séance ${s.id}: ${s.title} — ${l.title}`} txt={l.content} />
    <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
      <button onClick={() => li>0&&setLi(li-1)} disabled={li===0} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#1e293b", color:"#e2e8f0", fontWeight:600, cursor:li===0?"not-allowed":"pointer", opacity:li===0?.5:1 }}>← Précédent</button>
      <button onClick={next} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#6366f1", color:"#fff", fontWeight:600, cursor:"pointer" }}>{li<s.lessons.length-1?"Suivant →":"Terminé ✓"}</button>
    </div>
  </div>);
}

function Exos({ s, mark }) {
  const [ans, setAns] = useState({});
  const [res, setRes] = useState({});
  const [fl, setFl] = useState(0);
  const exs = fl===0 ? s.exercises : s.exercises.filter(e => e.level===fl);
  useEffect(() => { if (Object.keys(res).length >= s.exercises.length) mark(s.id, "exercises"); }, [res]);
  return (<div>
    <div style={{ display:"flex", gap:6, marginBottom:16 }}>
      {[0,1,2,3].map(l => <div key={l} onClick={() => setFl(l)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:fl===l?(l===0?"#6366f1":LEVELS[l]?.c):"#1e293b", color:fl===l?"#fff":"#94a3b8" }}>{l===0?"Tous":LEVELS[l].label}</div>)}
    </div>
    {exs.map((ex) => { const gi = s.exercises.indexOf(ex); const r = res[gi]; return (
      <div key={gi} style={{ background:"#1e293b", borderRadius:14, padding:18, marginBottom:12, borderLeft:`3px solid ${LEVELS[ex.level].c}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:12, fontWeight:600, color:LEVELS[ex.level].c }}>{LEVELS[ex.level].label}</span>
          {r!==undefined && <span style={{ fontSize:12, fontWeight:700, color:r?"#22c55e":"#ef4444" }}>{r?"✓ Correct":"✗ Incorrect"}</span>}
        </div>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:10 }}>{ex.q}</div>
        <input value={ans[gi]||""} onChange={e => setAns({...ans,[gi]:e.target.value})} placeholder="Ta réponse..."
          style={{ width:"100%", padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:14, boxSizing:"border-box" }} />
        <div style={{ display:"flex", gap:8, marginTop:10 }}>
          <button onClick={() => { const a=(ans[gi]||"").toLowerCase().replace(/\s/g,""); const c=ex.answer.toLowerCase().replace(/\s/g,""); const ok=a===c||a.includes(c)||c.includes(a); setRes({...res,[gi]:ok}); if(!ok) logDifficulty("Maths", s.title, ex.q, ans[gi]||"(vide)", ex.answer, ex.hint); supabase.from("attempts_log").insert({ event_date:new Date().toISOString().split("T")[0], matiere:"MA", seance:s.title, type:"exercice", identifier:ex.q, correct:ok, ts:Date.now() }).then(()=>{},()=>{}); }}
            style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#6366f1", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Vérifier</button>
          {r===false && <button onClick={() => alert("💡 "+ex.hint)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#f59e0b", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Indice</button>}
        </div>
        {r===false && <div style={{ marginTop:8, padding:10, background:"rgba(239,68,68,.1)", borderRadius:8, fontSize:13, color:"#fca5a5" }}>Réponse : {ex.answer}</div>}
      </div>
    ); })}
    <AiChat ctx={`Exercices Séance ${s.id}: ${s.title}`} txt={s.exercises.map(e=>e.q).join("\n")} />
  </div>);
}

function Quiz({ s, mark }) {
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [sc, setSc] = useState(0);
  const [fin, setFin] = useState(false);
  const [sh, setSh] = useState(false);
  const q = s.quiz[qi];
  const chk = (i) => { if(sh) return; setSel(i); setSh(true); if(i===q.correct) setSc(x=>x+1); };
  const nxt = () => { if(qi<s.quiz.length-1){ setQi(qi+1); setSel(null); setSh(false); } else { setFin(true); const finalScore = sc+(sel===q.correct?1:0); if(finalScore>=Math.ceil(s.quiz.length*.6)) mark(s.id,"quiz"); const wrong = s.quiz.filter((qq,idx) => idx<=qi && !(idx===qi?sel===qq.correct:true)).map(qq=>qq.q); logQuizResult("Maths", s.title, finalScore, s.quiz.length, wrong);  supabase.from("attempts_log").insert({ event_date:new Date().toISOString().split("T")[0], matiere:"MA", seance:s.title, type:"quiz", identifier:s.title, correct:finalScore>=Math.ceil(s.quiz.length*.6), score:finalScore, total:s.quiz.length, ts:Date.now() }).then(()=>{},()=>{}); } };
  const rst = () => { setQi(0); setSel(null); setSc(0); setFin(false); setSh(false); };
  if(fin) return (<div style={{ background:"#1e293b", borderRadius:14, padding:24, textAlign:"center" }}>
    <div style={{ fontSize:48, marginBottom:10 }}>{sc>=Math.ceil(s.quiz.length*.6)?"🎉":"📚"}</div>
    <div style={{ fontSize:22, fontWeight:800 }}>{sc}/{s.quiz.length}</div>
    <div style={{ color:sc>=Math.ceil(s.quiz.length*.6)?"#22c55e":"#f59e0b", fontWeight:600, marginTop:4 }}>{sc>=Math.ceil(s.quiz.length*.6)?"Bravo ! Quiz réussi !":"Continue à réviser !"}</div>
    <button onClick={rst} style={{ marginTop:16, padding:"10px 18px", borderRadius:10, border:"none", background:"#6366f1", color:"#fff", fontWeight:600, cursor:"pointer" }}>Recommencer</button>
  </div>);
  return (<div>
    <div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>Question {qi+1}/{s.quiz.length}</div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18 }}>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>{q.q}</div>
      {q.options.map((o,i) => { let bg="#0f172a",bd="#334155",cl="#e2e8f0"; if(sh){ if(i===q.correct){bg="rgba(34,197,94,.15)";bd="#22c55e";cl="#22c55e";} else if(i===sel){bg="rgba(239,68,68,.15)";bd="#ef4444";cl="#ef4444";} } else if(i===sel){bg="rgba(99,102,241,.15)";bd="#6366f1";} return (
        <div key={i} onClick={()=>chk(i)} style={{ padding:12, borderRadius:10, border:`2px solid ${bd}`, background:bg, color:cl, marginBottom:8, cursor:sh?"default":"pointer", fontWeight:500, fontSize:14 }}>{o}</div>
      ); })}
      {sh && <button onClick={nxt} style={{ marginTop:12, padding:"10px 18px", borderRadius:10, border:"none", background:"#6366f1", color:"#fff", fontWeight:600, cursor:"pointer" }}>{qi<s.quiz.length-1?"Suivante →":"Voir le score"}</button>}
    </div>
  </div>);
}

function AiChat({ ctx, txt }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [ld, setLd] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if(ref.current) ref.current.scrollTop=ref.current.scrollHeight; }, [msgs]);
  const ask = async () => {
    if(!q.trim()||ld) return;
    const u = q.trim(); setQ(""); setMsgs(m=>[...m,{r:"user",t:u}]); setLd(true);
    try {
      const r = await fetch("/api/ai/corriger", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type:"aide", question:u, reponse:u, section:ctx, cours:txt, matiere:"Maths", history:msgs }) });
      const d = await r.json();
      setMsgs(m=>[...m,{r:"ai",t:d.reply||"Erreur."}]);
    } catch { setMsgs(m=>[...m,{r:"ai",t:"Erreur de connexion."}]); }
    setLd(false);
  };
  if(!open) return <div onClick={()=>setOpen(true)} style={{ background:"linear-gradient(135deg,#6366f1,#818cf8)", padding:14, borderRadius:12, textAlign:"center", cursor:"pointer", marginTop:16, fontWeight:700, fontSize:14, color:"#fff" }}>🤖 Je suis bloqué — Prof IA</div>;
  return (<div style={{ background:"#1e293b", borderRadius:14, padding:18, marginTop:16, border:"2px solid #6366f1" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontWeight:700, color:"#818cf8" }}>🤖 Prof de Maths IA</span><span onClick={()=>{setOpen(false);setMsgs([]);}} style={{ cursor:"pointer", color:"#94a3b8" }}>✕</span></div>
    <div ref={ref} style={{ maxHeight:250, overflowY:"auto", marginBottom:10 }}>
      {msgs.length===0 && <div style={{ fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>Pose ta question...</div>}
      {msgs.map((m,i) => <div key={i} style={{ marginBottom:8, padding:10, borderRadius:10, background:m.r==="user"?"rgba(99,102,241,.15)":"rgba(34,197,94,.1)", borderLeft:`3px solid ${m.r==="user"?"#6366f1":"#22c55e"}` }}>
        <div style={{ fontSize:11, fontWeight:600, color:m.r==="user"?"#818cf8":"#22c55e", marginBottom:3 }}>{m.r==="user"?"Toi":"Prof IA"}</div>
        <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{m.t}</div>
      </div>)}
      {ld && <div style={{ fontSize:13, color:"#94a3b8" }}>Le prof réfléchit...</div>}
    </div>
    <div style={{ display:"flex", gap:8 }}>
      <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ta question..." style={{ flex:1, padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
      <button onClick={ask} disabled={ld} style={{ padding:"10px 16px", borderRadius:10, border:"none", background:"#6366f1", color:"#fff", fontWeight:600, cursor:ld?"not-allowed":"pointer" }}>↑</button>
    </div>
  </div>);
}
