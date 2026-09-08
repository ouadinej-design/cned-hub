"use client";
import { useState, useRef, useEffect } from "react";

const SEANCES = [
  {
    id: 1, title: "La métropolisation, un processus mondial",
    lessons: [
      { title: "Qu'est-ce que la métropolisation ?", content: "La MÉTROPOLISATION désigne le processus de concentration des populations, des activités et des richesses dans les plus grandes villes du monde : les MÉTROPOLES.\n\nCe processus est MONDIAL mais DIFFÉRENCIÉ selon les régions du monde (rythme, ampleur, formes urbaines différentes).\n\nUne métropole se définit par :\n• Une population importante\n• Des fonctions de commandement (sièges sociaux, institutions, finance)\n• Un rayonnement à l'échelle nationale, régionale ou mondiale" },
      { title: "L'évolution urbaine dans le monde", content: "En 2025, plus de 55% de la population mondiale vit en ville (contre 30% en 1950).\n\nCette urbanisation est plus RAPIDE dans les pays du Sud (Asie, Afrique) qu'elle ne l'a été historiquement dans les pays du Nord.\n\nOn distingue :\n• Les MÉGALOPOLES : vastes aires urbaines continues (côte est des USA, Tokyo-Osaka)\n• Les MÉGAPOLES : villes de plus de 10 millions d'habitants (Lagos, Mumbai, São Paulo)" }
    ],
    exercises: [
      { q: "Quel pourcentage de la population mondiale est urbaine en 2025 ?", answer: "55%", hint: "Plus de la moitié", level: 1 },
      { q: "Qu'est-ce qu'une mégapole ?", answer: "ville de plus de 10 millions d'habitants", hint: "Seuil démographique précis", level: 2 }
    ],
    quiz: [
      { q: "La métropolisation est un processus...", options: ["Mondial mais différencié", "Uniforme partout", "Propre à l'Europe uniquement", "En déclin"], correct: 0 },
      { q: "Une métropole se caractérise par...", options: ["Des fonctions de commandement", "L'absence d'habitants", "Uniquement l'agriculture", "L'isolement"], correct: 0 }
    ]
  },
  {
    id: 2, title: "Les villes à l'échelle mondiale",
    lessons: [
      { title: "La hiérarchie urbaine mondiale", content: "Toutes les villes n'ont pas le même poids : on parle de HIÉRARCHIE URBAINE MONDIALE.\n\nAu sommet : les VILLES MONDIALES (ou \"villes globales\") comme New York, Londres, Tokyo, Paris — elles concentrent pouvoir économique, financier, politique et culturel.\n\nEnsuite : des métropoles régionales importantes (São Paulo, Mumbai, Lagos) qui rayonnent sur leur continent.\n\nCette hiérarchie évolue : montée en puissance des métropoles asiatiques (Shanghai, Shenzhen, Singapour)." },
      { title: "Les réseaux de villes mondialisés", content: "Les grandes villes sont connectées entre elles par des RÉSEAUX (transport aérien, flux financiers, câbles sous-marins numériques).\n\nCes réseaux créent un \"archipel métropolitain mondial\" : les grandes métropoles sont parfois plus connectées entre elles qu'avec leur propre arrière-pays national." }
    ],
    exercises: [
      { q: "Citer une ville mondiale", answer: "new york,londres,tokyo,paris", hint: "Sommet de la hiérarchie urbaine", level: 1 },
      { q: "Que désigne l'expression \"archipel métropolitain mondial\" ?", answer: "reseau de metropoles connectees entre elles", hint: "Plus connectées entre elles qu'avec leur pays", level: 3 }
    ],
    quiz: [
      { q: "Les villes mondiales concentrent...", options: ["Pouvoir économique et financier", "Uniquement l'agriculture", "L'isolement total", "Aucune fonction particulière"], correct: 0 },
      { q: "Les métropoles asiatiques en croissance incluent...", options: ["Shanghai, Singapour", "Détroit uniquement", "Aucune ville", "Seulement des villes européennes"], correct: 0 }
    ]
  },
  {
    id: 3, title: "Des métropoles inégales et en mutation",
    lessons: [
      { title: "Les inégalités dans la métropole", content: "Les métropoles concentrent richesse ET pauvreté : c'est le paradoxe métropolitain.\n\nOn observe souvent une SÉGRÉGATION SPATIALE :\n• Quartiers d'affaires et résidentiels aisés (gentrification)\n• Bidonvilles et quartiers informels en périphérie ou enclavés (favelas, slums)\n\nCes inégalités sont souvent renforcées par les mutations économiques (tertiarisation, gentrification qui repousse les populations modestes)." },
      { title: "Zoom : Mumbai, métropole indienne", content: "Mumbai illustre le DYNAMISME et les DIFFICULTÉS des métropoles du Sud :\n\n• Centre financier de l'Inde, sièges d'entreprises, Bollywood\n• Mais aussi Dharavi, un des plus grands bidonvilles d'Asie\n• Croissance urbaine très rapide, pression foncière énorme\n• Enjeux d'infrastructures (transports, eau, assainissement) qui peinent à suivre" }
    ],
    exercises: [
      { q: "Comment appelle-t-on la séparation spatiale entre populations riches et pauvres en ville ?", answer: "segregation spatiale", hint: "Terme géographique précis", level: 2 },
      { q: "Comment s'appelle le grand bidonville de Mumbai ?", answer: "dharavi", hint: "L'un des plus grands d'Asie", level: 2 }
    ],
    quiz: [
      { q: "La gentrification désigne...", options: ["L'embourgeoisement d'un quartier populaire", "La construction de bidonvilles", "L'exode rural", "La désindustrialisation"], correct: 0 },
      { q: "Mumbai est un exemple de métropole...", options: ["Du Sud, dynamique mais inégale", "Sans aucune inégalité", "Uniquement rurale", "En déclin total"], correct: 0 }
    ]
  },
  {
    id: 4, title: "La France : la métropolisation et ses effets",
    lessons: [
      { title: "Paris, métropole mondiale française", content: "PARIS est la seule vraie ville mondiale française : elle concentre fonctions de commandement, sièges sociaux, institutions politiques.\n\nL'aire urbaine parisienne pèse un poids démographique et économique disproportionné par rapport au reste du territoire national : c'est le phénomène de MACROCÉPHALIE URBAINE." },
      { title: "Les métropoles régionales françaises", content: "La loi MAPTAM (2014) crée un statut de MÉTROPOLE pour les grandes villes françaises (Lyon, Marseille, Toulouse, Bordeaux, Lille...).\n\nObjectif : renforcer leur attractivité et leur permettre de rivaliser à l'échelle européenne.\n\nCela crée cependant des tensions avec les territoires périphériques et ruraux (sentiment de \"relégation\", diagonale du vide)." }
    ],
    exercises: [
      { q: "Quelle est la seule ville mondiale française ?", answer: "paris", hint: "Capitale politique et économique", level: 1 },
      { q: "Quelle loi crée le statut de métropole en France (2014) ?", answer: "loi maptam", hint: "Loi de Modernisation de l'Action Publique...", level: 3 }
    ],
    quiz: [
      { q: "La macrocéphalie urbaine désigne...", options: ["Le poids disproportionné d'une ville (Paris)", "L'égalité entre toutes les villes", "L'absence de grande ville", "Un phénomène rural"], correct: 0 },
      { q: "La loi MAPTAM date de...", options: ["2014", "1982", "2020", "1999"], correct: 0 }
    ]
  }
];

const LEVELS = { 1: { label: "Facile", c: "#22c55e" }, 2: { label: "Moyen", c: "#f59e0b" }, 3: { label: "Difficile", c: "#ef4444" } };

export default function HistGeoPage() {
  const [view, setView] = useState("home");
  const [si, setSi] = useState(0);
  const [li, setLi] = useState(0);
  const [tab, setTab] = useState("cours");
  const [prog, setProg] = useState(() => { try { const s = typeof window!=="undefined" && localStorage.getItem("hgp"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const save = (p) => { setProg(p); try { localStorage.setItem("hgp", JSON.stringify(p)); } catch {} };
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
          <div style={{ fontSize:24, fontWeight:800 }}>🗺️ Prof d'Hist-Géo IA</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Séq.1 — La métropolisation</div>
        </div>
      </div>
      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontWeight:700 }}>Progression</span><span style={{ color:"#fb923c", fontWeight:700 }}>{pct}%</span></div>
        <div style={{ height:10, background:"#334155", borderRadius:5, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#f97316,#fb923c)", borderRadius:5, transition:"width .5s" }} /></div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:6 }}>{cnt}/{total} complétés</div>
      </div>
      {SEANCES.map((x, i) => { const d = [done(x.id,"lessons"), done(x.id,"exercises"), done(x.id,"quiz")]; const c = d.filter(Boolean).length; return (
        <div key={x.id} onClick={() => { setSi(i); setView("s"); setTab("cours"); setLi(0); }}
          style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10, cursor:"pointer", borderLeft:`4px solid ${c===3?"#22c55e":c>0?"#f59e0b":"#334155"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:12, color:"#fb923c", fontWeight:600 }}>Séance {x.id}</div><div style={{ fontWeight:700, fontSize:15 }}>{x.title}</div></div>
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
        <div><div style={{ fontSize:12, color:"#fb923c" }}>Séance {s.id}</div><div style={{ fontWeight:700, fontSize:16 }}>{s.title}</div></div>
      </div>
      <div style={{ display:"flex", padding:"12px 16px", gap:0 }}>
        {[["cours","📖 Cours"],["exercices","✏️ Exos"],["quiz","🧪 Quiz"]].map(([k,l]) => (
          <div key={k} onClick={() => setTab(k)} style={{ flex:1, textAlign:"center", padding:"10px 0", borderRadius:10, background:tab===k?"#f97316":"transparent", color:tab===k?"#fff":"#94a3b8", fontWeight:600, fontSize:13, cursor:"pointer" }}>
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
      {s.lessons.map((x,i) => <div key={i} onClick={() => setLi(i)} style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:i===li?"#f97316":dn.includes(i)?"rgba(34,197,94,.15)":"#1e293b", color:i===li?"#fff":dn.includes(i)?"#22c55e":"#94a3b8" }}>{i+1}. {x.title}</div>)}
    </div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18, borderLeft:"4px solid #f97316" }}>
      <div style={{ fontSize:16, fontWeight:700, marginBottom:10, color:"#fb923c" }}>{l.title}</div>
      <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, lineHeight:1.7, margin:0, color:"#e2e8f0" }}>{l.content}</pre>
    </div>
    <AiChat ctx={`Séance ${s.id}: ${s.title} — ${l.title}`} txt={l.content} />
    <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
      <button onClick={() => li>0&&setLi(li-1)} disabled={li===0} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#1e293b", color:"#e2e8f0", fontWeight:600, cursor:li===0?"not-allowed":"pointer", opacity:li===0?.5:1 }}>← Précédent</button>
      <button onClick={next} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#f97316", color:"#fff", fontWeight:600, cursor:"pointer" }}>{li<s.lessons.length-1?"Suivant →":"Terminé ✓"}</button>
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
      {[0,1,2,3].map(l => <div key={l} onClick={() => setFl(l)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:fl===l?(l===0?"#f97316":LEVELS[l]?.c):"#1e293b", color:fl===l?"#fff":"#94a3b8" }}>{l===0?"Tous":LEVELS[l].label}</div>)}
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
            style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#f97316", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Vérifier</button>
          {r===false && <button onClick={() => alert("💡 "+ex.hint)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#ea580c", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Indice</button>}
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
    <button onClick={rst} style={{ marginTop:16, padding:"10px 18px", borderRadius:10, border:"none", background:"#f97316", color:"#fff", fontWeight:600, cursor:"pointer" }}>Recommencer</button>
  </div>);
  return (<div>
    <div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>Question {qi+1}/{s.quiz.length}</div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18 }}>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>{q.q}</div>
      {q.options.map((o,i) => { let bg="#0f172a",bd="#334155",cl="#e2e8f0"; if(sh){ if(i===q.correct){bg="rgba(34,197,94,.15)";bd="#22c55e";cl="#22c55e";} else if(i===sel){bg="rgba(239,68,68,.15)";bd="#ef4444";cl="#ef4444";} } else if(i===sel){bg="rgba(249,115,22,.15)";bd="#f97316";} return (
        <div key={i} onClick={()=>chk(i)} style={{ padding:12, borderRadius:10, border:`2px solid ${bd}`, background:bg, color:cl, marginBottom:8, cursor:sh?"default":"pointer", fontWeight:500, fontSize:14 }}>{o}</div>
      ); })}
      {sh && <button onClick={nxt} style={{ marginTop:12, padding:"10px 18px", borderRadius:10, border:"none", background:"#f97316", color:"#fff", fontWeight:600, cursor:"pointer" }}>{qi<s.quiz.length-1?"Suivante →":"Voir le score"}</button>}
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
        body: JSON.stringify({ type:"aide", question:u, reponse:u, section:ctx, cours:txt, matiere:"Histoire-Géographie" }) });
      const d = await r.json();
      setMsgs(m=>[...m,{r:"ai",t:d.reply||"Erreur."}]);
    } catch { setMsgs(m=>[...m,{r:"ai",t:"Erreur de connexion."}]); }
    setLd(false);
  };
  if(!open) return <div onClick={()=>setOpen(true)} style={{ background:"linear-gradient(135deg,#f97316,#fb923c)", padding:14, borderRadius:12, textAlign:"center", cursor:"pointer", marginTop:16, fontWeight:700, fontSize:14, color:"#fff" }}>🤖 Je suis bloqué — Prof IA</div>;
  return (<div style={{ background:"#1e293b", borderRadius:14, padding:18, marginTop:16, border:"2px solid #f97316" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontWeight:700, color:"#fb923c" }}>🤖 Prof d'Hist-Géo IA</span><span onClick={()=>{setOpen(false);setMsgs([]);}} style={{ cursor:"pointer", color:"#94a3b8" }}>✕</span></div>
    <div ref={ref} style={{ maxHeight:250, overflowY:"auto", marginBottom:10 }}>
      {msgs.length===0 && <div style={{ fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>Pose ta question...</div>}
      {msgs.map((m,i) => <div key={i} style={{ marginBottom:8, padding:10, borderRadius:10, background:m.r==="user"?"rgba(249,115,22,.15)":"rgba(34,197,94,.1)", borderLeft:`3px solid ${m.r==="user"?"#f97316":"#22c55e"}` }}>
        <div style={{ fontSize:11, fontWeight:600, color:m.r==="user"?"#fb923c":"#22c55e", marginBottom:3 }}>{m.r==="user"?"Toi":"Prof IA"}</div>
        <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{m.t}</div>
      </div>)}
      {ld && <div style={{ fontSize:13, color:"#94a3b8" }}>Le prof réfléchit...</div>}
    </div>
    <div style={{ display:"flex", gap:8 }}>
      <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ta question..." style={{ flex:1, padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
      <button onClick={ask} disabled={ld} style={{ padding:"10px 16px", borderRadius:10, border:"none", background:"#f97316", color:"#fff", fontWeight:600, cursor:ld?"not-allowed":"pointer" }}>↑</button>
    </div>
  </div>);
}
