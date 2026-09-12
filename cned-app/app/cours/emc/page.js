"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../../../lib/supabase";


// ── Normalisation MEN (Ministère Éducation Nationale) ──
function normalizeAnswer(s) {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "")
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u201C\u201D\u00AB\u00BB]/g, "")
    .replace(/[;,\.]+$/g, "")
    .replace(/\u00D7/g, "*")
    .replace(/\u00F7/g, "/")
    .replace(/[\u2212\u2013]/g, "-")
    .replace(/\^2/g, "\u00B2")
    .replace(/\*\*/g, "^")
    .trim();
}
function checkAnswer(userAns, correctAns) {
  const a = normalizeAnswer(userAns), c = normalizeAnswer(correctAns);
  if (!a) return false;
  if (a === c) return true;
  // Virgule/point décimal interchangeables
  if (a.replace(/,/g, ".") === c.replace(/,/g, ".")) return true;
  // Ordre des parties (a=2,b=3 vs b=3,a=2)
  const ap = a.split(/[;,]/).map(p=>p.trim()).filter(Boolean).sort().join(",");
  const cp = c.split(/[;,]/).map(p=>p.trim()).filter(Boolean).sort().join(",");
  if (ap === cp) return true;
  // Tolérance inclusion (réponse contient l'attendu ou vice-versa)
  if (a.length > 2 && c.length > 2 && (a.includes(c) || c.includes(a))) return true;
  // "le" / "la" / "les" / "l'" optionnels en début
  const stripArticle = s => s.replace(/^(le|la|les|l'|un|une|des|du)/, "");
  if (stripArticle(a) === stripArticle(c)) return true;
  // Pluriel tolérant (s final optionnel)
  if (a+"s" === c || a === c+"s") return true;
  return false;
}

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
    id: 1, title: "Comment la République met en œuvre son projet social",
    lessons: [
      { title: "Un projet social ambitieux", content: "La République française repose sur un PROJET SOCIAL : garantir l'égalité et la solidarité entre tous les citoyens.\n\nCe projet s'appuie sur trois valeurs (Liberté, Égalité, Fraternité) mais la FRATERNITÉ est la moins souvent étudiée alors qu'elle fonde tout le système de solidarité nationale.\n\nLa Sécurité sociale (1945), l'école gratuite et obligatoire, le RSA sont des traductions concrètes de ce projet." },
      { title: "Le principe de fraternité", content: "La FRATERNITÉ implique un devoir de SOLIDARITÉ entre citoyens : les plus favorisés contribuent (impôts, cotisations) pour aider les plus vulnérables.\n\nElle se traduit juridiquement par :\n• Le \"délit de non-assistance à personne en danger\"\n• Le \"délit d'entrave\" à l'aide humanitaire (la fraternité protège même ceux qui aident des personnes en situation irrégulière, arrêt du Conseil constitutionnel de 2018)\n\nLa fraternité est donc un PRINCIPE À VALEUR CONSTITUTIONNELLE depuis 2018." }
    ],
    exercises: [
      { q: "Quelles sont les 3 valeurs de la devise républicaine ?", answer: "liberte egalite fraternite", hint: "Devise inscrite aux frontons des mairies", level: 1 },
      { q: "En quelle année la fraternité devient principe à valeur constitutionnelle ?", answer: "2018", hint: "Décision du Conseil constitutionnel", level: 2 }
    ],
    quiz: [
      { q: "La fraternité devient valeur constitutionnelle en...", options: ["2018", "1945", "1789", "2000"], correct: 0 },
      { q: "La Sécurité sociale est créée en...", options: ["1945", "1900", "1981", "2010"], correct: 0 }
    ]
  },
  {
    id: 2, title: "Une démocratie à l'épreuve des inégalités : Mayotte",
    lessons: [
      { title: "Mayotte, un territoire en tension", content: "Mayotte, département français depuis 2011, illustre les DÉFIS de la solidarité républicaine :\n\n• Fort taux de pauvreté, sous-équipement en infrastructures\n• Forte pression migratoire\n• Accès inégal aux services publics (santé, éducation) par rapport à la métropole\n\nCela pose la question : comment la République peut-elle garantir l'égalité sur TOUT le territoire, y compris ultramarin ?" }
    ],
    exercises: [
      { q: "Depuis quelle année Mayotte est-elle département français ?", answer: "2011", hint: "101e département", level: 2 }
    ],
    quiz: [
      { q: "Mayotte illustre les défis de...", options: ["L'égalité territoriale", "L'absence totale de problème", "La seule prospérité", "L'indépendance"], correct: 0 }
    ]
  },
  {
    id: 3, title: "Les menaces qui pèsent sur la cohésion sociale",
    lessons: [
      { title: "Fragiliser le vivre-ensemble", content: "Plusieurs FACTEURS menacent la cohésion sociale en France :\n\n• Les inégalités économiques croissantes\n• La fracture territoriale (métropoles vs zones rurales/périphériques)\n• La défiance envers les institutions\n• La polarisation des opinions (réseaux sociaux, désinformation)\n\nCes tensions fragilisent le sentiment d'appartenance à une communauté nationale partagée." }
    ],
    exercises: [
      { q: "Citer une menace pesant sur la cohésion sociale", answer: "inegalites,fracture territoriale,defiance", hint: "Facteur de fragilisation du lien social", level: 1 }
    ],
    quiz: [
      { q: "La fracture territoriale oppose notamment...", options: ["Métropoles et zones périphériques", "Nord et Sud uniquement", "Rien de particulier", "Villes jumelles"], correct: 0 }
    ]
  },
  {
    id: 4, title: "L'égalité femmes-hommes : un combat toujours d'actualité",
    lessons: [
      { title: "Un combat historique et actuel", content: "L'égalité femmes-hommes est un PRINCIPE CONSTITUTIONNEL (depuis 1946) mais des inégalités persistent :\n\n• Écart salarial (environ 15% en France)\n• Sous-représentation dans les postes de direction\n• Violences sexistes et sexuelles\n\nDes lois récentes visent à réduire ces écarts : loi Copé-Zimmermann (parité dans les conseils d'administration), index de l'égalité professionnelle (2019)." }
    ],
    exercises: [
      { q: "Depuis quelle année l'égalité femmes-hommes est-elle un principe constitutionnel ?", answer: "1946", hint: "Préambule de la Constitution de la IVe République", level: 2 }
    ],
    quiz: [
      { q: "L'écart salarial femmes-hommes en France est d'environ...", options: ["15%", "50%", "0%", "80%"], correct: 0 }
    ]
  },
  {
    id: 5, title: "Lutter contre les discriminations",
    lessons: [
      { title: "Qu'est-ce qu'une discrimination ?", content: "Une DISCRIMINATION est un traitement défavorable illégal fondé sur un critère prohibé par la loi (origine, sexe, âge, handicap, religion, orientation sexuelle...).\n\nLa loi française reconnaît 25 CRITÈRES DE DISCRIMINATION prohibés.\n\nDes institutions luttent contre ces discriminations : le Défenseur des droits peut être saisi gratuitement par toute personne s'estimant discriminée." }
    ],
    exercises: [
      { q: "Quelle institution peut être saisie en cas de discrimination ?", answer: "defenseur des droits", hint: "Autorité indépendante, saisine gratuite", level: 2 }
    ],
    quiz: [
      { q: "Combien de critères de discrimination sont reconnus par la loi française ?", options: ["25", "5", "100", "0"], correct: 0 }
    ]
  },
  {
    id: 6, title: "La laïcité en France : un principe fondamental",
    lessons: [
      { title: "Les fondements de la laïcité", content: "La LAÏCITÉ est un principe fondamental de la République française, inscrit dans la loi de 1905 de séparation des Églises et de l'État.\n\nElle repose sur 3 piliers :\n• La NEUTRALITÉ de l'État envers les religions\n• La LIBERTÉ de conscience et de culte\n• L'ÉGALITÉ de tous les citoyens quelle que soit leur religion\n\nDans les services publics (école, administration), la neutralité religieuse s'impose aux AGENTS publics." },
      { title: "Laïcité et cohésion sociale", content: "La laïcité vise à garantir la PAIX CIVILE en séparant sphère publique (neutre) et sphère privée (où chacun est libre de ses convictions).\n\nElle est parfois source de débats (port de signes religieux à l'école, dans l'espace public) mais reste un pilier du VIVRE-ENSEMBLE républicain, permettant à des citoyens de convictions différentes de cohabiter dans le respect mutuel." }
    ],
    exercises: [
      { q: "En quelle année est votée la loi de séparation des Églises et de l'État ?", answer: "1905", hint: "Loi fondatrice de la laïcité", level: 1 },
      { q: "Citer un des 3 piliers de la laïcité", answer: "neutralite,liberte,egalite", hint: "Neutralité de l'État, liberté de conscience, égalité", level: 2 }
    ],
    quiz: [
      { q: "La loi de laïcité date de...", options: ["1905", "1789", "1946", "2004"], correct: 0 },
      { q: "La laïcité impose la neutralité religieuse...", options: ["Aux agents publics", "À tous les citoyens en privé", "À personne", "Uniquement aux élus"], correct: 0 }
    ]
  }
];

const LEVELS = { 1: { label: "Facile", c: "#22c55e" }, 2: { label: "Moyen", c: "#f59e0b" }, 3: { label: "Difficile", c: "#ef4444" } };

export default function EmcPage() {
  useEffect(() => {
    let seconds = 0;
    const flush = () => {
      if (seconds > 0) {
        const today = new Date().toISOString().split("T")[0];
        supabase.from("time_log").insert({ event_date: today, matiere: "EM", seconds, ts: Date.now() }).then(() => {}, () => {});
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
  const [prog, setProg] = useState(() => { try { const s = typeof window!=="undefined" && localStorage.getItem("emcp"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const save = (p) => { setProg(p); try { localStorage.setItem("emcp", JSON.stringify(p)); } catch {} };
  const mark = (id, t) => { if (!prog[`${id}_${t}`]) { save({ ...prog, [`${id}_${t}`]: true }); logActivity("EM"); } };
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
          <div style={{ fontSize:24, fontWeight:800 }}>⚖️ Prof d'EMC IA</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Séq.1 — Valeurs de la République et cohésion sociale</div>
        </div>
      </div>
      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontWeight:700 }}>Progression</span><span style={{ color:"#c084fc", fontWeight:700 }}>{pct}%</span></div>
        <div style={{ height:10, background:"#334155", borderRadius:5, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#a855f7,#c084fc)", borderRadius:5, transition:"width .5s" }} /></div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:6 }}>{cnt}/{total} complétés</div>
      </div>
      {SEANCES.map((x, i) => { const d = [done(x.id,"lessons"), done(x.id,"exercises"), done(x.id,"quiz")]; const c = d.filter(Boolean).length; return (
        <div key={x.id} onClick={() => { setSi(i); setView("s"); setTab("cours"); setLi(0); }}
          style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10, cursor:"pointer", borderLeft:`4px solid ${c===3?"#22c55e":c>0?"#f59e0b":"#334155"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:12, color:"#c084fc", fontWeight:600 }}>Séance {x.id}</div><div style={{ fontWeight:700, fontSize:15 }}>{x.title}</div></div>
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
        <div><div style={{ fontSize:12, color:"#c084fc" }}>Séance {s.id}</div><div style={{ fontWeight:700, fontSize:16 }}>{s.title}</div></div>
      </div>
      <div style={{ display:"flex", padding:"12px 16px", gap:0 }}>
        {[["cours","📖 Cours"],["exercices","✏️ Exos"],["quiz","🧪 Quiz"]].map(([k,l]) => (
          <div key={k} onClick={() => setTab(k)} style={{ flex:1, textAlign:"center", padding:"10px 0", borderRadius:10, background:tab===k?"#a855f7":"transparent", color:tab===k?"#fff":"#94a3b8", fontWeight:600, fontSize:13, cursor:"pointer" }}>
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
      {s.lessons.map((x,i) => <div key={i} onClick={() => setLi(i)} style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:i===li?"#a855f7":dn.includes(i)?"rgba(34,197,94,.15)":"#1e293b", color:i===li?"#fff":dn.includes(i)?"#22c55e":"#94a3b8" }}>{i+1}. {x.title}</div>)}
    </div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18, borderLeft:"4px solid #a855f7" }}>
      <div style={{ fontSize:16, fontWeight:700, marginBottom:10, color:"#c084fc" }}>{l.title}</div>
      <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, lineHeight:1.7, margin:0, color:"#e2e8f0" }}>{l.content}</pre>
    </div>
    <AiChat ctx={`Séance ${s.id}: ${s.title} — ${l.title}`} txt={l.content} />
    <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
      <button onClick={() => li>0&&setLi(li-1)} disabled={li===0} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#1e293b", color:"#e2e8f0", fontWeight:600, cursor:li===0?"not-allowed":"pointer", opacity:li===0?.5:1 }}>← Précédent</button>
      <button onClick={next} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#a855f7", color:"#fff", fontWeight:600, cursor:"pointer" }}>{li<s.lessons.length-1?"Suivant →":"Terminé ✓"}</button>
    </div>
  </div>);
}

function Exos({ s, mark }) {
  const [ans, setAns] = useState({});
  const [res, setRes] = useState({});
  const [errMsgs, setErrMsgs] = useState({});
  const [fl, setFl] = useState(0);
  const [extraExs, setExtraExs] = useState([]);
  const [reexp, setReexp] = useState({}); // gi -> {loading, explication, nouvel_exercice}
  const allExercises = [...s.exercises, ...extraExs];
  const exs = fl===0 ? allExercises : allExercises.filter(e => e.level===fl);
  useEffect(() => { if (Object.keys(res).length >= s.exercises.length) mark(s.id, "exercises"); }, [res]);
  const demanderReexplication = async (gi, ex) => {
    setReexp(r => ({...r, [gi]: { loading: true }}));
    try {
      const r = await fetch("/api/ai/corriger", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type:"reexplique", matiere:"EMC", section:s.title, cours:ex.q, question:ex.q, reponse:ans[gi]||"" }) });
      const d = await r.json();
      setReexp(rr => ({...rr, [gi]: { loading:false, explication: d.explication, nouvel_exercice: d.nouvel_exercice }}));
      if (d.nouvel_exercice) {
        setExtraExs(ee => [...ee, { q: d.nouvel_exercice.question, answer: d.nouvel_exercice.reponse, hint: d.nouvel_exercice.indice, level: ex.level }]);
      }
    } catch {
      setReexp(rr => ({...rr, [gi]: { loading:false, explication:"Erreur de connexion, réessaie.", nouvel_exercice:null }}));
    }
  };
  return (<div>
    <div style={{ display:"flex", gap:6, marginBottom:16 }}>
      {[0,1,2,3].map(l => <div key={l} onClick={() => setFl(l)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:fl===l?(l===0?"#a855f7":LEVELS[l]?.c):"#1e293b", color:fl===l?"#fff":"#94a3b8" }}>{l===0?"Tous":LEVELS[l].label}</div>)}
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
          <button onClick={() => { const ok=checkAnswer(ans[gi]||"", ex.answer); setRes({...res,[gi]:ok}); if(!ok) { logDifficulty("EMC", s.title, ex.q, ans[gi]||"(vide)", ex.answer, ex.hint); fetch("/api/ai/corriger", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ type:"erreur_analyse", matiere:"EMC", question:ex.q, reponse:ans[gi]||"(vide)", exercices:ex.answer }) }).then(r=>r.json()).then(d=>{ if(d.reply) setErrMsgs(m=>({...m,[gi]:d.reply})); }).catch(()=>{}); } supabase.from("attempts_log").insert({ event_date:new Date().toISOString().split("T")[0], matiere:"EM", seance:s.title, type:"exercice", identifier:ex.q, correct:ok, ts:Date.now() }).then(()=>{},()=>{}); }}
            style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#a855f7", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Vérifier</button>
          {r===false && <button onClick={() => alert("💡 "+ex.hint)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#9333ea", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Indice</button>}
        {r===false && <button onClick={() => demanderReexplication(gi, ex)} disabled={reexp[gi]?.loading} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#8b5cf6", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>{reexp[gi]?.loading ? "..." : "🔄 Autre explication"}</button>}
        </div>{r===false && <div style={{ marginTop:8, padding:12, background:"rgba(239,68,68,.08)", borderRadius:10, fontSize:13, border:"1px solid rgba(239,68,68,.2)" }}>
          <div style={{ color:"#fca5a5", marginBottom:6 }}>Réponse attendue : <strong style={{ color:"#e2e8f0" }}>{ex.answer}</strong></div>
          {errMsgs[gi] ? <div style={{ color:"#fbbf24", fontSize:12, lineHeight:1.5 }}>⚠️ <strong>L'erreur à ne plus refaire :</strong> {errMsgs[gi]}</div> : <div style={{ color:"#64748b", fontSize:11 }}>🔍 Analyse en cours...</div>}
        </div>}
        {reexp[gi] && !reexp[gi].loading && reexp[gi].explication && (
          <div style={{ marginTop:8, padding:12, background:"rgba(139,92,246,.1)", borderRadius:8, borderLeft:"3px solid #8b5cf6" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#c4b5fd", marginBottom:4 }}>🔄 Vu autrement</div>
            <div style={{ fontSize:13, color:"#e2e8f0", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{reexp[gi].explication}</div>
            {reexp[gi].nouvel_exercice && <div style={{ fontSize:11, color:"#a78bfa", marginTop:6, fontStyle:"italic" }}>✓ Un nouvel exercice sur cette notion a été ajouté plus bas pour t'entraîner.</div>}
          </div>
        )}
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
  const nxt = () => { if(qi<s.quiz.length-1){ setQi(qi+1); setSel(null); setSh(false); } else { setFin(true); const finalScore = sc+(sel===q.correct?1:0); if(finalScore>=Math.ceil(s.quiz.length*.6)) mark(s.id,"quiz"); const wrong = s.quiz.filter((qq,idx) => idx<=qi && !(idx===qi?sel===qq.correct:true)).map(qq=>qq.q); logQuizResult("EMC", s.title, finalScore, s.quiz.length, wrong);  supabase.from("attempts_log").insert({ event_date:new Date().toISOString().split("T")[0], matiere:"EM", seance:s.title, type:"quiz", identifier:s.title, correct:finalScore>=Math.ceil(s.quiz.length*.6), score:finalScore, total:s.quiz.length, ts:Date.now() }).then(()=>{},()=>{}); } };
  const rst = () => { setQi(0); setSel(null); setSc(0); setFin(false); setSh(false); };
  if(fin) return (<div style={{ background:"#1e293b", borderRadius:14, padding:24, textAlign:"center" }}>
    <div style={{ fontSize:48, marginBottom:10 }}>{sc>=Math.ceil(s.quiz.length*.6)?"🎉":"📚"}</div>
    <div style={{ fontSize:22, fontWeight:800 }}>{sc}/{s.quiz.length}</div>
    <div style={{ color:sc>=Math.ceil(s.quiz.length*.6)?"#22c55e":"#f59e0b", fontWeight:600, marginTop:4 }}>{sc>=Math.ceil(s.quiz.length*.6)?"Bravo ! Quiz réussi !":"Continue à réviser !"}</div>
    <button onClick={rst} style={{ marginTop:16, padding:"10px 18px", borderRadius:10, border:"none", background:"#a855f7", color:"#fff", fontWeight:600, cursor:"pointer" }}>Recommencer</button>
  </div>);
  return (<div>
    <div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>Question {qi+1}/{s.quiz.length}</div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18 }}>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>{q.q}</div>
      {q.options.map((o,i) => { let bg="#0f172a",bd="#334155",cl="#e2e8f0"; if(sh){ if(i===q.correct){bg="rgba(34,197,94,.15)";bd="#22c55e";cl="#22c55e";} else if(i===sel){bg="rgba(239,68,68,.15)";bd="#ef4444";cl="#ef4444";} } else if(i===sel){bg="rgba(168,85,247,.15)";bd="#a855f7";} return (
        <div key={i} onClick={()=>chk(i)} style={{ padding:12, borderRadius:10, border:`2px solid ${bd}`, background:bg, color:cl, marginBottom:8, cursor:sh?"default":"pointer", fontWeight:500, fontSize:14 }}>{o}</div>
      ); })}
      {sh && <button onClick={nxt} style={{ marginTop:12, padding:"10px 18px", borderRadius:10, border:"none", background:"#a855f7", color:"#fff", fontWeight:600, cursor:"pointer" }}>{qi<s.quiz.length-1?"Suivante →":"Voir le score"}</button>}
    </div>
  </div>);
}

function AiChat({ ctx, txt }) {
  const storageKey = "profIA_Emc_" + ctx;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [ld, setLd] = useState(false);
  const ref = useRef(null);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(storageKey) || "[]"); if(saved.length) setMsgs(saved); } catch {} }, [storageKey]);
  useEffect(() => { if(ref.current) ref.current.scrollTop=ref.current.scrollHeight; }, [msgs]);
  const save = (m) => { try { localStorage.setItem(storageKey, JSON.stringify(m)); } catch {} };
  const ask = async () => {
    if(!q.trim()||ld) return;
    const u = q.trim(); setQ("");
    const newMsgs = [...msgs,{r:"user",t:u}]; setMsgs(newMsgs); save(newMsgs); setLd(true);
    try {
      const r = await fetch("/api/ai/corriger", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type:"aide", question:u, reponse:u, section:ctx, cours:txt, matiere:"EMC", history:newMsgs.slice(0,-1) }) });
      const d = await r.json();
      const final2 = [...newMsgs,{r:"ai",t:d.reply||"Erreur."}]; setMsgs(final2); save(final2);
    } catch { const final2 = [...newMsgs,{r:"ai",t:"Erreur de connexion."}]; setMsgs(final2); save(final2); }
    setLd(false);
  };
  const clearHistory = () => { setMsgs([]); localStorage.removeItem(storageKey); };
  if(!open) return <div onClick={()=>setOpen(true)} style={{ background:"linear-gradient(135deg,#a855f7,#c084fc)", padding:14, borderRadius:12, textAlign:"center", cursor:"pointer", marginTop:16, fontWeight:700, fontSize:14, color:"#fff" }}>{msgs.length > 0 ? "🤖 Prof IA (conversation en cours)" : "🤖 Je suis bloqué — Prof IA"}</div>;
  return (<div style={{ background:"#1e293b", borderRadius:14, padding:18, marginTop:16, border:"2px solid #a855f7" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontWeight:700, color:"#c084fc" }}>🤖 Prof d'EMC IA</span><div style={{ display:"flex", gap:10, alignItems:"center" }}>{msgs.length>0 && <span onClick={clearHistory} style={{ cursor:"pointer", fontSize:11, color:"#f87171" }}>Effacer</span>}<span onClick={()=>setOpen(false)} style={{ cursor:"pointer", color:"#94a3b8" }}>✕</span></div></div>
    <div ref={ref} style={{ maxHeight:250, overflowY:"auto", marginBottom:10 }}>
      {msgs.length===0 && <div style={{ fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>Pose ta question...</div>}
      {msgs.map((m,i) => <div key={i} style={{ marginBottom:8, padding:10, borderRadius:10, background:m.r==="user"?"rgba(168,85,247,.15)":"rgba(34,197,94,.1)", borderLeft:`3px solid ${m.r==="user"?"#a855f7":"#22c55e"}` }}>
        <div style={{ fontSize:11, fontWeight:600, color:m.r==="user"?"#c084fc":"#22c55e", marginBottom:3 }}>{m.r==="user"?"Toi":"Prof IA"}</div>
        <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{m.t}</div>
      </div>)}
      {ld && <div style={{ fontSize:13, color:"#94a3b8" }}>Le prof réfléchit...</div>}
    </div>
    <div style={{ display:"flex", gap:8 }}>
      <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ta question..." style={{ flex:1, padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
      <button onClick={ask} disabled={ld} style={{ padding:"10px 16px", borderRadius:10, border:"none", background:"#a855f7", color:"#fff", fontWeight:600, cursor:ld?"not-allowed":"pointer" }}>↑</button>
    </div>
  </div>);
}
