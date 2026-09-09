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

function logDifficulty(matiereFull, seance, question, userAnswer, correctAnswer, hint) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const log = JSON.parse(localStorage.getItem("difficulties_log") || "{}");
    if (!log[today]) log[today] = {};
    if (!log[today][matiereFull]) log[today][matiereFull] = [];
    log[today][matiereFull].push({ type: "exercice", seance, question, userAnswer, correctAnswer, hint, ts: Date.now() });
    localStorage.setItem("difficulties_log", JSON.stringify(log));
  } catch {}
}

function logQuizResult(matiereFull, seance, score, total, wrongQuestions) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const log = JSON.parse(localStorage.getItem("difficulties_log") || "{}");
    if (!log[today]) log[today] = {};
    if (!log[today][matiereFull]) log[today][matiereFull] = [];
    log[today][matiereFull].push({ type: "quiz", seance, score, total, wrongQuestions, ts: Date.now() });
    localStorage.setItem("difficulties_log", JSON.stringify(log));
  } catch {}
}

const SEANCES = [
  {
    id: 1, title: "Rimbaud et Les Cahiers de Douai",
    lessons: [
      { title: "Qui est Rimbaud ?", content: "Arthur Rimbaud (1854-1891), poète prodige.\n\n• Né à Charleville (Ardennes)\n• Écrit ses premiers vers à 15 ans\n• Fugues répétées — esprit rebelle\n• Relation tumultueuse avec Verlaine\n• Abandonne la poésie à 20 ans\n\nRimbaud veut « changer la vie » par la poésie. Il prône le « dérèglement de tous les sens » (lettre du voyant, mai 1871)." },
      { title: "Les Cahiers de Douai", content: "En 1870, Rimbaud (16 ans) fugue deux fois.\n\nIl confie 22 poèmes à son professeur Paul Demeny → ce sont Les Cahiers de Douai (aussi appelés « Recueils Demeny »).\n\nDeux cahiers :\n• 1er cahier (sept 1870) : 15 poèmes\n• 2nd cahier (oct 1870) : 7 poèmes\n\n11 des 22 poèmes sont des SONNETS.\n\nThèmes principaux :\n• Révolte contre la société bourgeoise\n• Dénonciation de la guerre (Le Dormeur du val)\n• Vagabondage et liberté (Ma Bohème)\n• Parodie des mythes (Vénus Anadyomène)\n• Sensations et émancipation poétique" },
      { title: "Le parcours : « Émancipations créatrices »", content: "Parcours associé au programme : « Émancipations créatrices »\n\nRimbaud s'émancipe de :\n• La famille (fugues)\n• L'école (rébellion)\n• Les formes poétiques classiques (subversion du sonnet)\n• Les thèmes conventionnels (le beau → le laid)\n\nLes Cahiers de Douai = embryon de la révolution poétique de Rimbaud. À 16 ans, il maîtrise les formes classiques pour mieux les détourner." }
    ],
    exercises: [
      { q: "En quelle année Rimbaud écrit-il Les Cahiers de Douai ?", answer: "1870", hint: "Il a 16 ans, c'est l'année de ses fugues", level: 1 },
      { q: "À qui Rimbaud confie-t-il ses poèmes ?", answer: "Paul Demeny", hint: "Un ami professeur de lettres", level: 1 },
      { q: "Combien de poèmes dans Les Cahiers de Douai ?", answer: "22", hint: "15 dans le premier cahier + 7 dans le second", level: 2 },
      { q: "Quel est le parcours associé au programme ?", answer: "Émancipations créatrices", hint: "Rimbaud s'émancipe de tout...", level: 2 }
    ],
    quiz: [
      { q: "Rimbaud est né en...", options: ["1854", "1870", "1844", "1861"], correct: 0 },
      { q: "Les Cahiers de Douai contiennent...", options: ["22 poèmes", "14 poèmes", "30 poèmes", "11 poèmes"], correct: 0 },
      { q: "Combien de sonnets dans le recueil ?", options: ["11", "22", "7", "15"], correct: 0 }
    ]
  },
  {
    id: 2, title: "Le sonnet et les formes poétiques",
    lessons: [
      { title: "Le sonnet", content: "Structure du sonnet :\n• 14 vers\n• 2 quatrains (4+4) + 2 tercets (3+3)\n• Alexandrins (12 syllabes)\n• Rimes : ABBA ABBA CCD EDE (ou variantes)\n\nLe sonnet est la forme « noble » de la poésie. Rimbaud la maîtrise à 16 ans pour mieux la subvertir." },
      { title: "Les figures de style clés", content: "À maîtriser pour l'analyse :\n\n• MÉTAPHORE : comparaison sans « comme »\n→ « sa tête est un paysage »\n\n• OXYMORE : deux termes contradictoires\n→ « belle hideusement »\n\n• ANTITHÈSE : opposition de deux idées\n→ « la vie / la mort »\n\n• ENJAMBEMENT : la phrase déborde sur le vers suivant\n→ crée un effet de surprise ou d'amplification\n\n• REJET : un mot court rejeté au vers suivant\n→ met en valeur ce mot\n\n• CHAMP LEXICAL : ensemble de mots d'un même thème" },
      { title: "La méthode O-C-E", content: "Pour analyser un texte au bac :\n\nO — OBSERVATION : relever le procédé (figure de style, champ lexical, rythme, rime...)\n\nC — CONCEPTUALISATION : nommer le procédé avec le terme technique\n\nE — EFFET : expliquer l'effet produit sur le lecteur\n\nExemple : « belle hideusement d'un ulcère à l'anus »\nO : deux termes opposés juxtaposés\nC : c'est un OXYMORE\nE : crée un choc chez le lecteur, renforce la dimension parodique" }
    ],
    exercises: [
      { q: "Combien de vers dans un sonnet ?", answer: "14", hint: "2 quatrains + 2 tercets", level: 1 },
      { q: "Qu'est-ce qu'un oxymore ?", answer: "deux termes contradictoires", hint: "Ex : « belle hideusement »", level: 1 },
      { q: "Que signifie le E de O-C-E ?", answer: "Effet", hint: "L'effet produit sur le lecteur", level: 2 }
    ],
    quiz: [
      { q: "Un sonnet comporte...", options: ["2 quatrains + 2 tercets", "3 quatrains + 1 tercet", "4 tercets", "2 sizains"], correct: 0 },
      { q: "Un alexandrin a...", options: ["12 syllabes", "10 syllabes", "8 syllabes", "14 syllabes"], correct: 0 },
      { q: "O-C-E signifie...", options: ["Observation-Conceptualisation-Effet", "Oeuvre-Contexte-Explication", "Ouverture-Corps-Épilogue", "Observation-Comparaison-Évaluation"], correct: 0 }
    ]
  },
  {
    id: 3, title: "Vénus Anadyomène — Introduction",
    lessons: [
      { title: "Le mythe de Vénus", content: "Vénus Anadyomène = Vénus « sortant des eaux »\n\nDans la mythologie : Vénus (Aphrodite) naît de l'écume de la mer. C'est la déesse de la beauté et de l'amour.\n\nReprésentations célèbres :\n• Botticelli, La Naissance de Vénus (1485)\n• Cabanel, La Naissance de Vénus (1863)\n\nTradition poétique : Vénus = idéal de beauté féminine.\n\nRimbaud va DÉTRUIRE ce mythe." },
      { title: "Le contre-blason", content: "Le BLASON poétique = poème qui fait l'éloge du corps féminin (beauté idéalisée).\n\nLe CONTRE-BLASON = inverse : description dégradante du corps.\n\nVénus Anadyomène de Rimbaud est un CONTRE-BLASON :\n• Il reprend la structure du blason (description du corps)\n• Mais il remplace la beauté par la laideur\n• Parodie du mythe classique\n• Provocation adolescente et poétique" },
      { title: "Structure du poème", content: "Vénus Anadyomène est un SONNET (14 vers, alexandrins).\n\n3 mouvements :\n\nMouvement 1 (v.1-4) — L'émergence : Vénus sort d'une baignoire verte (≠ la mer). Première impression de laideur.\n\nMouvement 2 (v.5-11) — Le portrait descendant : description du corps de haut en bas, crescendo de dégoût.\n\nMouvement 3 (v.12-14) — La chute : le dernier tercet révèle « un ulcère à l'anus », point culminant de la provocation.\n\nProblématique type : Comment Rimbaud parodie-t-il le mythe de Vénus pour affirmer sa liberté poétique ?" }
    ],
    exercises: [
      { q: "Vénus Anadyomène est un genre de poème appelé...", answer: "contre-blason", hint: "L'inverse du blason (éloge de la beauté)", level: 1 },
      { q: "Combien de mouvements dans le poème ?", answer: "3", hint: "Émergence, portrait, chute", level: 1 },
      { q: "L'oxymore central du poème est...", answer: "belle hideusement", hint: "Deux termes contradictoires sur la beauté", level: 2 }
    ],
    quiz: [
      { q: "Vénus Anadyomène signifie...", options: ["Vénus sortant des eaux", "Vénus endormie", "Vénus victorieuse", "Vénus au miroir"], correct: 0 },
      { q: "Le poème est un...", options: ["Contre-blason", "Blason", "Élégie", "Ode"], correct: 0 },
      { q: "Le mouvement 3 se termine par...", options: ["Un ulcère à l'anus", "Un sourire de Vénus", "La mer qui se retire", "Un coucher de soleil"], correct: 0 }
    ]
  },
  {
    id: 4, title: "Vénus — Mouvement 1 (v.1-4)",
    lessons: [
      { title: "Analyse vers par vers", content: "v.1 : « Comme d'un cercueil vert en fer-blanc, une tête »\n→ COMPARAISON dégradante : la baignoire = cercueil\n→ « vert » + « fer-blanc » : matériaux vulgaires\n→ REJET de « une tête » au vers suivant : effet de suspense\n\nv.2 : « De femme à cheveux bruns fortement pommadés »\n→ Cheveux gras, artificiels ≠ Vénus idéale\n→ « Fortement » = excès, vulgarité\n\nv.3 : « D'une vieille baignoire émerge, lente et bête »\n→ « vieille baignoire » ≠ la mer mythique\n→ « lente et bête » : rythme binaire, adjectifs péjoratifs\n\nv.4 : « Avec des déficits assez mal ravaudés »\n→ « déficits » = manques, imperfections du corps\n→ « ravaudés » = rapiécés → le corps est comparé à un tissu usé" },
      { title: "Procédés et effets", content: "Procédés du mouvement 1 :\n\n• Comparaison « comme d'un cercueil » → associe beauté et mort\n• Rejet « une tête / De femme » → effet de suspense puis déception\n• Champ lexical de la dégradation : vieille, bête, déficits, ravaudés\n• Inversion de tous les codes du blason\n\nEffet : dès les premiers vers, le lecteur comprend que ce ne sera PAS un éloge. Rimbaud installe le registre parodique." }
    ],
    exercises: [
      { q: "À quoi la baignoire est-elle comparée au v.1 ?", answer: "un cercueil", hint: "« Comme d'un cercueil vert... »", level: 1 },
      { q: "Quel procédé au passage de v.1 à v.2 ?", answer: "rejet", hint: "« une tête / De femme » — le mot déborde au vers suivant", level: 2 },
      { q: "Que signifie « ravaudés » ?", answer: "rapiécés", hint: "Comme un tissu qu'on répare grossièrement", level: 2 }
    ],
    quiz: [
      { q: "« Comme d'un cercueil vert » est une...", options: ["Comparaison", "Métaphore", "Personnification", "Hyperbole"], correct: 0 },
      { q: "La Vénus sort de...", options: ["Une vieille baignoire", "La mer", "Un lac", "Une fontaine"], correct: 0 }
    ]
  },
  {
    id: 5, title: "Vénus — Mouvement 2 (v.5-11)",
    lessons: [
      { title: "Le portrait descendant", content: "Le mouvement 2 suit le corps de HAUT en BAS (portrait descendant classique du blason).\n\nMais au lieu de la beauté, Rimbaud décrit la laideur :\n\n• Le cou : « gras et gris » (v.5) → allitération en [g]\n• Les omoplates : « larges » qui « rentrent et sortent » (v.6)\n• Le dos : « court » avec des « reins » proéminents\n• Les « rondeurs des reins » → description crue, anatomique\n\nLe mot « puis » revient comme un connecteur mécanique → le regard descend comme une inspection froide, clinique." },
      { title: "L'anti-idéal", content: "Chaque élément détruit l'image de Vénus :\n\nVénus classique → Vénus de Rimbaud\n• Peau nacrée → « gras et gris »\n• Cheveux d'or → « bruns fortement pommadés »\n• Corps divin → corps anatomique, médical\n• Grâce → « lente et bête »\n\nRimbaud utilise le REGISTRE RÉALISTE (détails crus, vocabulaire médical) contre le REGISTRE LYRIQUE traditionnel.\n\nC'est une PARODIE : il respecte la FORME (sonnet, description du corps) mais INVERSE le FOND (laideur au lieu de beauté)." }
    ],
    exercises: [
      { q: "Le portrait du mouvement 2 est de type...", answer: "descendant", hint: "De haut en bas, comme dans un blason", level: 1 },
      { q: "Quel mot sert de connecteur mécanique ?", answer: "puis", hint: "Il revient plusieurs fois pour rythmer la descente", level: 2 },
      { q: "Quel registre Rimbaud utilise-t-il ?", answer: "réaliste", hint: "Détails crus, vocabulaire médical, anatomique", level: 3 }
    ],
    quiz: [
      { q: "Le cou est décrit comme...", options: ["Gras et gris", "Long et fin", "Blanc et nacré", "Rouge et chaud"], correct: 0 },
      { q: "Rimbaud respecte la forme mais inverse...", options: ["Le fond", "La rime", "Le mètre", "La strophe"], correct: 0 }
    ]
  },
  {
    id: 6, title: "Vénus — Mouvement 3 (v.12-14)",
    lessons: [
      { title: "La chute du poème", content: "Le dernier tercet est le point culminant :\n\nv.12 : « Et tout ce corps remue et tend sa large croupe »\n→ « tout ce corps » : déshumanisation totale\n→ « croupe » : vocabulaire animalier\n\nv.13 : « Belle hideusement d'un ulcère à l'anus »\n→ L'OXYMORE central : « belle hideusement »\n→ « ulcère à l'anus » : provocation maximale, registre médical\n\nv.14 : forme le mot final qui clôt le sonnet sur le choc.\n\nLa chute du poème = chute du mythe de Vénus." },
      { title: "Interprétation globale", content: "Pourquoi Rimbaud écrit ce poème ?\n\n1. PROVOCATION adolescente : choquer le bourgeois\n2. LIBERTÉ POÉTIQUE : montrer que tout peut être sujet de poésie, même le laid\n3. MAÎTRISE FORMELLE : prouver qu'il maîtrise le sonnet classique\n4. ÉMANCIPATION : s'affranchir des conventions poétiques\n\n→ Lien avec le parcours « Émancipations créatrices » :\nRimbaud s'émancipe des codes du beau en poésie.\nLe contre-blason est une forme d'émancipation créatrice : utiliser la tradition pour la détruire de l'intérieur." }
    ],
    exercises: [
      { q: "Quel est l'oxymore central du poème ?", answer: "belle hideusement", hint: "Deux termes contradictoires sur la beauté", level: 1 },
      { q: "Le mot « croupe » relève du registre...", answer: "animalier", hint: "C'est un mot qu'on utilise pour les chevaux", level: 2 },
      { q: "En quoi ce poème illustre-t-il le parcours « Émancipations créatrices » ?", answer: "Rimbaud s'émancipe des conventions poétiques du beau", hint: "Il utilise la forme classique pour la subvertir", level: 3 }
    ],
    quiz: [
      { q: "« Belle hideusement » est un...", options: ["Oxymore", "Métaphore", "Comparaison", "Pléonasme"], correct: 0 },
      { q: "Rimbaud veut prouver que...", options: ["Tout peut être sujet de poésie", "Vénus est laide", "Le sonnet est dépassé", "La mythologie est fausse"], correct: 0 }
    ]
  },
  {
    id: 7, title: "Le Dormeur du val",
    lessons: [
      { title: "Présentation", content: "Le Dormeur du val — Sonnet écrit en octobre 1870.\n\nContexte : la guerre franco-prussienne fait rage. Rimbaud (16 ans) a fugué et traverse les zones de combat.\n\nStructure : sonnet classique (2 quatrains + 2 tercets)\n\nLe poème décrit un jeune soldat dans un cadre naturel idyllique. La chute révèle qu'il est MORT — « Il a deux trous rouges au côté droit »." },
      { title: "Analyse", content: "Mouvement 1 (quatrains) — La nature vivante :\n• Champ lexical de la nature : « trou de verdure », « rivière », « herbes », « soleil »\n• Personnification : la nature berce le soldat\n• Impression de paix, de sérénité\n\nMouvement 2 (tercets) — La révélation :\n• « Il dort » répété → ambiguïté volontaire\n• Indices de la mort : « pâle », « froid »\n• Chute au dernier vers : « Il a deux trous rouges au côté droit »\n\nProblématique : Comment Rimbaud dénonce-t-il la guerre par le contraste entre nature et mort ?\n\nProcédé central : l'ANTITHÈSE nature vivante / soldat mort." }
    ],
    exercises: [
      { q: "En quelle année est écrit Le Dormeur du val ?", answer: "1870", hint: "Pendant la guerre franco-prussienne", level: 1 },
      { q: "Que révèle le dernier vers ?", answer: "le soldat est mort", hint: "« Il a deux trous rouges au côté droit »", level: 1 },
      { q: "Quel procédé central structure le poème ?", answer: "antithèse", hint: "Opposition entre la nature vivante et le soldat mort", level: 2 }
    ],
    quiz: [
      { q: "Le Dormeur du val dénonce...", options: ["La guerre", "La nature", "L'amour", "La bourgeoisie"], correct: 0 },
      { q: "Le soldat semble dormir mais il est...", options: ["Mort", "Blessé", "Endormi", "Malade"], correct: 0 }
    ]
  },
  {
    id: 8, title: "Ma Bohème et synthèse",
    lessons: [
      { title: "Ma Bohème", content: "Ma Bohème (Fantaisie) — Sonnet autobiographique.\n\nRimbaud raconte ses fugues : il marche, libre, sous les étoiles.\n\nThèmes : liberté, vagabondage, poésie, jeunesse.\n\n• « Je m'en allais, les poings dans mes poches crevées » → vers d'ouverture célèbre\n• Le poète-vagabond crée en marchant\n• La nature = source d'inspiration\n• Ton joyeux, léger malgré la pauvreté\n\nLien avec le parcours : l'émancipation passe par le voyage, la fuite, le refus des conventions sociales." },
      { title: "Synthèse Séquence 1", content: "BILAN — Les Cahiers de Douai, parcours « Émancipations créatrices » :\n\n3 poèmes étudiés :\n1. Vénus Anadyomène → émancipation des codes du beau (contre-blason)\n2. Le Dormeur du val → engagement contre la guerre (antithèse)\n3. Ma Bohème → émancipation sociale (vagabondage = liberté)\n\nPoints communs :\n• Forme du sonnet maîtrisée puis subvertie\n• Un adolescent de 16 ans qui défie les conventions\n• La poésie comme arme de liberté\n\nPour le bac :\n• Savoir faire une lecture linéaire de chaque poème\n• Maîtriser la méthode O-C-E\n• Connaître le contexte (1870, fugues, guerre)\n• Relier chaque poème au parcours" }
    ],
    exercises: [
      { q: "Premier vers de Ma Bohème ?", answer: "Je m'en allais les poings dans mes poches crevées", hint: "Le poète-vagabond part sur les routes...", level: 2 },
      { q: "Cite les 3 poèmes étudiés en séquence 1", answer: "Vénus Anadyomène, Le Dormeur du val, Ma Bohème", hint: "Contre-blason, guerre, vagabondage", level: 2 }
    ],
    quiz: [
      { q: "Ma Bohème parle de...", options: ["Vagabondage et liberté", "Guerre et mort", "Amour et passion", "Religion"], correct: 0 },
      { q: "Le parcours associé est...", options: ["Émancipations créatrices", "Les fleurs du mal", "Le romantisme", "L'absurde"], correct: 0 },
      { q: "Les 3 poèmes ont en commun...", options: ["La forme du sonnet", "Le thème de l'amour", "12 vers chacun", "Le registre comique"], correct: 0 }
    ]
  },
  {
    id: 9, title: "Grammaire + Quiz final",
    lessons: [
      { title: "Les subordonnées circonstancielles", content: "7 valeurs à connaître :\n\n• CAUSE (pourquoi ?) : parce que, puisque, comme + indicatif\n• BUT (dans quel but ?) : pour que, afin que + SUBJONCTIF\n• CONSÉQUENCE : si bien que, de sorte que\n• TEMPS (quand ?) : quand, lorsque, avant que (+subj)\n• CONCESSION (malgré ?) : bien que, quoique + SUBJONCTIF\n• CONDITION : si + indicatif, à condition que + subj\n• COMPARAISON : comme, de même que\n\n3 types de construction :\n• Conjonctive : introduite par une conjonction\n• Corrélative : liée à un mot dans la principale (si…que)\n• Participiale : verbe au participe, sujet ≠ principale" },
      { title: "La question de grammaire au bac", content: "Au bac de français, une question de grammaire vaut 2 points.\n\nElle porte sur une phrase du texte étudié.\n\nMéthode :\n1) Identifier la proposition subordonnée\n2) Donner sa nature (relative, conjonctive, etc.)\n3) Donner sa fonction (CC de cause, de but, etc.)\n4) Justifier avec le mot subordonnant\n\nExemple : « Bien qu'il pleuve, je sors. »\n→ « Bien qu'il pleuve » = sub. conjonctive, CC de concession, introduite par « bien que » + subjonctif." }
    ],
    exercises: [
      { q: "« Parce que » introduit une sub. de...", answer: "cause", hint: "Répond à la question « pourquoi ? »", level: 1 },
      { q: "« Bien que » est suivi du mode...", answer: "subjonctif", hint: "Comme « pour que », « afin que »", level: 2 },
      { q: "Combien de points vaut la question de grammaire au bac ?", answer: "2", hint: "Sur 20 au total", level: 1 }
    ],
    quiz: [
      { q: "« Pour que tu réussisses » exprime...", options: ["Le but", "La cause", "La conséquence", "Le temps"], correct: 0 },
      { q: "« Bien que » demande le...", options: ["Subjonctif", "Indicatif", "Conditionnel", "Impératif"], correct: 0 },
      { q: "La question de grammaire au bac vaut...", options: ["2 points", "4 points", "1 point", "5 points"], correct: 0 }
    ]
  }
];

const LEVELS = { 1: { label: "Facile", c: "#22c55e" }, 2: { label: "Moyen", c: "#f59e0b" }, 3: { label: "Difficile", c: "#ef4444" } };

export default function FrancaisPage() {
  const [view, setView] = useState("home");
  const [si, setSi] = useState(0);
  const [li, setLi] = useState(0);
  const [tab, setTab] = useState("cours");
  const [prog, setProg] = useState(() => { try { const s = typeof window!=="undefined" && localStorage.getItem("fp"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const save = (p) => { setProg(p); try { localStorage.setItem("fp", JSON.stringify(p)); } catch {} };
  const mark = (id, t) => { if (!prog[`${id}_${t}`]) { save({ ...prog, [`${id}_${t}`]: true }); logActivity("FR"); } };
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
          <div style={{ fontSize:24, fontWeight:800 }}>📖 Prof de Français IA</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Séquence 1 — Rimbaud, Les Cahiers de Douai</div>
        </div>
      </div>
      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontWeight:700 }}>Progression</span><span style={{ color:"#60a5fa", fontWeight:700 }}>{pct}%</span></div>
        <div style={{ height:10, background:"#334155", borderRadius:5, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#3b82f6,#60a5fa)", borderRadius:5, transition:"width .5s" }} /></div>
        <div style={{ fontSize:12, color:"#94a3b8", marginTop:6 }}>{cnt}/{total} complétés</div>
      </div>
      {SEANCES.map((x, i) => { const d = [done(x.id,"lessons"), done(x.id,"exercises"), done(x.id,"quiz")]; const c = d.filter(Boolean).length; return (
        <div key={x.id} onClick={() => { setSi(i); setView("s"); setTab("cours"); setLi(0); }}
          style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:10, cursor:"pointer", borderLeft:`4px solid ${c===3?"#22c55e":c>0?"#f59e0b":"#334155"}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:12, color:"#60a5fa", fontWeight:600 }}>Séance {x.id}</div><div style={{ fontWeight:700, fontSize:15 }}>{x.title}</div></div>
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
        <div><div style={{ fontSize:12, color:"#60a5fa" }}>Séance {s.id}</div><div style={{ fontWeight:700, fontSize:16 }}>{s.title}</div></div>
      </div>
      <div style={{ display:"flex", padding:"12px 16px", gap:0 }}>
        {[["cours","📖 Cours"],["exercices","✏️ Exos"],["quiz","🧪 Quiz"]].map(([k,l]) => (
          <div key={k} onClick={() => setTab(k)} style={{ flex:1, textAlign:"center", padding:"10px 0", borderRadius:10, background:tab===k?"#3b82f6":"transparent", color:tab===k?"#fff":"#94a3b8", fontWeight:600, fontSize:13, cursor:"pointer" }}>
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
      {s.lessons.map((x,i) => <div key={i} onClick={() => setLi(i)} style={{ padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:i===li?"#3b82f6":dn.includes(i)?"rgba(34,197,94,.15)":"#1e293b", color:i===li?"#fff":dn.includes(i)?"#22c55e":"#94a3b8" }}>{i+1}. {x.title}</div>)}
    </div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18, borderLeft:"4px solid #3b82f6" }}>
      <div style={{ fontSize:16, fontWeight:700, marginBottom:10, color:"#60a5fa" }}>{l.title}</div>
      <pre style={{ whiteSpace:"pre-wrap", fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, lineHeight:1.7, margin:0, color:"#e2e8f0" }}>{l.content}</pre>
    </div>
    <AiChat ctx={`Séance ${s.id}: ${s.title} — ${l.title}`} txt={l.content} />
    <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
      <button onClick={() => li>0&&setLi(li-1)} disabled={li===0} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#1e293b", color:"#e2e8f0", fontWeight:600, cursor:li===0?"not-allowed":"pointer", opacity:li===0?.5:1 }}>← Précédent</button>
      <button onClick={next} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#3b82f6", color:"#fff", fontWeight:600, cursor:"pointer" }}>{li<s.lessons.length-1?"Suivant →":"Terminé ✓"}</button>
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
      {[0,1,2,3].map(l => <div key={l} onClick={() => setFl(l)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", background:fl===l?(l===0?"#3b82f6":LEVELS[l]?.c):"#1e293b", color:fl===l?"#fff":"#94a3b8" }}>{l===0?"Tous":LEVELS[l].label}</div>)}
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
          <button onClick={() => { const a=(ans[gi]||"").toLowerCase().replace(/\s/g,""); const c=ex.answer.toLowerCase().replace(/\s/g,""); const ok=a===c||a.includes(c)||c.includes(a); setRes({...res,[gi]:ok}); if(!ok) logDifficulty("Français", s.title, ex.q, ans[gi]||"(vide)", ex.answer, ex.hint); }}
            style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#3b82f6", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Vérifier</button>
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
  const nxt = () => { if(qi<s.quiz.length-1){ setQi(qi+1); setSel(null); setSh(false); } else { setFin(true); const finalScore = sc+(sel===q.correct?1:0); if(finalScore>=Math.ceil(s.quiz.length*.6)) mark(s.id,"quiz"); const wrong = s.quiz.filter((qq,idx) => idx<=qi && !(idx===qi?sel===qq.correct:true)).map(qq=>qq.q); logQuizResult("Français", s.title, finalScore, s.quiz.length, wrong); } };
  const rst = () => { setQi(0); setSel(null); setSc(0); setFin(false); setSh(false); };
  if(fin) return (<div style={{ background:"#1e293b", borderRadius:14, padding:24, textAlign:"center" }}>
    <div style={{ fontSize:48, marginBottom:10 }}>{sc>=Math.ceil(s.quiz.length*.6)?"🎉":"📚"}</div>
    <div style={{ fontSize:22, fontWeight:800 }}>{sc}/{s.quiz.length}</div>
    <div style={{ color:sc>=Math.ceil(s.quiz.length*.6)?"#22c55e":"#f59e0b", fontWeight:600, marginTop:4 }}>{sc>=Math.ceil(s.quiz.length*.6)?"Bravo ! Quiz réussi !":"Continue à réviser !"}</div>
    <button onClick={rst} style={{ marginTop:16, padding:"10px 18px", borderRadius:10, border:"none", background:"#3b82f6", color:"#fff", fontWeight:600, cursor:"pointer" }}>Recommencer</button>
  </div>);
  return (<div>
    <div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>Question {qi+1}/{s.quiz.length}</div>
    <div style={{ background:"#1e293b", borderRadius:14, padding:18 }}>
      <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>{q.q}</div>
      {q.options.map((o,i) => { let bg="#0f172a",bd="#334155",cl="#e2e8f0"; if(sh){ if(i===q.correct){bg="rgba(34,197,94,.15)";bd="#22c55e";cl="#22c55e";} else if(i===sel){bg="rgba(239,68,68,.15)";bd="#ef4444";cl="#ef4444";} } else if(i===sel){bg="rgba(59,130,246,.15)";bd="#3b82f6";} return (
        <div key={i} onClick={()=>chk(i)} style={{ padding:12, borderRadius:10, border:`2px solid ${bd}`, background:bg, color:cl, marginBottom:8, cursor:sh?"default":"pointer", fontWeight:500, fontSize:14 }}>{o}</div>
      ); })}
      {sh && <button onClick={nxt} style={{ marginTop:12, padding:"10px 18px", borderRadius:10, border:"none", background:"#3b82f6", color:"#fff", fontWeight:600, cursor:"pointer" }}>{qi<s.quiz.length-1?"Suivante →":"Voir le score"}</button>}
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
        body: JSON.stringify({ type:"aide", question:u, reponse:u, section:ctx, cours:txt, matiere:"Français" }) });
      const d = await r.json();
      setMsgs(m=>[...m,{r:"ai",t:d.reply||"Erreur."}]);
    } catch { setMsgs(m=>[...m,{r:"ai",t:"Erreur de connexion."}]); }
    setLd(false);
  };
  if(!open) return <div onClick={()=>setOpen(true)} style={{ background:"linear-gradient(135deg,#3b82f6,#60a5fa)", padding:14, borderRadius:12, textAlign:"center", cursor:"pointer", marginTop:16, fontWeight:700, fontSize:14, color:"#fff" }}>🤖 Je suis bloqué — Prof IA</div>;
  return (<div style={{ background:"#1e293b", borderRadius:14, padding:18, marginTop:16, border:"2px solid #3b82f6" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><span style={{ fontWeight:700, color:"#60a5fa" }}>🤖 Prof de Français IA</span><span onClick={()=>{setOpen(false);setMsgs([]);}} style={{ cursor:"pointer", color:"#94a3b8" }}>✕</span></div>
    <div ref={ref} style={{ maxHeight:250, overflowY:"auto", marginBottom:10 }}>
      {msgs.length===0 && <div style={{ fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>Pose ta question...</div>}
      {msgs.map((m,i) => <div key={i} style={{ marginBottom:8, padding:10, borderRadius:10, background:m.r==="user"?"rgba(59,130,246,.15)":"rgba(34,197,94,.1)", borderLeft:`3px solid ${m.r==="user"?"#3b82f6":"#22c55e"}` }}>
        <div style={{ fontSize:11, fontWeight:600, color:m.r==="user"?"#60a5fa":"#22c55e", marginBottom:3 }}>{m.r==="user"?"Toi":"Prof IA"}</div>
        <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{m.t}</div>
      </div>)}
      {ld && <div style={{ fontSize:13, color:"#94a3b8" }}>Le prof réfléchit...</div>}
    </div>
    <div style={{ display:"flex", gap:8 }}>
      <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ta question..." style={{ flex:1, padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
      <button onClick={ask} disabled={ld} style={{ padding:"10px 16px", borderRadius:10, border:"none", background:"#3b82f6", color:"#fff", fontWeight:600, cursor:ld?"not-allowed":"pointer" }}>↑</button>
    </div>
  </div>);
}
