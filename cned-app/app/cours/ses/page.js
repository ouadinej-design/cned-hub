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
    id: 1, title: "Le marché, une institution",
    lessons: [
      { title: "Qu'est-ce qu'un marché ?", content: "Un marché est un lieu (réel ou virtuel) de rencontre entre une offre et une demande, permettant la fixation d'un prix et l'échange d'un bien ou service.\n\nLe marché est une INSTITUTION : il repose sur des règles (propriété privée, droit des contrats, monnaie) qui permettent l'échange en confiance.\n\nSans institutions solides, pas d'échange marchand fiable." },
      { title: "Les acteurs du marché", content: "Sur un marché se rencontrent :\n\n• Les OFFREURS (producteurs/vendeurs) qui proposent un bien ou service\n• Les DEMANDEURS (consommateurs/acheteurs) qui souhaitent l'acquérir\n\nLeur rencontre détermine :\n• Le PRIX d'équilibre\n• La QUANTITÉ échangée" },
      { title: "Types de marchés", content: "On distingue plusieurs types de marchés selon le degré de concurrence :\n\n• Concurrence pure et parfaite : nombreux offreurs/demandeurs, produit homogène, libre entrée\n• Monopole : un seul offreur\n• Oligopole : quelques offreurs\n• Concurrence monopolistique : produits différenciés" }
    ],
    exercises: [
      { q: "Qu'est-ce qu'un offreur sur un marché ?", answer: "un vendeur ou producteur", hint: "Celui qui propose le bien ou service", level: 1 },
      { q: "Le marché est qualifié d'... par les économistes", answer: "institution", hint: "Il repose sur des règles", level: 1 },
      { q: "Citer 2 conditions de la concurrence pure et parfaite", answer: "atomicite,homogeneite,libre entree,libre sortie,transparence,mobilite", hint: "Nombreux acteurs, produit identique...", level: 2 }
    ],
    quiz: [
      { q: "Le marché fait se rencontrer...", options: ["Offre et demande", "Producteurs seulement", "État et entreprises", "Banques et ménages"], correct: 0 },
      { q: "Un monopole = ...", options: ["Un seul offreur", "Deux offreurs", "De nombreux offreurs", "Aucun offreur"], correct: 0 },
      { q: "Le marché repose sur...", options: ["Des institutions (droit, monnaie)", "Le hasard", "L'État uniquement", "Aucune règle"], correct: 0 }
    ]
  },
  {
    id: 2, title: "Offre, demande et équilibre",
    lessons: [
      { title: "La courbe de demande", content: "La DEMANDE est la quantité d'un bien que les consommateurs sont prêts à acheter à un prix donné.\n\nLoi de la demande : quand le prix augmente, la quantité demandée diminue (toutes choses égales par ailleurs).\n\nLa courbe de demande est DÉCROISSANTE : elle va de haut-gauche à bas-droite dans le repère (Prix, Quantité)." },
      { title: "La courbe d'offre", content: "L'OFFRE est la quantité qu'un producteur est prêt à vendre à un prix donné.\n\nLoi de l'offre : quand le prix augmente, la quantité offerte augmente (incitation à produire plus).\n\nLa courbe d'offre est CROISSANTE." },
      { title: "L'équilibre de marché", content: "Le PRIX D'ÉQUILIBRE est le prix pour lequel la quantité offerte = quantité demandée.\n\nGraphiquement : c'est le point d'intersection des courbes d'offre et de demande.\n\n• Si prix > prix d'équilibre → offre excédentaire → prix baisse\n• Si prix < prix d'équilibre → demande excédentaire → prix monte\n\nLe marché tend naturellement vers l'équilibre." },
      { title: "Déplacements des courbes", content: "Un changement du PRIX du bien = déplacement le LONG de la courbe.\n\nUn changement d'un AUTRE facteur (revenu, goûts, prix des biens liés, coûts de production) = DÉPLACEMENT de la courbe elle-même.\n\nEx : hausse du revenu → la courbe de demande se déplace vers la droite (plus de demande à chaque prix)." }
    ],
    exercises: [
      { q: "La courbe de demande est... par rapport au prix", answer: "decroissante", hint: "Plus le prix augmente, moins on demande", level: 1 },
      { q: "Au prix d'équilibre, offre et demande sont...", answer: "egales", hint: "C'est le point de rencontre", level: 1 },
      { q: "Une hausse du revenu déplace la courbe de demande vers...", answer: "la droite", hint: "Plus de pouvoir d'achat = plus de demande", level: 2 }
    ],
    quiz: [
      { q: "La courbe d'offre est...", options: ["Croissante", "Décroissante", "Constante", "Verticale"], correct: 0 },
      { q: "Si le prix est au-dessus de l'équilibre, il y a...", options: ["Excédent d'offre", "Excédent de demande", "Équilibre", "Pénurie"], correct: 0 },
      { q: "Le prix d'équilibre correspond à...", options: ["L'intersection offre/demande", "Le prix le plus bas", "Le prix le plus haut", "Le prix fixé par l'État"], correct: 0 }
    ]
  },
  {
    id: 3, title: "Les avantages de l'échange marchand",
    lessons: [
      { title: "Le surplus du consommateur", content: "Le SURPLUS DU CONSOMMATEUR = différence entre ce que le consommateur était prêt à payer et ce qu'il paie réellement.\n\nC'est un gain de bien-être pour l'acheteur.\n\nGraphiquement : aire sous la courbe de demande et au-dessus du prix d'équilibre." },
      { title: "Le surplus du producteur", content: "Le SURPLUS DU PRODUCTEUR = différence entre le prix reçu et le prix minimum auquel le producteur était prêt à vendre.\n\nC'est un gain de bien-être pour le vendeur.\n\nGraphiquement : aire au-dessus de la courbe d'offre et sous le prix d'équilibre." },
      { title: "Les gains à l'échange", content: "L'échange marchand génère des GAINS MUTUELS : chaque partie y trouve un avantage, sinon l'échange n'aurait pas lieu.\n\nSurplus total = surplus consommateur + surplus producteur.\n\nÀ l'équilibre concurrentiel, ce surplus total est MAXIMISÉ : c'est l'argument économique en faveur du marché." }
    ],
    exercises: [
      { q: "Le surplus du consommateur mesure...", answer: "le gain du consommateur", hint: "Différence entre prix max accepté et prix payé", level: 1 },
      { q: "À l'équilibre, le surplus total est...", answer: "maximise", hint: "C'est optimal pour la collectivité", level: 2 }
    ],
    quiz: [
      { q: "Le surplus du producteur = ...", options: ["Prix reçu − prix minimum accepté", "Prix payé par le client", "Coût total de production", "Bénéfice net"], correct: 0 },
      { q: "L'échange marchand est mutuellement avantageux car...", options: ["Chaque partie y gagne", "L'État l'impose", "Le prix est fixe", "Il n'y a pas de perdant possible ailleurs"], correct: 0 }
    ]
  },
  {
    id: 4, title: "Sources du pouvoir de marché",
    lessons: [
      { title: "Qu'est-ce que le pouvoir de marché ?", content: "Le POUVOIR DE MARCHÉ désigne la capacité d'une entreprise à influencer le prix, contrairement à la concurrence pure où chaque acteur est \"price taker\" (preneur de prix).\n\nUne entreprise avec du pouvoir de marché peut fixer un prix supérieur au coût marginal." },
      { title: "Les sources du pouvoir de marché", content: "Plusieurs sources :\n\n• BARRIÈRES À L'ENTRÉE (brevets, coûts fixes élevés)\n• ÉCONOMIES D'ÉCHELLE (avantage de coût pour les grandes entreprises)\n• DIFFÉRENCIATION du produit (marque, image)\n• ENTENTES entre entreprises (accords sur les prix)\n• RESSOURCE RARE détenue exclusivement" }
    ],
    exercises: [
      { q: "Une entreprise avec pouvoir de marché est...", answer: "price maker", hint: "Contraire de price taker", level: 2 },
      { q: "Citer une source du pouvoir de marché", answer: "brevet", hint: "Protection légale d'une innovation", level: 1 }
    ],
    quiz: [
      { q: "Le pouvoir de marché permet de...", options: ["Influencer le prix", "Subir le prix", "Ignorer la concurrence toujours", "Fixer les salaires uniquement"], correct: 0 },
      { q: "Un brevet crée...", options: ["Une barrière à l'entrée", "Une baisse des prix", "Plus de concurrents", "Une entente illégale"], correct: 0 }
    ]
  },
  {
    id: 5, title: "Monopoles et oligopoles",
    lessons: [
      { title: "Le monopole", content: "MONOPOLE : un seul offreur face à une multitude de demandeurs.\n\nLe monopoleur fixe un prix supérieur à celui de concurrence pure, et une quantité inférieure → perte de surplus pour la société (perte sèche).\n\nExemples : monopoles naturels (réseaux électriques), monopoles légaux (brevets)." },
      { title: "L'oligopole", content: "OLIGOPOLE : un petit nombre d'offreurs dominent le marché.\n\nLes entreprises sont INTERDÉPENDANTES : la stratégie de l'une affecte les autres.\n\nDeux stratégies possibles :\n• Concurrence entre elles (guerre des prix)\n• ENTENTE (cartel) pour maximiser le profit commun — souvent illégale" }
    ],
    exercises: [
      { q: "Le monopole fixe un prix... par rapport à la concurrence pure", answer: "superieur", hint: "Il profite de l'absence de concurrents", level: 1 },
      { q: "Une entente entre entreprises d'un oligopole s'appelle un...", answer: "cartel", hint: "Accord souvent illégal sur les prix", level: 2 }
    ],
    quiz: [
      { q: "Un oligopole compte...", options: ["Peu d'offreurs", "Un seul offreur", "De nombreux offreurs", "Aucun offreur"], correct: 0 },
      { q: "Le monopole génère une perte de...", options: ["Surplus pour la société", "Profit pour l'entreprise", "Concurrents", "Demande"], correct: 0 }
    ]
  },
  {
    id: 6, title: "La régulation de la concurrence",
    lessons: [
      { title: "Pourquoi réguler ?", content: "Les pouvoirs publics interviennent pour PROTÉGER LA CONCURRENCE car un marché non régulé peut voir apparaître :\n\n• Des ententes entre entreprises\n• Des abus de position dominante\n• Des concentrations excessives (fusions)\n\nCela nuit aux consommateurs (prix plus élevés, moins de choix)." },
      { title: "Les outils de régulation", content: "En France et en Europe :\n\n• L'Autorité de la concurrence (France) et la Commission européenne sanctionnent les ententes et abus\n• Contrôle des fusions-acquisitions\n• Droit de la concurrence (interdiction des pratiques anticoncurrentielles)\n\nObjectif : maintenir un marché où les prix reflètent une réelle concurrence." }
    ],
    exercises: [
      { q: "Qui sanctionne les ententes en France ?", answer: "autorite de la concurrence", hint: "Institution dédiée à la régulation", level: 1 },
      { q: "Pourquoi réguler la concurrence ?", answer: "proteger les consommateurs", hint: "Éviter prix élevés et abus", level: 2 }
    ],
    quiz: [
      { q: "L'Autorité de la concurrence sanctionne...", options: ["Les ententes illégales", "Les petites entreprises uniquement", "Les consommateurs", "Les syndicats"], correct: 0 },
      { q: "La régulation vise à protéger...", options: ["Les consommateurs", "Les monopoles", "Les cartels", "Les barrières à l'entrée"], correct: 0 }
    ]
  },
  {
    id: 7, title: "Les défaillances de marché : externalités",
    lessons: [
      { title: "Qu'est-ce qu'une externalité ?", content: "Une EXTERNALITÉ existe quand l'action d'un agent économique affecte le bien-être d'un autre agent SANS compensation monétaire.\n\n• Externalité NÉGATIVE : pollution d'une usine qui nuit aux riverains\n• Externalité POSITIVE : formation d'un salarié qui bénéficie aussi à la société\n\nLe marché ne prend pas en compte ces effets → défaillance de marché." },
      { title: "Corriger les externalités", content: "Solutions pour internaliser les externalités :\n\n• TAXE (ex : taxe carbone) pour les externalités négatives\n• SUBVENTION pour encourager les externalités positives\n• NORMES environnementales\n• MARCHÉ DE QUOTAS (ex : quotas carbone échangeables)\n\nObjectif : faire payer le \"vrai\" coût social." }
    ],
    exercises: [
      { q: "La pollution est un exemple d'externalité...", answer: "negative", hint: "Elle nuit à des tiers", level: 1 },
      { q: "Quel outil pour corriger une externalité négative ?", answer: "taxe", hint: "Faire payer le coût social", level: 1 }
    ],
    quiz: [
      { q: "Une externalité positive...", options: ["Bénéficie à un tiers sans compensation", "Coûte à un tiers", "N'existe pas en pratique", "Est toujours taxée"], correct: 0 },
      { q: "La taxe carbone corrige...", options: ["Une externalité négative", "Une externalité positive", "Un monopole", "Une entente"], correct: 0 }
    ]
  },
  {
    id: 8, title: "Biens collectifs et asymétries d'information",
    lessons: [
      { title: "Les biens collectifs", content: "Un BIEN COLLECTIF (bien public) a 2 caractéristiques :\n\n• NON-RIVALITÉ : ma consommation ne réduit pas celle des autres\n• NON-EXCLUABILITÉ : impossible d'empêcher quelqu'un d'en profiter\n\nEx : éclairage public, défense nationale, phare maritime.\n\nProblème du \"passager clandestin\" : chacun profite sans vouloir payer → le marché seul ne peut pas produire ces biens efficacement, d'où l'intervention de l'État." },
      { title: "Les asymétries d'information", content: "ASYMÉTRIE D'INFORMATION : une partie de l'échange en sait plus que l'autre.\n\nDeux problèmes :\n• SÉLECTION ADVERSE (avant l'échange) : ex. sur le marché de l'occasion, le vendeur connaît mieux l'état du véhicule\n• ALÉA MORAL (après l'échange) : ex. un assuré prend plus de risques une fois assuré\n\nCes asymétries peuvent faire disparaître certains marchés (marché des \"lemons\")." }
    ],
    exercises: [
      { q: "Un bien non-rival et non-exclusif est un bien...", answer: "collectif", hint: "Aussi appelé bien public", level: 1 },
      { q: "Le fait de prendre plus de risques une fois assuré s'appelle...", answer: "alea moral", hint: "Se produit après la signature du contrat", level: 2 }
    ],
    quiz: [
      { q: "Un bien collectif est...", options: ["Non-rival et non-exclusif", "Rival et exclusif", "Toujours gratuit", "Produit par l'État uniquement"], correct: 0 },
      { q: "La sélection adverse se produit...", options: ["Avant l'échange", "Après l'échange", "Jamais sur un marché", "Seulement dans l'assurance"], correct: 0 }
    ]
  },
  {
    id: 9, title: "Synthèse : le marché et ses limites",
    lessons: [
      { title: "Bilan du chapitre", content: "Le marché est un mécanisme efficace de coordination QUAND :\n• La concurrence est réelle (pas de pouvoir de marché excessif)\n• Il n'y a pas d'externalités importantes\n• L'information est symétrique\n• Les biens sont rivaux et exclusifs\n\nQuand ces conditions ne sont pas réunies → DÉFAILLANCE DE MARCHÉ → intervention des pouvoirs publics justifiée." },
      { title: "Méthode : la dissertation SES", content: "Structure d'une dissertation SES :\n1. Accroche + définition des termes du sujet\n2. Problématique\n3. Annonce du plan\n4. Développement en 2-3 parties avec AEI (Affirmation-Explication-Illustration)\n5. Mobiliser des données chiffrées et des exemples précis\n6. Conclusion avec réponse à la problématique + ouverture" }
    ],
    exercises: [
      { q: "Citer une condition d'efficacité du marché", answer: "concurrence reelle", hint: "Pas de pouvoir de marché excessif", level: 2 },
      { q: "Que signifie AEI en méthode de dissertation ?", answer: "affirmation explication illustration", hint: "Structure d'un paragraphe argumenté", level: 1 }
    ],
    quiz: [
      { q: "Une défaillance de marché justifie...", options: ["L'intervention publique", "La suppression du marché", "Plus de concurrence toujours", "Rien de particulier"], correct: 0 },
      { q: "AEI signifie...", options: ["Affirmation-Explication-Illustration", "Analyse-Étude-Interprétation", "Argument-Exemple-Idée", "Aucune de ces réponses"], correct: 0 }
    ]
  }
];

const LEVELS = { 1: { label: "Facile", c: "#22c55e" }, 2: { label: "Moyen", c: "#f59e0b" }, 3: { label: "Difficile", c: "#ef4444" } };

export default function SESPage() {
  const [view, setView] = useState("home");
  const [si, setSi] = useState(0);
  const [li, setLi] = useState(0);
  const [tab, setTab] = useState("cours");
  const [prog, setProg] = useState(() => { try { const s = typeof window!=="undefined" && localStorage.getItem("sesp"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const save = (p) => { setProg(p); try { localStorage.setItem("sesp", JSON.stringify(p)); } catch {} };
  const mark = (id, t) => { if (!prog[`${id}_${t}`]) { save({ ...prog, [`${id}_${t}`]: true }); logActivity("SES"); } };
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
          <div style={{ fontSize:24, fontWeight:800 }}>📊 Prof de SES IA</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Séquence 1 — La coordination par le marché</div>
        </div>
      </div>
      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontWeight:700 }}>Progression</span><span style={{ color:"#34d399", fontWeight:700 }}>{pct}%</span></div>
        <div style={{ height:10, background:"#334155", borderRadius:5, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#10b981,#34d399)", borderRadius:5, transition:"width .5s" }} /></div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:6 }}>{cnt}/{total} complétés</div>
      </div>
      {SEANCES.map((x, i) => { const d = [done(x.id,"lessons"), done(x.id,"exercises"), done(x.id,"quiz")]; const c = d.filter(Boolean).length; return (
        <div key={x.id} onClick={() => { setSi(i); setView("s"); setTab("cours"); setLi(0); }}
          style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10, cursor:"pointer", borderLeft:`4px solid ${c===3?"#22c55e":c>0?"#f59e0b":"#334155"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:12, color:"#34d399", fontWeight:600 }}>Séance {x.id}</div><div style={{ fontWeight:700, fontSize:15 }}>{x.title}</div></div>
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
        <div><div style={{ fontSize:12, color:"#34d399" }}>Séance {s.id}</div><div style={{ fontWeight:700, fontSize:16 }}>{s.title}</div></div>
      </div>
      <div style={{ display:"flex", padding:"12px 16px", gap:0 }}>
        {[["cours","📖 Cours"],["exercices","✏️ Exos"],["quiz","🧪 Quiz"]].map(([k,l]) => (
          <div key={k} onClick={() => setTab(k)} style={{ flex:1, textAlign:"center", padding:"10px 0", borderRadius:10, background:tab===k?"#10b981":"transparent", color:tab===k?"#fff":"#94a3b8", fontWeight:600, fontSize:13, cursor:"pointer" }}>
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
      {s.lessons.map((x,i) => <div key={i} onClick={() => setLi(i)} style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:i===li?"#10b981":dn.includes(i)?"rgba(34,197,94,.15)":"#1e293b", color:i===li?"#fff":dn.includes(i)?"#22c55e":"#94a3b8" }}>{i+1}. {x.title}</div>)}
    </div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18, borderLeft:"4px solid #10b981" }}>
      <div style={{ fontSize:16, fontWeight:700, marginBottom:10, color:"#34d399" }}>{l.title}</div>
      <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, lineHeight:1.7, margin:0, color:"#e2e8f0" }}>{l.content}</pre>
    </div>
    <AiChat ctx={`Séance ${s.id}: ${s.title} — ${l.title}`} txt={l.content} />
    <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
      <button onClick={() => li>0&&setLi(li-1)} disabled={li===0} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#1e293b", color:"#e2e8f0", fontWeight:600, cursor:li===0?"not-allowed":"pointer", opacity:li===0?.5:1 }}>← Précédent</button>
      <button onClick={next} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#10b981", color:"#fff", fontWeight:600, cursor:"pointer" }}>{li<s.lessons.length-1?"Suivant →":"Terminé ✓"}</button>
    </div>
  </div>);
}

function Exos({ s, mark }) {
  const [ans, setAns] = useState({});
  const [res, setRes] = useState({});
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
        body: JSON.stringify({ type:"reexplique", matiere:"SES", section:s.title, cours:ex.q, question:ex.q, reponse:ans[gi]||"" }) });
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
      {[0,1,2,3].map(l => <div key={l} onClick={() => setFl(l)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:fl===l?(l===0?"#10b981":LEVELS[l]?.c):"#1e293b", color:fl===l?"#fff":"#94a3b8" }}>{l===0?"Tous":LEVELS[l].label}</div>)}
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
          <button onClick={() => { const a=(ans[gi]||"").toLowerCase().replace(/\s/g,""); const c=ex.answer.toLowerCase().replace(/\s/g,""); const ok=a===c||a.includes(c)||c.includes(a); setRes({...res,[gi]:ok}); if(!ok) logDifficulty("SES", s.title, ex.q, ans[gi]||"(vide)", ex.answer, ex.hint); }}
            style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#10b981", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Vérifier</button>
          {r===false && <button onClick={() => alert("💡 "+ex.hint)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#f59e0b", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Indice</button>}
        {r===false && <button onClick={() => demanderReexplication(gi, ex)} disabled={reexp[gi]?.loading} style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#8b5cf6", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>{reexp[gi]?.loading ? "..." : "🔄 Autre explication"}</button>}
        </div>{r===false && <div style={{ marginTop:8, padding:10, background:"rgba(239,68,68,.1)", borderRadius:8, fontSize:13, color:"#fca5a5" }}>Réponse : {ex.answer}</div>}
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
  const nxt = () => { if(qi<s.quiz.length-1){ setQi(qi+1); setSel(null); setSh(false); } else { setFin(true); const finalScore = sc+(sel===q.correct?1:0); if(finalScore>=Math.ceil(s.quiz.length*.6)) mark(s.id,"quiz"); const wrong = s.quiz.filter((qq,idx) => idx<=qi && !(idx===qi?sel===qq.correct:true)).map(qq=>qq.q); logQuizResult("SES", s.title, finalScore, s.quiz.length, wrong); } };
  const rst = () => { setQi(0); setSel(null); setSc(0); setFin(false); setSh(false); };
  if(fin) return (<div style={{ background:"#1e293b", borderRadius:14, padding:24, textAlign:"center" }}>
    <div style={{ fontSize:48, marginBottom:10 }}>{sc>=Math.ceil(s.quiz.length*.6)?"🎉":"📚"}</div>
    <div style={{ fontSize:22, fontWeight:800 }}>{sc}/{s.quiz.length}</div>
    <div style={{ color:sc>=Math.ceil(s.quiz.length*.6)?"#22c55e":"#f59e0b", fontWeight:600, marginTop:4 }}>{sc>=Math.ceil(s.quiz.length*.6)?"Bravo ! Quiz réussi !":"Continue à réviser !"}</div>
    <button onClick={rst} style={{ marginTop:16, padding:"10px 18px", borderRadius:10, border:"none", background:"#10b981", color:"#fff", fontWeight:600, cursor:"pointer" }}>Recommencer</button>
  </div>);
  return (<div>
    <div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>Question {qi+1}/{s.quiz.length}</div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18 }}>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>{q.q}</div>
      {q.options.map((o,i) => { let bg="#0f172a",bd="#334155",cl="#e2e8f0"; if(sh){ if(i===q.correct){bg="rgba(34,197,94,.15)";bd="#22c55e";cl="#22c55e";} else if(i===sel){bg="rgba(239,68,68,.15)";bd="#ef4444";cl="#ef4444";} } else if(i===sel){bg="rgba(16,185,129,.15)";bd="#10b981";} return (
        <div key={i} onClick={()=>chk(i)} style={{ padding:12, borderRadius:10, border:`2px solid ${bd}`, background:bg, color:cl, marginBottom:8, cursor:sh?"default":"pointer", fontWeight:500, fontSize:14 }}>{o}</div>
      ); })}
      {sh && <button onClick={nxt} style={{ marginTop:12, padding:"10px 18px", borderRadius:10, border:"none", background:"#10b981", color:"#fff", fontWeight:600, cursor:"pointer" }}>{qi<s.quiz.length-1?"Suivante →":"Voir le score"}</button>}
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
        body: JSON.stringify({ type:"aide", question:u, reponse:u, section:ctx, cours:txt, matiere:"SES" }) });
      const d = await r.json();
      setMsgs(m=>[...m,{r:"ai",t:d.reply||"Erreur."}]);
    } catch { setMsgs(m=>[...m,{r:"ai",t:"Erreur de connexion."}]); }
    setLd(false);
  };
  if(!open) return <div onClick={()=>setOpen(true)} style={{ background:"linear-gradient(135deg,#10b981,#34d399)", padding:14, borderRadius:12, textAlign:"center", cursor:"pointer", marginTop:16, fontWeight:700, fontSize:14, color:"#fff" }}>🤖 Je suis bloqué — Prof IA</div>;
  return (<div style={{ background:"#1e293b", borderRadius:14, padding:18, marginTop:16, border:"2px solid #10b981" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontWeight:700, color:"#34d399" }}>🤖 Prof de SES IA</span><span onClick={()=>{setOpen(false);setMsgs([]);}} style={{ cursor:"pointer", color:"#94a3b8" }}>✕</span></div>
    <div ref={ref} style={{ maxHeight:250, overflowY:"auto", marginBottom:10 }}>
      {msgs.length===0 && <div style={{ fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>Pose ta question...</div>}
      {msgs.map((m,i) => <div key={i} style={{ marginBottom:8, padding:10, borderRadius:10, background:m.r==="user"?"rgba(16,185,129,.15)":"rgba(34,197,94,.1)", borderLeft:`3px solid ${m.r==="user"?"#10b981":"#22c55e"}` }}>
        <div style={{ fontSize:11, fontWeight:600, color:m.r==="user"?"#34d399":"#22c55e", marginBottom:3 }}>{m.r==="user"?"Toi":"Prof IA"}</div>
        <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{m.t}</div>
      </div>)}
      {ld && <div style={{ fontSize:13, color:"#94a3b8" }}>Le prof réfléchit...</div>}
    </div>
    <div style={{ display:"flex", gap:8 }}>
      <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ta question..." style={{ flex:1, padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
      <button onClick={ask} disabled={ld} style={{ padding:"10px 16px", borderRadius:10, border:"none", background:"#10b981", color:"#fff", fontWeight:600, cursor:ld?"not-allowed":"pointer" }}>↑</button>
    </div>
  </div>);
}
