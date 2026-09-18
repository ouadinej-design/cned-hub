"use client";
import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// ÉPREUVE FRANÇAIS — QCM + Analyse (auto-corrigé)
// Basé sur Séances 1-9 : Rimbaud, Les Cahiers de Douai
// ═══════════════════════════════════════════════════════════
const FR_EPREUVE = {
  title: "Épreuve Français — Rimbaud, Les Cahiers de Douai",
  duree: 45 * 60,
  parts: [
    { label: "Partie 1 — Connaissances", pts: 16 },
    { label: "Partie 2 — Analyse de texte", pts: 14 },
    { label: "Partie 3 — Grammaire", pts: 10 },
  ],
  questions: [
    // ── PARTIE 1 : CONNAISSANCES (16 pts) ──
    { id:1, q:"En quelle année Rimbaud écrit-il Les Cahiers de Douai ?", type:"qcm", opts:["1854","1870","1871","1885"], correct:1, pts:1, part:0,
      expl:"1870. Rimbaud a 16 ans. Il fugue deux fois et confie 22 poèmes à Paul Demeny." },
    { id:2, q:"Combien de poèmes contiennent Les Cahiers de Douai ?", type:"qcm", opts:["14","15","22","30"], correct:2, pts:1, part:0,
      expl:"22 poèmes : 15 dans le 1er cahier (sept. 1870) + 7 dans le 2nd (oct. 1870)." },
    { id:3, q:"Le parcours associé au programme est :", type:"qcm", opts:["Émancipations créatrices","Le mal du siècle","La quête de soi","Les fleurs du mal"], correct:0, pts:1, part:0,
      expl:"Émancipations créatrices. Rimbaud s'émancipe de la famille, l'école, les formes classiques." },
    { id:4, q:"Un sonnet comprend :", type:"qcm", opts:["12 vers en 3 quatrains","14 vers : 2 quatrains + 2 tercets","16 vers en 4 quatrains","10 vers en 2 quintils"], correct:1, pts:1, part:0,
      expl:"14 vers : 2 quatrains (4+4) + 2 tercets (3+3), en alexandrins." },
    { id:5, q:"« Vénus Anadyomène » signifie :", type:"qcm", opts:["Vénus endormie","Vénus victorieuse","Vénus au miroir","Vénus sortant des eaux"], correct:3, pts:1, part:0,
      expl:"Vénus sortant des eaux — du grec « anadyomène ». Dans le mythe, Vénus naît de l'écume." },
    { id:6, q:"Le poème Vénus Anadyomène est un :", type:"qcm", opts:["Blason","Élégie","Contre-blason","Ode"], correct:2, pts:1, part:0,
      expl:"Contre-blason : le blason fait l'éloge du corps, le contre-blason inverse tout." },
    { id:7, q:"Dans Le Dormeur du val, le dernier vers révèle :", type:"qcm", opts:["Le soldat est mort","Le soldat se réveille","La guerre est finie","La nature est hostile"], correct:0, pts:1, part:0,
      expl:"« Il a deux trous rouges au côté droit » — le soldat est mort. Dénonciation de la guerre." },
    { id:8, q:"Le premier vers de Ma Bohème est :", type:"qcm", opts:["« Comme d'un cercueil vert en fer-blanc, une tête »","« Je m'en allais, les poings dans mes poches crevées »","« C'est un trou de verdure où chante une rivière »","« Belle hideusement d'un ulcère à l'anus »"], correct:1, pts:1, part:0,
      expl:"« Je m'en allais, les poings dans mes poches crevées » — le poète-vagabond." },
    { id:9, q:"À qui Rimbaud confie-t-il ses poèmes ?", type:"text", answer:"paul demeny", pts:1, part:0,
      expl:"Paul Demeny, son professeur de lettres, à Douai." },
    { id:10, q:"Comment appelle-t-on « belle hideusement » ?", type:"text", answer:"oxymore", pts:1, part:0,
      expl:"Un oxymore : deux termes contradictoires (beau + hideux). Procédé central de Vénus Anadyomène." },
    { id:11, q:"Quel procédé oppose nature vivante / soldat mort dans Le Dormeur du val ?", type:"text", answer:"antithese", pts:1, part:0,
      expl:"L'antithèse : opposition entre la nature lumineuse et le soldat mort." },
    { id:12, q:"Combien de syllabes dans un alexandrin ?", type:"text", answer:"12", pts:1, part:0,
      expl:"12 syllabes. Le vers noble de la poésie française classique." },
    { id:13, q:"Méthode O-C-E : que signifient les 3 lettres ?", type:"text", answer:"observation conceptualisation effet", pts:2, part:0,
      expl:"O = Observation (relever le procédé), C = Conceptualisation (le nommer), E = Effet (sur le lecteur)." },
    { id:14, q:"« Parce que » introduit une sub. circonstancielle de…", type:"text", answer:"cause", pts:1, part:0,
      expl:"Cause. « Parce que », « puisque », « comme » + indicatif = cause." },
    { id:15, q:"« Bien que » est suivi du mode…", type:"qcm", opts:["Indicatif","Conditionnel","Subjonctif","Impératif"], correct:2, pts:1, part:0,
      expl:"Subjonctif. « Bien que » = concession, toujours suivi du subjonctif." },

    // ── PARTIE 2 : ANALYSE (14 pts) ──
    { id:16, q:"v.1 « Comme d'un cercueil vert » — identifie la figure de style.", type:"text", answer:"comparaison", pts:2, part:1,
      ctx:"« Comme d'un cercueil vert en fer-blanc, une tête\nDe femme à cheveux bruns fortement pommadés\nD'une vieille baignoire émerge, lente et bête,\nAvec des déficits assez mal ravaudés ; »",
      expl:"Comparaison (mot « comme »). Rapprochement dégradant : la baignoire = cercueil → beauté associée à la mort." },
    { id:17, q:"v.1-2 « une tête / De femme » — quel procédé quand un mot est repoussé au vers suivant ?", type:"text", answer:"rejet", pts:2, part:1,
      expl:"Un rejet (ou enjambement). Crée un suspense : on attend de savoir de quoi il s'agit." },
    { id:18, q:"Applique O-C-E à « lente et bête » (v.3). (O = ce que tu observes, C = nom du procédé, E = effet)", type:"open", pts:3, part:1,
      expl:"O : Deux adjectifs péjoratifs, rythme binaire.\nC : Accumulation d'adjectifs péjoratifs.\nE : Ridiculise Vénus — au lieu d'être gracieuse, elle est lente et stupide." },
    { id:19, q:"Pourquoi Rimbaud remplace-t-il la mer par « une vieille baignoire » ? (3-4 phrases)", type:"open", pts:3, part:1,
      expl:"Dans le mythe, Vénus naît de la mer (cadre sublime). Rimbaud la remplace par une baignoire (banal, vulgaire) → parodie du mythe. Il veut montrer que la poésie peut traiter du laid = émancipation créatrice." },
    { id:20, q:"Comment les 3 poèmes (Vénus, Le Dormeur, Ma Bohème) illustrent-ils « Émancipations créatrices » ? (5-6 phrases)", type:"open", pts:4, part:1,
      expl:"Vénus : émancipation des codes du beau (contre-blason, laideur = sujet poétique).\nLe Dormeur : émancipation par l'engagement (dénonce la guerre par l'antithèse).\nMa Bohème : émancipation sociale (vagabondage = liberté de création).\nTous trois utilisent le sonnet, maîtrisé puis subverti par un adolescent de 16 ans." },

    // ── PARTIE 3 : GRAMMAIRE (10 pts) ──
    { id:21, q:"« Pour que tu comprennes ce poème, je t'explique le contexte. »\nLa subordonnée exprime :", type:"qcm", opts:["La cause","Le but","La conséquence","La concession"], correct:1, pts:2, part:2,
      expl:"Le but. « Pour que » + subjonctif = but." },
    { id:22, q:"« Bien que Rimbaud soit jeune, il maîtrise le sonnet. »\nLa subordonnée exprime :", type:"qcm", opts:["La cause","Le temps","La condition","La concession"], correct:3, pts:2, part:2,
      expl:"La concession. « Bien que » + subjonctif = concession (= malgré le fait que)." },
    { id:23, q:"« Le poème est si provoquant que le lecteur est choqué. »\nLa subordonnée exprime la…", type:"text", answer:"consequence", pts:2, part:2,
      expl:"Conséquence. « Si… que » = conséquence (construction corrélative)." },
    { id:24, q:"« Comme Rimbaud fugue souvent, il découvre la liberté lorsqu'il marche seul. »\nIdentifie les 2 subordonnées + leur fonction.", type:"open", pts:4, part:2,
      expl:"Sub.1 : « Comme Rimbaud fugue souvent » = CC de cause (« comme » + indicatif).\nSub.2 : « lorsqu'il marche seul » = CC de temps (« lorsque » + indicatif).\nPrincipale : « il découvre la liberté »." },
  ]
};

// ═══════════════════════════════════════════════════════════
// ÉPREUVES BAC BLANC CLASSIQUES (chronomètre + écriture)
// ═══════════════════════════════════════════════════════════
const BAC_BLANCS = {
  FR: {
    nom: "Bac Blanc Français — 4h écriture",
    duree: 4 * 3600, coeff: "Coefficient 5", icon: "📖", color: "#3b82f6",
    consignes: ["Durée : 4 heures","Commentaire OU dissertation AU CHOIX","Dictionnaire non autorisé"],
    sujets: [
      { id:"FR-1", title:"Commentaire — Ma Bohème", type:"commentaire",
        texte:"Vous commenterez le poème « Ma Bohème » d'Arthur Rimbaud (Les Cahiers de Douai, 1870).\n\nVous montrerez comment le poète transforme l'errance en expérience poétique.",
        bareme:"Introduction /4 — Développement structuré /12 — Conclusion /2 — Expression /2" },
      { id:"FR-2", title:"Dissertation — Émancipation", type:"dissertation",
        texte:"La poésie est-elle une forme d'émancipation ?\n\nVous répondrez en vous appuyant sur les œuvres étudiées et votre culture personnelle.",
        bareme:"Introduction /3 — Thèse /5 — Antithèse /5 — Synthèse /5 — Expression /2" },
    ]
  },
  MA: {
    nom: "Bac Blanc Maths — 2h sans calculatrice",
    duree: 2 * 3600, coeff: "Coefficient 2 — SANS CALCULATRICE", icon: "📐", color: "#ec4899",
    consignes: ["Durée : 2 heures","Calculatrice NON autorisée","Partie 1 : QCM (6 pts) | Partie 2 : Exercices (14 pts)"],
    sujets: [
      { id:"MA-1", title:"Sujet n°1 — Second degré & dérivation", type:"complet",
        texte:"PARTIE 1 — QCM AUTOMATISMES (6 points)\n\n1. (x+3)² = ?\n   a) x²+9   b) x²+6x+9   c) x²+3x+9   d) 2x+6\n\n2. Δ de 2x²−3x+1 :\n   a) 1   b) −1   c) 5   d) 17\n\n3. f(x)=3x²−2x+1, f'(x) :\n   a) 6x−2   b) 3x−2   c) 6x²−2   d) 6x+1\n\n4. x²−4=0 → solutions :\n   a) x=4   b) x=2   c) x=−2 et x=2   d) x=−4 et x=4\n\n5. f(x)=−x²+4x−3, maximum pour x = :\n   a) 2   b) −2   c) 3   d) 4\n\n6. (2a−b)(2a+b) = :\n   a) 4a²−b²   b) 4a²+b²   c) 2a²−b²   d) 4a−b\n\nPARTIE 2 — EXERCICES (14 points)\n\nExo 1 (7 pts) — f(x) = x²−6x+5\n1. Discriminant et racines\n2. Forme canonique\n3. Tableau de signes\n4. Solutions de f(x) ≤ 0\n\nExo 2 (7 pts) — g(x) = x³−3x²+2\n1. g'(x)\n2. Signe de g'(x)\n3. Tableau de variations\n4. Tangente au point x=1",
        bareme:"QCM : 6 pts | Exo 1 : 7 pts | Exo 2 : 7 pts" },
      { id:"MA-2", title:"Sujet n°2 — Probabilités & suites", type:"complet",
        texte:"PARTIE 1 — QCM (6 pts)\n\n1. √49+√16 = ?  a) √65  b) 11  c) 65  d) 13\n2. P(A∪B) si P(A)=0.6, P(B)=0.3, A⊥B :  a) 0.72  b) 0.9  c) 0.18  d) 0.3\n3. u₀=5, r=−3, u₅ arithmétique :  a) −10  b) 20  c) −15  d) 8\n4. 9x²−25 = ?  a) (3x−5)²  b) (3x+5)(3x−5)  c) (9x+5)(x−5)  d) (3x−5)(3x+25)\n5. f'(a)=0, f''(a)<0 → f(a) est :  a) minimum  b) maximum  c) inflexion  d) indéterminé\n6. e^(ln2) = ?  a) ln2  b) 2  c) e²  d) 2e\n\nPARTIE 2 — EXERCICES (14 pts)\n\nExo 1 (7 pts) — Urne : 3 rouges, 5 bleues\n1. P(Rouge) un tirage\n2. Avec remise : P(2 rouges)\n3. Sans remise : P(1 rouge puis 1 bleue)\n4. Arbre pour 2 tirages sans remise\n\nExo 2 (7 pts) — (uₙ) : u₀=2, uₙ₊₁=3uₙ−4\n1. u₁, u₂, u₃\n2. Sens de variation\n3. vₙ=uₙ−2 géométrique ? Raison ?\n4. uₙ en fonction de n",
        bareme:"QCM : 6 pts | Exo 1 : 7 pts | Exo 2 : 7 pts" }
    ]
  }
};

// ═══════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function BacBlancPage() {
  const [mode, setMode] = useState("menu"); // menu | epreuve-fr | bac-fr | bac-ma | bac-playing | bac-done
  // Épreuve FR state
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [eprTl, setEprTl] = useState(FR_EPREUVE.duree);
  // Bac blanc state
  const [bacMatiere, setBacMatiere] = useState(null);
  const [bacSujet, setBacSujet] = useState(null);
  const [bacStarted, setBacStarted] = useState(false);
  const [bacTl, setBacTl] = useState(0);
  const [bacDone, setBacDone] = useState(false);
  const [bacNotes, setBacNotes] = useState("");
  const timerRef = useRef(null);

  // Timer for épreuve FR
  useEffect(() => {
    if (mode !== "epreuve-fr" || submitted) return;
    timerRef.current = setInterval(() => { setEprTl(t => { if(t<=1){return 0;} return t-1; }); }, 1000);
    return () => clearInterval(timerRef.current);
  }, [mode, submitted]);

  // Timer for bac blanc
  useEffect(() => {
    if (mode !== "bac-playing" || bacDone) return;
    timerRef.current = setInterval(() => { setBacTl(t => { if(t<=1){setBacDone(true);return 0;} return t-1; }); }, 1000);
    return () => clearInterval(timerRef.current);
  }, [mode, bacDone]);

  const fmt = (s) => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const fmm = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const norm = (s) => (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();

  // ── MENU ──
  if (mode === "menu") return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <a href="/cours" style={{ fontSize:22, color:"#94a3b8", textDecoration:"none" }}>←</a>
        <div>
          <div style={{ fontSize:22, fontWeight:800 }}>📝 Épreuves & Bac Blanc</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Tests corrigés · Conditions réelles · Chronomètre</div>
        </div>
      </div>

      <div style={{ fontSize:13, fontWeight:700, color:"#3b82f6", marginBottom:8 }}>📖 FRANÇAIS</div>

      <div onClick={() => { setMode("epreuve-fr"); setQi(0); setAnswers({}); setSubmitted(false); setEprTl(FR_EPREUVE.duree); }}
        style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10, cursor:"pointer", borderLeft:"4px solid #3b82f6" }}>
        <div style={{ fontWeight:700, fontSize:15 }}>🎯 Épreuve interactive — Rimbaud</div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>24 questions · 40 pts · Correction automatique · 45 min</div>
        <div style={{ fontSize:11, color:"#60a5fa", marginTop:4 }}>Séances 1-9 : connaissances + analyse + grammaire</div>
      </div>

      <div onClick={() => { setBacMatiere("FR"); setMode("bac-fr"); }}
        style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:20, cursor:"pointer", borderLeft:"4px solid #3b82f640" }}>
        <div style={{ fontWeight:700, fontSize:15 }}>📝 Bac Blanc classique — 4h écriture</div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>Commentaire ou dissertation · Coefficient 5</div>
      </div>

      <div style={{ fontSize:13, fontWeight:700, color:"#ec4899", marginBottom:8 }}>📐 MATHÉMATIQUES</div>

      <div onClick={() => { setBacMatiere("MA"); setMode("bac-fr"); }}
        style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:20, cursor:"pointer", borderLeft:"4px solid #ec4899" }}>
        <div style={{ fontWeight:700, fontSize:15 }}>📝 Bac Blanc Maths — 2h sans calculatrice</div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>QCM automatismes + exercices · Coefficient 2</div>
      </div>

      {/* Historique */}
      <div style={{ background:"#1e293b", borderRadius:14, padding:14 }}>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>📊 Historique</div>
        {(() => { try { const log = JSON.parse(localStorage.getItem("bacblanc_log") || "[]");
          if (log.length === 0) return <div style={{ fontSize:12, color:"#64748b" }}>Aucune épreuve terminée</div>;
          return log.slice(-8).reverse().map((l, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid #334155", fontSize:12 }}>
              <span style={{ color:"#94a3b8" }}>{l.date} — {l.type || l.matiere}</span>
              <span style={{ color:"#e2e8f0", fontWeight:600 }}>{l.score || `${l.dureeMin} min`}</span>
            </div>
          )); } catch { return null; } })()}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════
  // ÉPREUVE FR INTERACTIVE
  // ═══════════════════════════════════════════════
  if (mode === "epreuve-fr") {
    const qs = FR_EPREUVE.questions;

    const doSubmit = () => {
      setSubmitted(true);
      clearInterval(timerRef.current);
      // Log
      let autoScore = 0, autoMax = 0;
      qs.forEach(q => {
        if (q.type === "open") return;
        autoMax += q.pts;
        const a = answers[q.id];
        if (q.type === "qcm" && a === q.correct) autoScore += q.pts;
        if (q.type === "text") {
          const uN = norm(a || "");
          const cN = norm(q.answer);
          const words = cN.split(" ");
          const ok = words.length > 1 ? words.every(w => uN.includes(w)) : (uN.includes(cN) || cN.includes(uN));
          if (ok) autoScore += q.pts;
        }
      });
      try {
        const log = JSON.parse(localStorage.getItem("bacblanc_log") || "[]");
        log.push({ date: new Date().toISOString().split("T")[0], type: "FR épreuve interactive", score: `${autoScore}/${autoMax}`, ts: Date.now() });
        localStorage.setItem("bacblanc_log", JSON.stringify(log));
      } catch {}
    };

    const isCorrect = (q) => {
      const a = answers[q.id];
      if (q.type === "qcm") return a === q.correct;
      if (q.type === "text") {
        const uN = norm(a || ""), cN = norm(q.answer);
        const words = cN.split(" ");
        return words.length > 1 ? words.every(w => uN.includes(w)) : (uN.includes(cN) || cN.includes(uN));
      }
      return null;
    };

    // Score
    let autoScore = 0, autoMax = 0, openPts = 0;
    if (submitted) {
      qs.forEach(q => {
        if (q.type === "open") { openPts += q.pts; return; }
        autoMax += q.pts;
        if (isCorrect(q)) autoScore += q.pts;
      });
    }

    let currentPart = -1;

    return (
      <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif" }}>
        {/* Header sticky */}
        <div style={{ position:"sticky", top:0, zIndex:10, background:"#1e293b", padding:"10px 16px", borderBottom:"2px solid #3b82f6" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span onClick={() => setMode("menu")} style={{ cursor:"pointer", fontSize:18 }}>← <span style={{ fontSize:13, fontWeight:700, color:"#3b82f6" }}>Épreuve Français</span></span>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <span style={{ fontSize:16, fontWeight:800, fontFamily:"monospace", color:eprTl<300?"#ef4444":"#e2e8f0" }}>{fmm(eprTl)}</span>
              {!submitted && <button onClick={doSubmit} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:"#3b82f6", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>Corriger</button>}
            </div>
          </div>
        </div>

        {/* Score si soumis */}
        {submitted && (
          <div style={{ margin:16, background:"#1e293b", borderRadius:14, padding:20, textAlign:"center", border:"2px solid #3b82f6" }}>
            <div style={{ fontSize:40, fontWeight:800 }}>{autoScore}/{autoMax}</div>
            <div style={{ fontSize:14, fontWeight:600, color: autoScore/autoMax>=.7?"#22c55e":autoScore/autoMax>=.5?"#fbbf24":"#ef4444", marginTop:4 }}>
              {autoScore/autoMax>=.7?"Bien ! Tu maîtrises.":autoScore/autoMax>=.5?"Des lacunes — revois les séances.":"Reprends le cours séance par séance."}
            </div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>+ {openPts} pts questions ouvertes (lis les corrigés)</div>
          </div>
        )}

        <div style={{ padding:"0 16px 80px" }}>
          {qs.map((q) => {
            let showPart = false;
            if (q.part !== currentPart) { currentPart = q.part; showPart = true; }
            const ok = submitted ? isCorrect(q) : null;

            return (
              <div key={q.id}>
                {showPart && <div style={{ fontSize:15, fontWeight:700, color:"#3b82f6", margin:"20px 0 10px", paddingBottom:8, borderBottom:"2px solid #3b82f640" }}>
                  {FR_EPREUVE.parts[q.part].label} ({FR_EPREUVE.parts[q.part].pts} pts)
                </div>}

                {q.ctx && !qs[qs.indexOf(q)-1]?.ctx && (
                  <div style={{ background:"#0f172a", borderLeft:"3px solid #818cf8", padding:"10px 14px", margin:"8px 0 12px", fontStyle:"italic", fontSize:13, lineHeight:1.8, color:"#c4b5fd", whiteSpace:"pre-wrap" }}>{q.ctx}</div>
                )}

                <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10,
                  borderLeft: submitted ? `4px solid ${ok===true?"#22c55e":ok===false?"#ef4444":"#f59e0b"}` : "4px solid #334155" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:24, height:24, borderRadius:12, background:"#3b82f6", color:"#fff", fontSize:11, fontWeight:700 }}>{q.id}</span>
                      <span style={{ fontWeight:600, fontSize:14, lineHeight:1.5 }}>{q.q}</span>
                    </div>
                    <span style={{ fontSize:11, color:"#64748b", background:"#0f172a", padding:"2px 8px", borderRadius:8, whiteSpace:"nowrap", height:"fit-content" }}>{q.pts} pt{q.pts>1?"s":""}</span>
                  </div>

                  {q.type === "qcm" && q.opts.map((o, i) => {
                    let bg = "#0f172a", bd = "#334155", cl = "#e2e8f0";
                    if (submitted) {
                      if (i === q.correct) { bg = "rgba(34,197,94,.12)"; bd = "#22c55e"; cl = "#22c55e"; }
                      else if (i === answers[q.id]) { bg = "rgba(239,68,68,.12)"; bd = "#ef4444"; cl = "#ef4444"; }
                    } else if (i === answers[q.id]) { bg = "rgba(99,102,241,.12)"; bd = "#6366f1"; }
                    return (
                      <div key={i} onClick={() => !submitted && setAnswers({...answers, [q.id]: i})}
                        style={{ padding:"10px 12px", borderRadius:10, border:`2px solid ${bd}`, background:bg, color:cl, marginBottom:4, cursor:submitted?"default":"pointer", fontSize:13 }}>
                        {o}
                      </div>
                    );
                  })}

                  {q.type === "text" && (
                    <input value={answers[q.id] || ""} onChange={e => !submitted && setAnswers({...answers, [q.id]: e.target.value})}
                      placeholder="Ta réponse..." readOnly={submitted}
                      style={{ width:"100%", padding:10, borderRadius:8, border:`1px solid ${submitted?(ok?"#22c55e":"#ef4444"):"#334155"}`, background:"#0f172a", color:"#e2e8f0", fontSize:14, boxSizing:"border-box" }} />
                  )}

                  {q.type === "open" && (
                    <textarea value={answers[q.id] || ""} onChange={e => !submitted && setAnswers({...answers, [q.id]: e.target.value})}
                      placeholder="Ta réponse développée..." readOnly={submitted}
                      style={{ width:"100%", padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:14, minHeight:80, resize:"vertical", lineHeight:1.6, boxSizing:"border-box" }} />
                  )}

                  {submitted && (
                    <div style={{ marginTop:8, padding:10, borderRadius:8, fontSize:13, lineHeight:1.6,
                      background: ok===true ? "rgba(34,197,94,.06)" : "rgba(239,68,68,.06)",
                      border: `1px solid ${ok===true?"rgba(34,197,94,.2)":"rgba(239,68,68,.2)"}` }}>
                      <span style={{ fontWeight:700, color:ok===true?"#22c55e":ok===false?"#ef4444":"#fbbf24" }}>
                        {ok===true?"✓ Correct":ok===false?"✗ Incorrect":"📝 Corrigé type :"}
                      </span>
                      <div style={{ color:"#e2e8f0", marginTop:4, whiteSpace:"pre-wrap" }}>{q.expl}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!submitted && <button onClick={doSubmit} style={{ width:"100%", padding:16, borderRadius:14, border:"none", background:"#3b82f6", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer", marginTop:16 }}>📝 Corriger mon épreuve</button>}
          {submitted && <button onClick={() => setMode("menu")} style={{ width:"100%", padding:14, borderRadius:12, border:"none", background:"#334155", color:"#e2e8f0", fontWeight:700, cursor:"pointer", marginTop:16 }}>← Retour au menu</button>}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // BAC BLANC CLASSIQUE (choix sujet)
  // ═══════════════════════════════════════════════
  if (mode === "bac-fr" && bacMatiere) {
    const ep = BAC_BLANCS[bacMatiere];
    if (!bacSujet) return (
      <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
          <span onClick={() => { setMode("menu"); setBacMatiere(null); }} style={{ fontSize:22, color:"#94a3b8", cursor:"pointer" }}>←</span>
          <div><div style={{ fontSize:20, fontWeight:800 }}>{ep.icon} {ep.nom}</div><div style={{ fontSize:12, color:"#94a3b8" }}>{ep.coeff}</div></div>
        </div>
        <div style={{ background:"#1e293b", borderRadius:14, padding:14, marginBottom:16 }}>
          <div style={{ fontWeight:700, marginBottom:8 }}>📋 Consignes</div>
          {ep.consignes.map((c,i) => <div key={i} style={{ fontSize:13, color:"#94a3b8", marginBottom:4 }}>• {c}</div>)}
        </div>
        {bacMatiere === "MA" && (
          <div style={{ background:"rgba(239,68,68,.08)", borderRadius:12, padding:12, marginBottom:16, border:"1px solid rgba(239,68,68,.2)", textAlign:"center" }}>
            <span style={{ fontWeight:700, color:"#fca5a5", fontSize:14 }}>🚫 CALCULATRICE INTERDITE</span>
          </div>
        )}
        {ep.sujets.map((s, i) => (
          <div key={s.id} onClick={() => setBacSujet(s)}
            style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10, cursor:"pointer", borderLeft:`4px solid ${ep.color}` }}>
            <div style={{ fontWeight:700, fontSize:15 }}>{s.title}</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>{s.type} · {s.bareme}</div>
          </div>
        ))}
      </div>
    );

    // Avant démarrage
    if (!bacStarted) return (
      <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px", textAlign:"center" }}>
        <div style={{ padding:"40px 0" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>{ep.icon}</div>
          <div style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>{bacSujet.title}</div>
          <div style={{ fontSize:14, color:"#94a3b8", marginBottom:24 }}>Durée : {Math.floor(ep.duree/3600)}h</div>
          {bacMatiere==="MA" && <div style={{ background:"rgba(239,68,68,.1)", borderRadius:12, padding:12, marginBottom:20, border:"1px solid rgba(239,68,68,.3)" }}><span style={{ fontWeight:700, color:"#fca5a5" }}>🚫 CALCULATRICE INTERDITE</span></div>}
          <button onClick={() => { setBacStarted(true); setBacTl(ep.duree); setBacDone(false); setBacNotes(""); setMode("bac-playing"); }}
            style={{ padding:"16px 40px", borderRadius:14, border:"none", background:ep.color, color:"#fff", fontWeight:800, fontSize:18, cursor:"pointer" }}>🏁 Commencer</button>
        </div>
      </div>
    );
  }

  // Bac blanc en cours
  if (mode === "bac-playing") {
    const ep = BAC_BLANCS[bacMatiere];
    if (bacDone) {
      const dureeMin = Math.round((ep.duree - bacTl) / 60);
      try { const log = JSON.parse(localStorage.getItem("bacblanc_log") || "[]"); const today = new Date().toISOString().split("T")[0]; if(!log.find(l=>l.date===today&&l.sujet===bacSujet.id)){ log.push({date:today,matiere:bacMatiere,sujet:bacSujet.id,dureeMin}); localStorage.setItem("bacblanc_log",JSON.stringify(log)); } } catch {}
      return (
        <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:8 }}>✅</div>
          <div style={{ fontSize:22, fontWeight:800 }}>Épreuve terminée</div>
          <div style={{ fontSize:14, color:"#94a3b8", marginTop:4 }}>Durée : {dureeMin} min</div>
          <div style={{ background:"#1e293b", borderRadius:14, padding:16, margin:"16px 0", textAlign:"left" }}>
            <div style={{ fontWeight:700, marginBottom:8 }}>📋 Barème</div>
            <div style={{ fontSize:13, color:"#94a3b8", whiteSpace:"pre-wrap" }}>{bacSujet.bareme}</div>
          </div>
          <button onClick={() => { setMode("menu"); setBacMatiere(null); setBacSujet(null); setBacStarted(false); }}
            style={{ padding:14, borderRadius:12, border:"none", background:"#334155", color:"#e2e8f0", fontWeight:700, cursor:"pointer", width:"100%" }}>← Retour</button>
        </div>
      );
    }
    const pctTime = ((ep.duree - bacTl) / ep.duree) * 100;
    return (
      <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif" }}>
        <div style={{ position:"sticky", top:0, zIndex:10, background:"#1e293b", padding:"10px 16px", borderBottom:`2px solid ${bacTl<600?"#ef4444":ep.color}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:700, color:ep.color }}>{bacSujet.type.toUpperCase()}</span>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <span style={{ fontSize:20, fontWeight:800, fontFamily:"monospace", color:bacTl<600?"#ef4444":"#e2e8f0" }}>{fmt(bacTl)}</span>
              <button onClick={() => setBacDone(true)} style={{ padding:"4px 10px", borderRadius:8, border:"none", background:"rgba(239,68,68,.15)", color:"#f87171", fontSize:11, fontWeight:600, cursor:"pointer" }}>Terminer</button>
            </div>
          </div>
          <div style={{ height:3, background:"#334155", borderRadius:2, marginTop:6, overflow:"hidden" }}><div style={{ height:"100%", background:bacTl<600?"#ef4444":ep.color, width:`${pctTime}%`, transition:"width 1s" }} /></div>
        </div>
        <div style={{ padding:"16px 16px 80px" }}>
          {bacMatiere==="MA" && <div style={{ background:"rgba(239,68,68,.08)", borderRadius:10, padding:10, marginBottom:12, textAlign:"center", border:"1px solid rgba(239,68,68,.2)" }}><span style={{ fontWeight:700, color:"#fca5a5", fontSize:12 }}>🚫 CALCULATRICE INTERDITE</span></div>}
          <div style={{ background:"#1e293b", borderRadius:14, padding:20, marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:12, color:ep.color }}>{bacSujet.title}</div>
            <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, lineHeight:1.8, margin:0 }}>{bacSujet.texte}</pre>
          </div>
          <div style={{ background:"#1e293b", borderRadius:14, padding:16 }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:8, color:"#94a3b8" }}>📝 Brouillon</div>
            <textarea value={bacNotes} onChange={e => setBacNotes(e.target.value)} placeholder="Notes / brouillon..."
              style={{ width:"100%", minHeight:150, padding:12, borderRadius:10, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:14, lineHeight:1.6, resize:"vertical", boxSizing:"border-box" }} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
