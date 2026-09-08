"use client";
import { useState, useRef, useEffect } from "react";

const SEANCES = [
  {
    id: 1, title: "Portraits of Power — Art et pouvoir",
    lessons: [
      { title: "Introduction — Axe Art et pouvoir", content: "Séquence 1 : \"Portraits of Power\"\nAxe du programme : Art et pouvoir\n\nProblématique : How has art been used throughout history to display, enhance or challenge power?\n(Comment l'art a-t-il été utilisé à travers l'histoire pour afficher, magnifier ou contester le pouvoir ?)\n\nVocabulaire clé :\n• power (le pouvoir) / to rule (gouverner)\n• a monarch (un monarque) / a portrait (un portrait)\n• to enhance (magnifier, renforcer) / to display (exposer, afficher)\n• to denounce (dénoncer) / abuse of power (abus de pouvoir)" },
      { title: "Part 1 — The splendour of the monarchy on display", content: "Partie 1 : \"The splendour of the monarchy on display: the power of enhancement through art\"\n\nÀ travers l'histoire, les monarques ont utilisé l'ART (portraits officiels, palais, sculptures) pour AFFICHER leur pouvoir et légitimité.\n\nExemples classiques étudiés en cours :\n• Portraits royaux en pied, pose majestueuse, symboles de pouvoir (couronne, sceptre)\n• Architecture grandiose (palais de Versailles)\n• Usage de la couleur, de la lumière, des éléments symboliques pour \"enhance\" (magnifier) l'image du souverain\n\nVocabulaire : grandeur, majesty, splendour, to embody power (incarner le pouvoir), regalia (insignes royaux)" }
    ],
    exercises: [
      { q: "Traduire : \"magnifier, renforcer\"", answer: "to enhance", hint: "Verbe clé de la séquence", level: 1 },
      { q: "Traduire : \"un abus de pouvoir\"", answer: "abuse of power", hint: "Expression du programme", level: 1 },
      { q: "Comment dit-on \"insignes royaux\" en anglais ?", answer: "regalia", hint: "Mot spécifique vu en cours", level: 3 }
    ],
    quiz: [
      { q: "\"To enhance\" signifie...", options: ["Magnifier, renforcer", "Détruire", "Ignorer", "Cacher"], correct: 0 },
      { q: "\"A monarch\" est...", options: ["Un monarque", "Un peintre", "Un palais", "Un tableau"], correct: 0 },
      { q: "L'axe de la séquence est...", options: ["Art et pouvoir", "Art et nature", "Science et pouvoir", "Musique et société"], correct: 0 }
    ]
  },
  {
    id: 2, title: "The other side of the coin",
    lessons: [
      { title: "Part 2 — Art as a platform to denounce power", content: "Partie 2 : \"The other side of the coin: art as a platform to denounce abuses of power\"\n\nÀ l'inverse, l'art a aussi été utilisé pour DÉNONCER les abus de pouvoir : caricatures politiques, art engagé, photographie documentaire.\n\nExemples : caricatures de rois et de dictateurs, œuvres dénonçant la guerre ou l'oppression, street art contemporain (Banksy).\n\nVocabulaire : to criticize (critiquer), a satire (une satire), to mock (se moquer), oppression, a caricature, propaganda vs counter-propaganda" },
      { title: "Méthode : commenter un document iconographique", content: "Pour analyser une image en anglais (bac) :\n\n1. DESCRIBE : \"This picture/painting shows...\" (décrire ce qu'on voit)\n2. IDENTIFY the artist's intention: \"The artist seems to want to...\"\n3. ANALYSE the techniques: colours, composition, symbols\n4. LINK to the theme: \"This relates to the theme of power because...\"\n\nExpressions utiles : \"In the foreground/background...\", \"On the left/right...\", \"This suggests that...\"" }
    ],
    exercises: [
      { q: "Traduire : \"se moquer de\"", answer: "to mock", hint: "Verbe utilisé pour la satire", level: 2 },
      { q: "Comment introduire la description d'une image en anglais ?", answer: "this picture shows", hint: "Formule standard", level: 1 }
    ],
    quiz: [
      { q: "\"A satire\" est...", options: ["Une satire", "Un palais", "Une couronne", "Un roi"], correct: 0 },
      { q: "\"In the foreground\" signifie...", options: ["Au premier plan", "À l'arrière-plan", "Au centre", "En haut"], correct: 0 }
    ]
  }
];

const LEVELS = { 1: { label: "Facile", c: "#22c55e" }, 2: { label: "Moyen", c: "#f59e0b" }, 3: { label: "Difficile", c: "#ef4444" } };

export default function AnglaisPage() {
  const [view, setView] = useState("home");
  const [si, setSi] = useState(0);
  const [li, setLi] = useState(0);
  const [tab, setTab] = useState("cours");
  const [prog, setProg] = useState(() => { try { const s = typeof window!=="undefined" && localStorage.getItem("anp"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const save = (p) => { setProg(p); try { localStorage.setItem("anp", JSON.stringify(p)); } catch {} };
  const mark = (id, t) => { if (!prog[`${id}_${t}`]) save({ ...prog, [`${id}_${t}`]: true }); };
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
          <div style={{ fontSize:24, fontWeight:800 }}>🇬🇧 Prof d'Anglais IA</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Séq.1 — Portraits of Power (Art et pouvoir)</div>
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
          <button onClick={() => { const a=(ans[gi]||"").toLowerCase().replace(/\s/g,""); const c=ex.answer.toLowerCase().replace(/\s/g,""); setRes({...res,[gi]:a===c||a.includes(c)||c.includes(a)}); }}
            style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#6366f1", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Vérifier</button>
          {r===false && <button onClick={() => alert("💡 "+ex.hint)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#4f46e5", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Indice</button>}
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
  const nxt = () => { if(qi<s.quiz.length-1){ setQi(qi+1); setSel(null); setSh(false); } else { setFin(true); if(sc+(sel===q.correct?1:0)>=Math.ceil(s.quiz.length*.6)) mark(s.id,"quiz"); } };
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
        body: JSON.stringify({ type:"aide", question:u, reponse:u, section:ctx, cours:txt, matiere:"Anglais" }) });
      const d = await r.json();
      setMsgs(m=>[...m,{r:"ai",t:d.reply||"Erreur."}]);
    } catch { setMsgs(m=>[...m,{r:"ai",t:"Erreur de connexion."}]); }
    setLd(false);
  };
  if(!open) return <div onClick={()=>setOpen(true)} style={{ background:"linear-gradient(135deg,#6366f1,#818cf8)", padding:14, borderRadius:12, textAlign:"center", cursor:"pointer", marginTop:16, fontWeight:700, fontSize:14, color:"#fff" }}>🤖 Je suis bloqué — Prof IA</div>;
  return (<div style={{ background:"#1e293b", borderRadius:14, padding:18, marginTop:16, border:"2px solid #6366f1" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontWeight:700, color:"#818cf8" }}>🤖 Prof d'Anglais IA</span><span onClick={()=>{setOpen(false);setMsgs([]);}} style={{ cursor:"pointer", color:"#94a3b8" }}>✕</span></div>
    <div ref={ref} style={{ maxHeight:250, overflowY:"auto", marginBottom:10 }}>
      {msgs.length===0 && <div style={{ fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>Pose ta question... (en français ou anglais)</div>}
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
