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
    id: 1, title: "S'informer : un regard critique sur l'information",
    lessons: [
      { title: "Comment s'informe-t-on aujourd'hui ?", content: "L'HGGSP (Histoire-Géographie, Géopolitique et Sciences Politiques) étudie ici l'AXE 1 : \"Les grandes révolutions techniques de l'information\".\n\nProblématique : comment les progrès techniques ont-ils transformé l'accès à l'information et le rôle du citoyen depuis le XIXe siècle ?\n\nEnjeux clés :\n• Connaître les enjeux de l'information aujourd'hui\n• Comprendre le rôle d'une information libre pour éclairer l'opinion\n• Prendre conscience des risques de manipulation" },
      { title: "Les progrès techniques de l'information", content: "Grandes étapes historiques :\n\n• XIXe siècle : presse à grand tirage, développement de l'imprimerie industrielle\n• XXe siècle : radio (années 1920-30) puis télévision (années 1950-60)\n• Fin XXe : Internet, réseau mondial\n• XXIe siècle : information instantanée, réseaux sociaux\n\nChaque révolution technique a démultiplié la vitesse et la portée de l'information, mais aussi les risques de désinformation." }
    ],
    exercises: [
      { q: "Quel média se développe au XIXe siècle ?", answer: "la presse imprimee", hint: "Presse à grand tirage grâce à l'imprimerie industrielle", level: 1 },
      { q: "Dans quelle décennie la radio se développe-t-elle en France ?", answer: "1920-1930", hint: "Entre-deux-guerres", level: 2 }
    ],
    quiz: [
      { q: "L'imprimerie industrielle se développe au...", options: ["XIXe siècle", "XVe siècle", "XXe siècle", "XXIe siècle"], correct: 0 },
      { q: "La radio se popularise dans les années...", options: ["1920-1930", "1980-1990", "1850-1860", "2000-2010"], correct: 0 }
    ]
  },
  {
    id: 2, title: "L'information imprimée",
    lessons: [
      { title: "De l'imprimerie à la presse à grand tirage", content: "L'imprimerie de Gutenberg (XVe siècle) permet la diffusion massive de l'écrit.\n\nAu XIXe siècle : révolution de la PRESSE À GRAND TIRAGE grâce à :\n• L'alphabétisation croissante\n• Les progrès techniques (rotative, papier bon marché)\n• La baisse des coûts (\"presse à un sou\")\n\nDes journaux comme Le Petit Journal atteignent des millions de lecteurs." },
      { title: "Le rôle politique de la presse imprimée", content: "La presse devient un ACTEUR POLITIQUE majeur :\n\n• Elle informe mais aussi oriente l'opinion publique\n• Elle peut dénoncer des scandales (rôle de \"contre-pouvoir\")\n• Elle est parfois instrumentalisée par le pouvoir ou des intérêts privés\n\nLa loi de 1881 sur la liberté de la presse en France est un jalon fondamental : elle garantit la liberté d'expression tout en encadrant les abus (diffamation, etc.)" }
    ],
    exercises: [
      { q: "Qui invente l'imprimerie moderne ?", answer: "gutenberg", hint: "XVe siècle", level: 1 },
      { q: "Quelle loi française de 1881 est fondamentale pour la presse ?", answer: "loi sur la liberte de la presse", hint: "Garantit la liberté d'expression", level: 2 }
    ],
    quiz: [
      { q: "La loi de 1881 concerne...", options: ["La liberté de la presse", "La télévision", "Internet", "La radio"], correct: 0 },
      { q: "La presse peut jouer un rôle de...", options: ["Contre-pouvoir", "Seul pouvoir", "Absence de pouvoir", "Pouvoir judiciaire"], correct: 0 }
    ]
  },
  {
    id: 3, title: "L'information par le son et l'image",
    lessons: [
      { title: "La radio, nouvelle puissance", content: "La RADIO se développe dans l'entre-deux-guerres.\n\nElle permet une information INSTANTANÉE et touche un public plus large que la presse écrite (y compris les analphabètes).\n\nElle est utilisée à des fins de PROPAGANDE par les régimes totalitaires (Allemagne nazie, URSS) mais aussi par les démocraties (discours de Churchill, de Gaulle à Londres en 1940)." },
      { title: "La télévision au XXe siècle", content: "La TÉLÉVISION se généralise dans les foyers à partir des années 1950-60.\n\nElle combine son ET image : impact émotionnel plus fort.\n\nElle transforme la vie politique : débats télévisés (Kennedy-Nixon 1960), événements suivis en direct (premiers pas sur la Lune 1969).\n\nElle devient le média dominant jusqu'à l'arrivée d'Internet." }
    ],
    exercises: [
      { q: "La radio se développe pendant quelle période ?", answer: "entre deux guerres", hint: "Entre 1918 et 1939", level: 1 },
      { q: "Citer un exemple d'usage politique de la radio", answer: "appel du 18 juin", hint: "De Gaulle à Londres en 1940", level: 2 }
    ],
    quiz: [
      { q: "La télévision se généralise à partir des années...", options: ["1950-1960", "1900-1910", "1990-2000", "2010-2020"], correct: 0 },
      { q: "Le premier débat télévisé présidentiel américain oppose...", options: ["Kennedy et Nixon", "Roosevelt et Truman", "Reagan et Carter", "Bush et Gore"], correct: 0 }
    ]
  },
  {
    id: 4, title: "L'information mondialisée : Internet",
    lessons: [
      { title: "Naissance et extension du réseau", content: "INTERNET naît dans un contexte militaire et scientifique (ARPANET, USA, 1969) avant de se démocratiser dans les années 1990.\n\nLe World Wide Web (1991, Tim Berners-Lee) rend Internet accessible au grand public.\n\nConséquences :\n• Information MONDIALISÉE et instantanée\n• Chacun peut devenir producteur d'information (blogs, réseaux sociaux)\n• Fin du monopole des grands médias traditionnels" },
      { title: "Un accès individualisé à l'information", content: "Avec Internet, l'information devient INDIVIDUALISÉE :\n\n• Algorithmes de recommandation (bulles de filtre)\n• Chacun construit son propre flux d'information\n• Risque de polarisation et d'enfermement dans ses opinions (chambre d'écho)\n\nCela pose la question du rôle du citoyen face à cette masse d'informations non hiérarchisées." }
    ],
    exercises: [
      { q: "Internet naît dans quel contexte à l'origine ?", answer: "militaire et scientifique", hint: "ARPANET aux USA en 1969", level: 2 },
      { q: "Qui invente le World Wide Web ?", answer: "tim berners-lee", hint: "En 1991", level: 2 }
    ],
    quiz: [
      { q: "Le World Wide Web est créé en...", options: ["1991", "1969", "2004", "1950"], correct: 0 },
      { q: "Une \"bulle de filtre\" désigne...", options: ["Un enfermement algorithmique dans ses opinions", "Un virus informatique", "Un type de câble internet", "Une norme de sécurité"], correct: 0 }
    ]
  },
  {
    id: 5, title: "L'information devenue instantanée",
    lessons: [
      { title: "Le règne de l'instantanéité", content: "Avec les smartphones et les réseaux sociaux, l'information devient INSTANTANÉE : diffusion en temps réel, sans délai de vérification.\n\nAvantages : réactivité, information en direct des événements (\"live tweeting\")\n\nRisques : \n• Diffusion de fausses informations avant vérification\n• Course à la viralité au détriment de la fiabilité\n• Effet \"infobésité\" : trop d'informations, difficile de trier" }
    ],
    exercises: [
      { q: "Quel est le principal risque de l'instantanéité ?", answer: "diffusion de fausses informations", hint: "Sans temps de vérification", level: 2 }
    ],
    quiz: [
      { q: "L'infobésité désigne...", options: ["Un excès d'informations difficile à trier", "Un manque d'information", "Une censure d'État", "Un type de journal"], correct: 0 }
    ]
  },
  {
    id: 6, title: "Liberté ou contrôle de l'information",
    lessons: [
      { title: "Le débat liberté/contrôle", content: "PARTIE 2 : \"Liberté ou contrôle de l'information : un débat politique fondamental\"\n\nDeux logiques s'opposent :\n\n• LIBERTÉ DE L'INFORMATION : pilier de la démocratie, permet le débat public et le contrôle du pouvoir\n• CONTRÔLE DE L'INFORMATION : censure, propagande, utilisés par les régimes autoritaires mais aussi parfois justifiés par la sécurité nationale\n\nCe débat traverse toute l'histoire contemporaine." }
    ],
    exercises: [
      { q: "Pourquoi la liberté de l'information est-elle essentielle en démocratie ?", answer: "permet le controle du pouvoir", hint: "Contre-pouvoir citoyen", level: 2 }
    ],
    quiz: [
      { q: "Le contrôle de l'information est typique des régimes...", options: ["Autoritaires", "Démocratiques uniquement", "Aucun régime", "Fédéraux uniquement"], correct: 0 }
    ]
  },
  {
    id: 7, title: "L'affaire Dreyfus et la presse",
    lessons: [
      { title: "L'information dépendante de l'opinion ?", content: "L'AFFAIRE DREYFUS (1894-1906) illustre le pouvoir de la presse sur l'opinion publique.\n\nLe capitaine Dreyfus, injustement accusé de trahison, devient l'objet d'une bataille médiatique :\n\n• \"J'accuse...!\" d'Émile Zola (L'Aurore, 1898) mobilise l'opinion en sa faveur\n• La presse se divise entre dreyfusards et antidreyfusards\n• Cette affaire révèle le rôle de la presse dans la fabrique de l'opinion, mais aussi les risques de manipulation (antisémitisme relayé par certains journaux)" }
    ],
    exercises: [
      { q: "Qui écrit \"J'accuse...!\" ?", answer: "emile zola", hint: "Publié dans L'Aurore en 1898", level: 1 },
      { q: "En quelle année éclate l'affaire Dreyfus ?", answer: "1894", hint: "Fin XIXe siècle", level: 2 }
    ],
    quiz: [
      { q: "\"J'accuse...!\" est publié dans...", options: ["L'Aurore", "Le Figaro", "Le Monde", "Libération"], correct: 0 },
      { q: "L'affaire Dreyfus révèle surtout...", options: ["Le pouvoir de la presse sur l'opinion", "L'absence de presse à l'époque", "La censure totale", "L'inexistence des journaux"], correct: 0 }
    ]
  },
  {
    id: 8, title: "Information : marché et État",
    lessons: [
      { title: "Histoire de l'Agence Havas et de l'AFP", content: "L'information est aussi un ENJEU ÉCONOMIQUE et étatique.\n\nL'Agence HAVAS (fondée en 1835) est la première agence de presse mondiale, ancêtre de l'AFP (Agence France-Presse, créée en 1944).\n\nCes agences fournissent l'information \"en gros\" aux journaux : elles occupent une position stratégique entre le MARCHÉ (modèle économique) et l'ÉTAT (financement public partiel de l'AFP)." }
    ],
    exercises: [
      { q: "Quelle agence est l'ancêtre de l'AFP ?", answer: "havas", hint: "Fondée en 1835", level: 2 },
      { q: "En quelle année l'AFP est-elle créée ?", answer: "1944", hint: "À la Libération", level: 2 }
    ],
    quiz: [
      { q: "L'AFP est créée en...", options: ["1944", "1835", "1991", "1969"], correct: 0 }
    ]
  },
  {
    id: 9, title: "Information et propagande en temps de guerre",
    lessons: [
      { title: "Les médias et la guerre du Vietnam", content: "La guerre du Vietnam (1955-1975) est un cas d'école : c'est la première guerre \"télévisée\" en direct dans les foyers américains.\n\nLes images choquantes (massacre de Mỹ Lai, photo de la \"fillette au napalm\") influencent l'opinion publique et contribuent au mouvement anti-guerre.\n\nCela pousse les gouvernements à mieux CONTRÔLER l'accès des médias aux zones de conflit dans les guerres suivantes (embedded journalism)." }
    ],
    exercises: [
      { q: "Quelle guerre est la première \"télévisée\" en direct ?", answer: "guerre du vietnam", hint: "1955-1975", level: 2 }
    ],
    quiz: [
      { q: "La guerre du Vietnam est diffusée...", options: ["En direct à la télévision", "Uniquement à la radio", "Jamais montrée", "Seulement dans la presse écrite"], correct: 0 }
    ]
  }
];

const LEVELS = { 1: { label: "Facile", c: "#22c55e" }, 2: { label: "Moyen", c: "#f59e0b" }, 3: { label: "Difficile", c: "#ef4444" } };

export default function HggspPage() {
  useEffect(() => {
    let seconds = 0;
    const flush = () => {
      if (seconds > 0) {
        const today = new Date().toISOString().split("T")[0];
        supabase.from("time_log").insert({ event_date: today, matiere: "HG", seconds, ts: Date.now() }).then(() => {}, () => {});
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
  const [prog, setProg] = useState(() => { try { const s = typeof window!=="undefined" && localStorage.getItem("hggspp"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const save = (p) => { setProg(p); try { localStorage.setItem("hggspp", JSON.stringify(p)); } catch {} };
  const mark = (id, t) => { if (!prog[`${id}_${t}`]) { save({ ...prog, [`${id}_${t}`]: true }); logActivity("HG"); } };
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
          <div style={{ fontSize:24, fontWeight:800 }}>🌍 Prof de HGGSP IA</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Séq.1 — S'informer : regard critique sur l'info</div>
        </div>
      </div>
      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontWeight:700 }}>Progression</span><span style={{ color:"#fbbf24", fontWeight:700 }}>{pct}%</span></div>
        <div style={{ height:10, background:"#334155", borderRadius:5, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#f59e0b,#fbbf24)", borderRadius:5, transition:"width .5s" }} /></div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:6 }}>{cnt}/{total} complétés</div>
      </div>
      {SEANCES.map((x, i) => { const d = [done(x.id,"lessons"), done(x.id,"exercises"), done(x.id,"quiz")]; const c = d.filter(Boolean).length; return (
        <div key={x.id} onClick={() => { setSi(i); setView("s"); setTab("cours"); setLi(0); }}
          style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10, cursor:"pointer", borderLeft:`4px solid ${c===3?"#22c55e":c>0?"#f59e0b":"#334155"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:12, color:"#fbbf24", fontWeight:600 }}>Séance {x.id}</div><div style={{ fontWeight:700, fontSize:15 }}>{x.title}</div></div>
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
        <div><div style={{ fontSize:12, color:"#fbbf24" }}>Séance {s.id}</div><div style={{ fontWeight:700, fontSize:16 }}>{s.title}</div></div>
      </div>
      <div style={{ display:"flex", padding:"12px 16px", gap:0 }}>
        {[["cours","📖 Cours"],["exercices","✏️ Exos"],["quiz","🧪 Quiz"]].map(([k,l]) => (
          <div key={k} onClick={() => setTab(k)} style={{ flex:1, textAlign:"center", padding:"10px 0", borderRadius:10, background:tab===k?"#f59e0b":"transparent", color:tab===k?"#fff":"#94a3b8", fontWeight:600, fontSize:13, cursor:"pointer" }}>
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
      {s.lessons.map((x,i) => <div key={i} onClick={() => setLi(i)} style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:i===li?"#f59e0b":dn.includes(i)?"rgba(34,197,94,.15)":"#1e293b", color:i===li?"#fff":dn.includes(i)?"#22c55e":"#94a3b8" }}>{i+1}. {x.title}</div>)}
    </div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18, borderLeft:"4px solid #f59e0b" }}>
      <div style={{ fontSize:16, fontWeight:700, marginBottom:10, color:"#fbbf24" }}>{l.title}</div>
      <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, lineHeight:1.7, margin:0, color:"#e2e8f0" }}>{l.content}</pre>
    </div>
    <AiChat ctx={`Séance ${s.id}: ${s.title} — ${l.title}`} txt={l.content} />
    <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
      <button onClick={() => li>0&&setLi(li-1)} disabled={li===0} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#1e293b", color:"#e2e8f0", fontWeight:600, cursor:li===0?"not-allowed":"pointer", opacity:li===0?.5:1 }}>← Précédent</button>
      <button onClick={next} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#f59e0b", color:"#fff", fontWeight:600, cursor:"pointer" }}>{li<s.lessons.length-1?"Suivant →":"Terminé ✓"}</button>
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
        body: JSON.stringify({ type:"reexplique", matiere:"HGGSP", section:s.title, cours:ex.q, question:ex.q, reponse:ans[gi]||"" }) });
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
      {[0,1,2,3].map(l => <div key={l} onClick={() => setFl(l)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:fl===l?(l===0?"#f59e0b":LEVELS[l]?.c):"#1e293b", color:fl===l?"#fff":"#94a3b8" }}>{l===0?"Tous":LEVELS[l].label}</div>)}
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
          <button onClick={() => { const ok=checkAnswer(ans[gi]||"", ex.answer); setRes({...res,[gi]:ok}); if(!ok) { logDifficulty("HGGSP", s.title, ex.q, ans[gi]||"(vide)", ex.answer, ex.hint); fetch("/api/ai/corriger", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ type:"erreur_analyse", matiere:"HGGSP", question:ex.q, reponse:ans[gi]||"(vide)", exercices:ex.answer }) }).then(r=>r.json()).then(d=>{ if(d.reply) setErrMsgs(m=>({...m,[gi]:d.reply})); }).catch(()=>{}); } supabase.from("attempts_log").insert({ event_date:new Date().toISOString().split("T")[0], matiere:"HG", seance:s.title, type:"exercice", identifier:ex.q, correct:ok, ts:Date.now() }).then(()=>{},()=>{}); }}
            style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#f59e0b", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Vérifier</button>
          {r===false && <button onClick={() => alert("💡 "+ex.hint)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#d97706", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Indice</button>}
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
  const nxt = () => { if(qi<s.quiz.length-1){ setQi(qi+1); setSel(null); setSh(false); } else { setFin(true); const finalScore = sc+(sel===q.correct?1:0); if(finalScore>=Math.ceil(s.quiz.length*.6)) mark(s.id,"quiz"); const wrong = s.quiz.filter((qq,idx) => idx<=qi && !(idx===qi?sel===qq.correct:true)).map(qq=>qq.q); logQuizResult("HGGSP", s.title, finalScore, s.quiz.length, wrong);  supabase.from("attempts_log").insert({ event_date:new Date().toISOString().split("T")[0], matiere:"HG", seance:s.title, type:"quiz", identifier:s.title, correct:finalScore>=Math.ceil(s.quiz.length*.6), score:finalScore, total:s.quiz.length, ts:Date.now() }).then(()=>{},()=>{}); } };
  const rst = () => { setQi(0); setSel(null); setSc(0); setFin(false); setSh(false); };
  if(fin) return (<div style={{ background:"#1e293b", borderRadius:14, padding:24, textAlign:"center" }}>
    <div style={{ fontSize:48, marginBottom:10 }}>{sc>=Math.ceil(s.quiz.length*.6)?"🎉":"📚"}</div>
    <div style={{ fontSize:22, fontWeight:800 }}>{sc}/{s.quiz.length}</div>
    <div style={{ color:sc>=Math.ceil(s.quiz.length*.6)?"#22c55e":"#f59e0b", fontWeight:600, marginTop:4 }}>{sc>=Math.ceil(s.quiz.length*.6)?"Bravo ! Quiz réussi !":"Continue à réviser !"}</div>
    <button onClick={rst} style={{ marginTop:16, padding:"10px 18px", borderRadius:10, border:"none", background:"#f59e0b", color:"#fff", fontWeight:600, cursor:"pointer" }}>Recommencer</button>
  </div>);
  return (<div>
    <div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>Question {qi+1}/{s.quiz.length}</div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18 }}>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>{q.q}</div>
      {q.options.map((o,i) => { let bg="#0f172a",bd="#334155",cl="#e2e8f0"; if(sh){ if(i===q.correct){bg="rgba(34,197,94,.15)";bd="#22c55e";cl="#22c55e";} else if(i===sel){bg="rgba(239,68,68,.15)";bd="#ef4444";cl="#ef4444";} } else if(i===sel){bg="rgba(245,158,11,.15)";bd="#f59e0b";} return (
        <div key={i} onClick={()=>chk(i)} style={{ padding:12, borderRadius:10, border:`2px solid ${bd}`, background:bg, color:cl, marginBottom:8, cursor:sh?"default":"pointer", fontWeight:500, fontSize:14 }}>{o}</div>
      ); })}
      {sh && <button onClick={nxt} style={{ marginTop:12, padding:"10px 18px", borderRadius:10, border:"none", background:"#f59e0b", color:"#fff", fontWeight:600, cursor:"pointer" }}>{qi<s.quiz.length-1?"Suivante →":"Voir le score"}</button>}
    </div>
  </div>);
}

function AiChat({ ctx, txt }) {
  const storageKey = "profIA_Hggsp_" + ctx;
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
        body: JSON.stringify({ type:"aide", question:u, reponse:u, section:ctx, cours:txt, matiere:"HGGSP", history:newMsgs.slice(0,-1) }) });
      const d = await r.json();
      const final2 = [...newMsgs,{r:"ai",t:d.reply||"Erreur."}]; setMsgs(final2); save(final2);
    } catch { const final2 = [...newMsgs,{r:"ai",t:"Erreur de connexion."}]; setMsgs(final2); save(final2); }
    setLd(false);
  };
  const clearHistory = () => { setMsgs([]); localStorage.removeItem(storageKey); };
  if(!open) return <div onClick={()=>setOpen(true)} style={{ background:"linear-gradient(135deg,#f59e0b,#fbbf24)", padding:14, borderRadius:12, textAlign:"center", cursor:"pointer", marginTop:16, fontWeight:700, fontSize:14, color:"#fff" }}>{msgs.length > 0 ? "🤖 Prof IA (conversation en cours)" : "🤖 Je suis bloqué — Prof IA"}</div>;
  return (<div style={{ background:"#1e293b", borderRadius:14, padding:18, marginTop:16, border:"2px solid #f59e0b" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontWeight:700, color:"#fbbf24" }}>🤖 Prof de HGGSP IA</span><div style={{ display:"flex", gap:10, alignItems:"center" }}>{msgs.length>0 && <span onClick={clearHistory} style={{ cursor:"pointer", fontSize:11, color:"#f87171" }}>Effacer</span>}<span onClick={()=>setOpen(false)} style={{ cursor:"pointer", color:"#94a3b8" }}>✕</span></div></div>
    <div ref={ref} style={{ maxHeight:250, overflowY:"auto", marginBottom:10 }}>
      {msgs.length===0 && <div style={{ fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>Pose ta question...</div>}
      {msgs.map((m,i) => <div key={i} style={{ marginBottom:8, padding:10, borderRadius:10, background:m.r==="user"?"rgba(245,158,11,.15)":"rgba(34,197,94,.1)", borderLeft:`3px solid ${m.r==="user"?"#f59e0b":"#22c55e"}` }}>
        <div style={{ fontSize:11, fontWeight:600, color:m.r==="user"?"#fbbf24":"#22c55e", marginBottom:3 }}>{m.r==="user"?"Toi":"Prof IA"}</div>
        <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{m.t}</div>
      </div>)}
      {ld && <div style={{ fontSize:13, color:"#94a3b8" }}>Le prof réfléchit...</div>}
    </div>
    <div style={{ display:"flex", gap:8 }}>
      <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ta question..." style={{ flex:1, padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
      <button onClick={ask} disabled={ld} style={{ padding:"10px 16px", borderRadius:10, border:"none", background:"#f59e0b", color:"#fff", fontWeight:600, cursor:ld?"not-allowed":"pointer" }}>↑</button>
    </div>
  </div>);
}
