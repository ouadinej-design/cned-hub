"use client";
import { useState, useRef, useEffect } from "react";
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
    id: 1, title: "Sin avances ¿no hay futuro?",
    lessons: [
      { title: "Introducción — Innovaciones y responsabilidad", content: "Secuencia 1 : \"Sin avances ¿no hay futuro?\"\nEje del programa : Innovaciones científicas y responsabilidad\n\nProblemática : ¿Cómo y en qué medida la ciencia ayuda a preparar el futuro del planeta?\n\nVocabulario clave :\n• el avance (le progrès) / el futuro (l'avenir)\n• la responsabilidad (la responsabilité) / el medio ambiente (l'environnement)\n• sostenible (durable) / proteger (protéger)\n• una innovación (une innovation) / un negocio (une affaire, un business)" },
      { title: "Parte 1 — ¿Preparar el futuro, un negocio?", content: "Parte 1 : \"Preparar el futuro del planeta: ¿un negocio?\"\n\nDe más en más personas adoptan prácticas ECOLÓGICAS día a día : compra a granel (\"comprar a granel\"), activismo ecológico, moda ecorresponsable.\n\nPero esto plantea una pregunta : ¿la ecología se ha convertido en un NEGOCIO (business) más que en un compromiso real ?\n\nVocabulario : comprar a granel (acheter en vrac), el activismo (l'activisme), la moda ecorresponsable (la mode écoresponsable), el compromiso (l'engagement)" }
    ],
    exercises: [
      { q: "Traduire : \"acheter en vrac\"", answer: "comprar a granel", hint: "Expression vue en cours", level: 2 },
      { q: "Traduire : \"l'environnement\"", answer: "el medio ambiente", hint: "Mot-clé de la séquence", level: 1 },
      { q: "Que signifie \"sostenible\" ?", answer: "durable", hint: "Adjectif lié à l'écologie", level: 1 }
    ],
    quiz: [
      { q: "\"El medio ambiente\" signifie...", options: ["L'environnement", "Le futur", "L'argent", "Le commerce"], correct: 0 },
      { q: "\"Comprar a granel\" signifie...", options: ["Acheter en vrac", "Vendre cher", "Ne rien acheter", "Louer"], correct: 0 },
      { q: "L'axe de la séquence porte sur...", options: ["Innovations scientifiques et responsabilité", "Le sport", "La musique", "L'histoire ancienne"], correct: 0 }
    ]
  },
  {
    id: 2, title: "¿Existen límites a las innovaciones científicas?",
    lessons: [
      { title: "Parte 2 — Los límites de la ciencia", content: "Parte 2 : \"¿Existen límites a las innovaciones científicas?\"\n\nLas innovaciones científicas transforman nuestra manera de vivir : desde la realidad aumentada hasta los avances en la medicina.\n\nPero esto plantea preguntas ÉTICAS : ¿todo progreso es bueno? ¿Hasta dónde debe llegar la ciencia?\n\nEjemplos estudiados : \"la eternidad aumentada\" (prolongación de la vida), \"la innovación médica\", riesgos y beneficios de la inteligencia artificial." },
      { title: "Vocabulario y expresiones útiles", content: "Para argumentar en español (bac) :\n\n• \"Por un lado... por otro lado...\" (d'un côté... de l'autre...)\n• \"Es fundamental que + subjonctif\" (il est fondamental que)\n• \"A mi parecer...\" (à mon avis)\n• \"Cabe preguntarse si...\" (on peut se demander si)\n\nVocabulario : la inteligencia artificial (l'IA), la ética (l'éthique), un riesgo (un risque), una ventaja (un avantage), una desventaja (un inconvénient)" }
    ],
    exercises: [
      { q: "Traduire : \"l'intelligence artificielle\"", answer: "la inteligencia artificial", hint: "Terme technique en espagnol", level: 1 },
      { q: "Comment dit-on \"à mon avis\" en espagnol ?", answer: "a mi parecer", hint: "Expression pour argumenter", level: 2 }
    ],
    quiz: [
      { q: "\"Un riesgo\" signifie...", options: ["Un risque", "Un avantage", "Une innovation", "Un futur"], correct: 0 },
      { q: "\"Por un lado... por otro lado\" signifie...", options: ["D'un côté... de l'autre...", "Toujours... jamais...", "Au début... à la fin...", "Avant... après..."], correct: 0 }
    ]
  }
];

const LEVELS = { 1: { label: "Facile", c: "#22c55e" }, 2: { label: "Moyen", c: "#f59e0b" }, 3: { label: "Difficile", c: "#ef4444" } };

export default function EspagnolPage() {
  const [view, setView] = useState("home");
  const [si, setSi] = useState(0);
  const [li, setLi] = useState(0);
  const [tab, setTab] = useState("cours");
  const [prog, setProg] = useState(() => { try { const s = typeof window!=="undefined" && localStorage.getItem("esp2"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const save = (p) => { setProg(p); try { localStorage.setItem("esp2", JSON.stringify(p)); } catch {} };
  const mark = (id, t) => { if (!prog[`${id}_${t}`]) { save({ ...prog, [`${id}_${t}`]: true }); logActivity("ES"); } };
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
          <div style={{ fontSize:24, fontWeight:800 }}>🇪🇸 Prof d'Espagnol IA</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Séq.1 — Sin avances ¿no hay futuro?</div>
        </div>
      </div>
      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontWeight:700 }}>Progression</span><span style={{ color:"#f87171", fontWeight:700 }}>{pct}%</span></div>
        <div style={{ height:10, background:"#334155", borderRadius:5, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#ef4444,#f87171)", borderRadius:5, transition:"width .5s" }} /></div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:6 }}>{cnt}/{total} complétés</div>
      </div>
      {SEANCES.map((x, i) => { const d = [done(x.id,"lessons"), done(x.id,"exercises"), done(x.id,"quiz")]; const c = d.filter(Boolean).length; return (
        <div key={x.id} onClick={() => { setSi(i); setView("s"); setTab("cours"); setLi(0); }}
          style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10, cursor:"pointer", borderLeft:`4px solid ${c===3?"#22c55e":c>0?"#f59e0b":"#334155"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:12, color:"#f87171", fontWeight:600 }}>Séance {x.id}</div><div style={{ fontWeight:700, fontSize:15 }}>{x.title}</div></div>
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
        <div><div style={{ fontSize:12, color:"#f87171" }}>Séance {s.id}</div><div style={{ fontWeight:700, fontSize:16 }}>{s.title}</div></div>
      </div>
      <div style={{ display:"flex", padding:"12px 16px", gap:0 }}>
        {[["cours","📖 Cours"],["exercices","✏️ Exos"],["quiz","🧪 Quiz"]].map(([k,l]) => (
          <div key={k} onClick={() => setTab(k)} style={{ flex:1, textAlign:"center", padding:"10px 0", borderRadius:10, background:tab===k?"#ef4444":"transparent", color:tab===k?"#fff":"#94a3b8", fontWeight:600, fontSize:13, cursor:"pointer" }}>
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
      {s.lessons.map((x,i) => <div key={i} onClick={() => setLi(i)} style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:i===li?"#ef4444":dn.includes(i)?"rgba(34,197,94,.15)":"#1e293b", color:i===li?"#fff":dn.includes(i)?"#22c55e":"#94a3b8" }}>{i+1}. {x.title}</div>)}
    </div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18, borderLeft:"4px solid #ef4444" }}>
      <div style={{ fontSize:16, fontWeight:700, marginBottom:10, color:"#f87171" }}>{l.title}</div>
      <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, lineHeight:1.7, margin:0, color:"#e2e8f0" }}>{l.content}</pre>
    </div>
    <AiChat ctx={`Séance ${s.id}: ${s.title} — ${l.title}`} txt={l.content} />
    <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
      <button onClick={() => li>0&&setLi(li-1)} disabled={li===0} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#1e293b", color:"#e2e8f0", fontWeight:600, cursor:li===0?"not-allowed":"pointer", opacity:li===0?.5:1 }}>← Précédent</button>
      <button onClick={next} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", fontWeight:600, cursor:"pointer" }}>{li<s.lessons.length-1?"Suivant →":"Terminé ✓"}</button>
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
      {[0,1,2,3].map(l => <div key={l} onClick={() => setFl(l)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:fl===l?(l===0?"#ef4444":LEVELS[l]?.c):"#1e293b", color:fl===l?"#fff":"#94a3b8" }}>{l===0?"Tous":LEVELS[l].label}</div>)}
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
          <button onClick={() => { const a=(ans[gi]||"").toLowerCase().replace(/\s/g,""); const c=ex.answer.toLowerCase().replace(/\s/g,""); const ok=a===c||a.includes(c)||c.includes(a); setRes({...res,[gi]:ok}); if(!ok) logDifficulty("Espagnol", s.title, ex.q, ans[gi]||"(vide)", ex.answer, ex.hint); }}
            style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Vérifier</button>
          {r===false && <button onClick={() => alert("💡 "+ex.hint)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#dc2626", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Indice</button>}
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
  const nxt = () => { if(qi<s.quiz.length-1){ setQi(qi+1); setSel(null); setSh(false); } else { setFin(true); const finalScore = sc+(sel===q.correct?1:0); if(finalScore>=Math.ceil(s.quiz.length*.6)) mark(s.id,"quiz"); const wrong = s.quiz.filter((qq,idx) => idx<=qi && !(idx===qi?sel===qq.correct:true)).map(qq=>qq.q); logQuizResult("Espagnol", s.title, finalScore, s.quiz.length, wrong); } };
  const rst = () => { setQi(0); setSel(null); setSc(0); setFin(false); setSh(false); };
  if(fin) return (<div style={{ background:"#1e293b", borderRadius:14, padding:24, textAlign:"center" }}>
    <div style={{ fontSize:48, marginBottom:10 }}>{sc>=Math.ceil(s.quiz.length*.6)?"🎉":"📚"}</div>
    <div style={{ fontSize:22, fontWeight:800 }}>{sc}/{s.quiz.length}</div>
    <div style={{ color:sc>=Math.ceil(s.quiz.length*.6)?"#22c55e":"#f59e0b", fontWeight:600, marginTop:4 }}>{sc>=Math.ceil(s.quiz.length*.6)?"Bravo ! Quiz réussi !":"Continue à réviser !"}</div>
    <button onClick={rst} style={{ marginTop:16, padding:"10px 18px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", fontWeight:600, cursor:"pointer" }}>Recommencer</button>
  </div>);
  return (<div>
    <div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>Question {qi+1}/{s.quiz.length}</div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18 }}>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>{q.q}</div>
      {q.options.map((o,i) => { let bg="#0f172a",bd="#334155",cl="#e2e8f0"; if(sh){ if(i===q.correct){bg="rgba(34,197,94,.15)";bd="#22c55e";cl="#22c55e";} else if(i===sel){bg="rgba(239,68,68,.15)";bd="#ef4444";cl="#ef4444";} } else if(i===sel){bg="rgba(239,68,68,.15)";bd="#ef4444";} return (
        <div key={i} onClick={()=>chk(i)} style={{ padding:12, borderRadius:10, border:`2px solid ${bd}`, background:bg, color:cl, marginBottom:8, cursor:sh?"default":"pointer", fontWeight:500, fontSize:14 }}>{o}</div>
      ); })}
      {sh && <button onClick={nxt} style={{ marginTop:12, padding:"10px 18px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", fontWeight:600, cursor:"pointer" }}>{qi<s.quiz.length-1?"Suivante →":"Voir le score"}</button>}
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
        body: JSON.stringify({ type:"aide", question:u, reponse:u, section:ctx, cours:txt, matiere:"Espagnol" }) });
      const d = await r.json();
      setMsgs(m=>[...m,{r:"ai",t:d.reply||"Erreur."}]);
    } catch { setMsgs(m=>[...m,{r:"ai",t:"Erreur de connexion."}]); }
    setLd(false);
  };
  if(!open) return <div onClick={()=>setOpen(true)} style={{ background:"linear-gradient(135deg,#ef4444,#f87171)", padding:14, borderRadius:12, textAlign:"center", cursor:"pointer", marginTop:16, fontWeight:700, fontSize:14, color:"#fff" }}>🤖 Je suis bloqué — Prof IA</div>;
  return (<div style={{ background:"#1e293b", borderRadius:14, padding:18, marginTop:16, border:"2px solid #ef4444" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontWeight:700, color:"#f87171" }}>🤖 Prof d'Espagnol IA</span><span onClick={()=>{setOpen(false);setMsgs([]);}} style={{ cursor:"pointer", color:"#94a3b8" }}>✕</span></div>
    <div ref={ref} style={{ maxHeight:250, overflowY:"auto", marginBottom:10 }}>
      {msgs.length===0 && <div style={{ fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>Pose ta question... (en français ou espagnol)</div>}
      {msgs.map((m,i) => <div key={i} style={{ marginBottom:8, padding:10, borderRadius:10, background:m.r==="user"?"rgba(239,68,68,.15)":"rgba(34,197,94,.1)", borderLeft:`3px solid ${m.r==="user"?"#ef4444":"#22c55e"}` }}>
        <div style={{ fontSize:11, fontWeight:600, color:m.r==="user"?"#f87171":"#22c55e", marginBottom:3 }}>{m.r==="user"?"Toi":"Prof IA"}</div>
        <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{m.t}</div>
      </div>)}
      {ld && <div style={{ fontSize:13, color:"#94a3b8" }}>Le prof réfléchit...</div>}
    </div>
    <div style={{ display:"flex", gap:8 }}>
      <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ta question..." style={{ flex:1, padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
      <button onClick={ask} disabled={ld} style={{ padding:"10px 16px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", fontWeight:600, cursor:ld?"not-allowed":"pointer" }}>↑</button>
    </div>
  </div>);
}
