"use client";
import { useState, useRef, useEffect } from "react";

function logActivity(matiere) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const log = JSON.parse(localStorage.getItem("activity_log") || "{}");
    if (!log[today]) log[today] = {};
    log[today][matiere] = Date.now();
    localStorage.setItem("activity_log", JSON.stringify(log));
  } catch {}
}

const SEANCES = [
  {
    id: 1, title: "La forme de la Terre (Physique-Chimie)",
    lessons: [
      { title: "Comment mesurer la Terre ?", content: "Dès l'Antiquité, les savants ont cherché à mesurer la Terre.\n\nÉRATOSTHÈNE (IIIe siècle av. J.-C.) réalise la première mesure connue de la circonférence terrestre :\n\nMéthode : il compare l'angle des rayons du soleil à midi entre Alexandrie et Syène (Assouan) le même jour, connaissant la distance entre les deux villes.\n\nRésultat : environ 40 000 km, très proche de la valeur réelle (40 075 km) !" },
      { title: "La Terre n'est pas une sphère parfaite", content: "La Terre est en réalité un GÉOÏDE, légèrement aplatie aux pôles et renflée à l'équateur, à cause de la force centrifuge liée à sa rotation.\n\nRayon équatorial : 6378 km\nRayon polaire : 6357 km\n\nCette différence (environ 21 km) est infime à l'échelle du globe mais mesurable avec des méthodes précises (satellites GPS aujourd'hui)." },
      { title: "Méthodes de calcul modernes", content: "Aujourd'hui, on utilise :\n\n• La TRIANGULATION : mesure d'angles entre points connus\n• Les SATELLITES GPS : positionnement ultra-précis\n• La GRAVIMÉTRIE : mesure des variations du champ de gravité\n\nCes méthodes permettent de connaître la forme de la Terre avec une précision de quelques centimètres." }
    ],
    exercises: [
      { q: "Qui réalise la première mesure de la circonférence terrestre ?", answer: "eratosthene", hint: "Savant grec de l'Antiquité", level: 1 },
      { q: "La Terre est-elle une sphère parfaite ?", answer: "non geoide", hint: "Aplatie aux pôles", level: 1 },
      { q: "Pourquoi la Terre est-elle aplatie aux pôles ?", answer: "force centrifuge rotation", hint: "Liée à la rotation de la Terre", level: 2 }
    ],
    quiz: [
      { q: "Ératosthène mesure la Terre en comparant...", options: ["L'angle des rayons du soleil entre 2 villes", "La température", "La couleur du ciel", "La vitesse du vent"], correct: 0 },
      { q: "La Terre est un...", options: ["Géoïde", "Cube parfait", "Cylindre", "Cône"], correct: 0 },
      { q: "Le rayon équatorial est... au rayon polaire", answer: "", options: ["Supérieur", "Inférieur", "Égal", "Aucun rapport"], correct: 0 }
    ]
  },
  {
    id: 2, title: "L'histoire de l'âge de la Terre (SVT)",
    lessons: [
      { title: "Un ordre de grandeur immense", content: "L'âge de la Terre est d'environ 4,5 MILLIARDS D'ANNÉES, un ordre de grandeur sans rapport avec l'échelle de la vie humaine.\n\nComprendre cet âge a nécessité des siècles de débats scientifiques et l'apport de plusieurs disciplines : géologie, physique nucléaire, astronomie." },
      { title: "L'évolution des méthodes de datation", content: "Étapes historiques :\n\n• XVIIe siècle : estimations bibliques (~6000 ans)\n• XIXe siècle : géologues estiment des dizaines/centaines de millions d'années (vitesse de sédimentation)\n• Lord Kelvin (physicien) : estimation par refroidissement terrestre (~100 millions d'années) — sous-estimée\n• XXe siècle : découverte de la RADIOACTIVITÉ → datation radiométrique précise\n\nLa datation par désintégration radioactive (uranium-plomb) permet d'obtenir l'âge actuel de 4,5 milliards d'années." },
      { title: "Le principe de la datation radiométrique", content: "Certains éléments radioactifs (comme l'uranium 238) se désintègrent à VITESSE CONSTANTE et connue, appelée PÉRIODE ou demi-vie.\n\nEn mesurant le rapport entre l'élément radioactif restant et l'élément stable produit (le \"produit fils\"), on peut calculer l'âge d'une roche.\n\nCette méthode a été appliquée aux plus vieilles roches terrestres et aux météorites pour établir l'âge de la Terre." }
    ],
    exercises: [
      { q: "Quel est l'âge de la Terre ?", answer: "4.5 milliards d'annees", hint: "Chiffre à retenir précisément", level: 1 },
      { q: "Quelle découverte du XXe siècle permet une datation précise ?", answer: "radioactivite", hint: "Désintégration d'éléments à vitesse constante", level: 2 },
      { q: "Comment appelle-t-on la vitesse de désintégration radioactive ?", answer: "periode ou demi-vie", hint: "Terme technique précis", level: 2 }
    ],
    quiz: [
      { q: "L'âge de la Terre est d'environ...", options: ["4,5 milliards d'années", "6000 ans", "100 millions d'années", "1 milliard d'années"], correct: 0 },
      { q: "La datation radiométrique utilise...", options: ["La désintégration d'éléments radioactifs", "La couleur des roches", "La météo", "Le poids des roches"], correct: 0 },
      { q: "Lord Kelvin a sous-estimé l'âge de la Terre en se basant sur...", options: ["Le refroidissement terrestre", "La radioactivité", "Les fossiles", "La Bible"], correct: 0 }
    ]
  },
  {
    id: 3, title: "La Terre dans l'Univers (PC et SVT)",
    lessons: [
      { title: "Un débat scientifique et sociétal", content: "Le MOUVEMENT de la Terre dans l'Univers a fait l'objet de célèbres et violentes controverses historiques.\n\nDu GÉOCENTRISME (la Terre au centre, Ptolémée) à l'HÉLIOCENTRISME (le Soleil au centre, Copernic, Galilée, Kepler), ce changement de paradigme a mis des siècles à s'imposer, en raison de résistances religieuses et culturelles.\n\nCela illustre la difficulté de la construction du savoir scientifique au sein d'une société." },
      { title: "Les preuves de la rotation terrestre", content: "Plusieurs expériences ont permis de PROUVER le mouvement de la Terre :\n\n• Le PENDULE DE FOUCAULT (1851) démontre la rotation de la Terre sur elle-même\n• La PARALLAXE STELLAIRE prouve le mouvement de révolution autour du Soleil\n• L'aplatissement aux pôles (vu en séance 1) est une conséquence directe de la rotation\n\nCes preuves ont mis fin scientifiquement au débat, bien après les intuitions de Copernic (XVIe siècle)." } ,
      { title: "La place de la Terre dans le système solaire", content: "La Terre est la 3e planète du système solaire, dans la \"zone habitable\" (ni trop proche ni trop loin du Soleil), ce qui permet la présence d'eau liquide.\n\nCette position particulière, combinée à d'autres facteurs (atmosphère, champ magnétique), explique pourquoi la Terre est (à ce jour) la seule planète connue abritant la vie." }
    ],
    exercises: [
      { q: "Quelle théorie place le Soleil au centre du système ?", answer: "heliocentrisme", hint: "Copernic, Galilée, Kepler", level: 1 },
      { q: "Quelle expérience de 1851 prouve la rotation de la Terre ?", answer: "pendule de foucault", hint: "Expérience célèbre au Panthéon", level: 2 },
      { q: "Pourquoi la Terre est-elle habitable ?", answer: "zone habitable eau liquide", hint: "Position dans le système solaire", level: 2 }
    ],
    quiz: [
      { q: "Le pendule de Foucault prouve...", options: ["La rotation de la Terre", "L'existence du Soleil", "La forme carrée de la Terre", "La gravité lunaire"], correct: 0 },
      { q: "L'héliocentrisme place au centre...", options: ["Le Soleil", "La Terre", "La Lune", "Mars"], correct: 0 },
      { q: "La Terre est la...ème planète du système solaire", options: ["3e", "1ère", "5e", "8e"], correct: 0 }
    ]
  }
];

const LEVELS = { 1: { label: "Facile", c: "#22c55e" }, 2: { label: "Moyen", c: "#f59e0b" }, 3: { label: "Difficile", c: "#ef4444" } };

export default function EnsSciPage() {
  const [view, setView] = useState("home");
  const [si, setSi] = useState(0);
  const [li, setLi] = useState(0);
  const [tab, setTab] = useState("cours");
  const [prog, setProg] = useState(() => { try { const s = typeof window!=="undefined" && localStorage.getItem("esp"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const save = (p) => { setProg(p); try { localStorage.setItem("esp", JSON.stringify(p)); } catch {} };
  const mark = (id, t) => { if (!prog[`${id}_${t}`]) { save({ ...prog, [`${id}_${t}`]: true }); logActivity("SC"); } };
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
          <div style={{ fontSize:24, fontWeight:800 }}>🔬 Prof d'Ens. Scientifique IA</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Séq.1 — La Terre, un astre singulier</div>
        </div>
      </div>
      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontWeight:700 }}>Progression</span><span style={{ color:"#2dd4bf", fontWeight:700 }}>{pct}%</span></div>
        <div style={{ height:10, background:"#334155", borderRadius:5, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#14b8a6,#2dd4bf)", borderRadius:5, transition:"width .5s" }} /></div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:6 }}>{cnt}/{total} complétés</div>
      </div>
      {SEANCES.map((x, i) => { const d = [done(x.id,"lessons"), done(x.id,"exercises"), done(x.id,"quiz")]; const c = d.filter(Boolean).length; return (
        <div key={x.id} onClick={() => { setSi(i); setView("s"); setTab("cours"); setLi(0); }}
          style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10, cursor:"pointer", borderLeft:`4px solid ${c===3?"#22c55e":c>0?"#f59e0b":"#334155"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:12, color:"#2dd4bf", fontWeight:600 }}>Partie {x.id}</div><div style={{ fontWeight:700, fontSize:15 }}>{x.title}</div></div>
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
        <div><div style={{ fontSize:12, color:"#2dd4bf" }}>Partie {s.id}</div><div style={{ fontWeight:700, fontSize:16 }}>{s.title}</div></div>
      </div>
      <div style={{ display:"flex", padding:"12px 16px", gap:0 }}>
        {[["cours","📖 Cours"],["exercices","✏️ Exos"],["quiz","🧪 Quiz"]].map(([k,l]) => (
          <div key={k} onClick={() => setTab(k)} style={{ flex:1, textAlign:"center", padding:"10px 0", borderRadius:10, background:tab===k?"#14b8a6":"transparent", color:tab===k?"#fff":"#94a3b8", fontWeight:600, fontSize:13, cursor:"pointer" }}>
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
      {s.lessons.map((x,i) => <div key={i} onClick={() => setLi(i)} style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:i===li?"#14b8a6":dn.includes(i)?"rgba(34,197,94,.15)":"#1e293b", color:i===li?"#fff":dn.includes(i)?"#22c55e":"#94a3b8" }}>{i+1}. {x.title}</div>)}
    </div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18, borderLeft:"4px solid #14b8a6" }}>
      <div style={{ fontSize:16, fontWeight:700, marginBottom:10, color:"#2dd4bf" }}>{l.title}</div>
      <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, lineHeight:1.7, margin:0, color:"#e2e8f0" }}>{l.content}</pre>
    </div>
    <AiChat ctx={`Partie ${s.id}: ${s.title} — ${l.title}`} txt={l.content} />
    <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
      <button onClick={() => li>0&&setLi(li-1)} disabled={li===0} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#1e293b", color:"#e2e8f0", fontWeight:600, cursor:li===0?"not-allowed":"pointer", opacity:li===0?.5:1 }}>← Précédent</button>
      <button onClick={next} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#14b8a6", color:"#fff", fontWeight:600, cursor:"pointer" }}>{li<s.lessons.length-1?"Suivant →":"Terminé ✓"}</button>
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
      {[0,1,2,3].map(l => <div key={l} onClick={() => setFl(l)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:fl===l?(l===0?"#14b8a6":LEVELS[l]?.c):"#1e293b", color:fl===l?"#fff":"#94a3b8" }}>{l===0?"Tous":LEVELS[l].label}</div>)}
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
            style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#14b8a6", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Vérifier</button>
          {r===false && <button onClick={() => alert("💡 "+ex.hint)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#0d9488", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Indice</button>}
        </div>
        {r===false && <div style={{ marginTop:8, padding:10, background:"rgba(239,68,68,.1)", borderRadius:8, fontSize:13, color:"#fca5a5" }}>Réponse : {ex.answer}</div>}
      </div>
    ); })}
    <AiChat ctx={`Exercices Partie ${s.id}: ${s.title}`} txt={s.exercises.map(e=>e.q).join("\n")} />
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
    <button onClick={rst} style={{ marginTop:16, padding:"10px 18px", borderRadius:10, border:"none", background:"#14b8a6", color:"#fff", fontWeight:600, cursor:"pointer" }}>Recommencer</button>
  </div>);
  return (<div>
    <div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>Question {qi+1}/{s.quiz.length}</div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18 }}>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>{q.q}</div>
      {q.options.map((o,i) => { let bg="#0f172a",bd="#334155",cl="#e2e8f0"; if(sh){ if(i===q.correct){bg="rgba(34,197,94,.15)";bd="#22c55e";cl="#22c55e";} else if(i===sel){bg="rgba(239,68,68,.15)";bd="#ef4444";cl="#ef4444";} } else if(i===sel){bg="rgba(20,184,166,.15)";bd="#14b8a6";} return (
        <div key={i} onClick={()=>chk(i)} style={{ padding:12, borderRadius:10, border:`2px solid ${bd}`, background:bg, color:cl, marginBottom:8, cursor:sh?"default":"pointer", fontWeight:500, fontSize:14 }}>{o}</div>
      ); })}
      {sh && <button onClick={nxt} style={{ marginTop:12, padding:"10px 18px", borderRadius:10, border:"none", background:"#14b8a6", color:"#fff", fontWeight:600, cursor:"pointer" }}>{qi<s.quiz.length-1?"Suivante →":"Voir le score"}</button>}
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
        body: JSON.stringify({ type:"aide", question:u, reponse:u, section:ctx, cours:txt, matiere:"Enseignement Scientifique" }) });
      const d = await r.json();
      setMsgs(m=>[...m,{r:"ai",t:d.reply||"Erreur."}]);
    } catch { setMsgs(m=>[...m,{r:"ai",t:"Erreur de connexion."}]); }
    setLd(false);
  };
  if(!open) return <div onClick={()=>setOpen(true)} style={{ background:"linear-gradient(135deg,#14b8a6,#2dd4bf)", padding:14, borderRadius:12, textAlign:"center", cursor:"pointer", marginTop:16, fontWeight:700, fontSize:14, color:"#fff" }}>🤖 Je suis bloqué — Prof IA</div>;
  return (<div style={{ background:"#1e293b", borderRadius:14, padding:18, marginTop:16, border:"2px solid #14b8a6" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontWeight:700, color:"#2dd4bf" }}>🤖 Prof d'Ens. Sci IA</span><span onClick={()=>{setOpen(false);setMsgs([]);}} style={{ cursor:"pointer", color:"#94a3b8" }}>✕</span></div>
    <div ref={ref} style={{ maxHeight:250, overflowY:"auto", marginBottom:10 }}>
      {msgs.length===0 && <div style={{ fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>Pose ta question...</div>}
      {msgs.map((m,i) => <div key={i} style={{ marginBottom:8, padding:10, borderRadius:10, background:m.r==="user"?"rgba(20,184,166,.15)":"rgba(34,197,94,.1)", borderLeft:`3px solid ${m.r==="user"?"#14b8a6":"#22c55e"}` }}>
        <div style={{ fontSize:11, fontWeight:600, color:m.r==="user"?"#2dd4bf":"#22c55e", marginBottom:3 }}>{m.r==="user"?"Toi":"Prof IA"}</div>
        <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{m.t}</div>
      </div>)}
      {ld && <div style={{ fontSize:13, color:"#94a3b8" }}>Le prof réfléchit...</div>}
    </div>
    <div style={{ display:"flex", gap:8 }}>
      <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ta question..." style={{ flex:1, padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
      <button onClick={ask} disabled={ld} style={{ padding:"10px 16px", borderRadius:10, border:"none", background:"#14b8a6", color:"#fff", fontWeight:600, cursor:ld?"not-allowed":"pointer" }}>↑</button>
    </div>
  </div>);
}
