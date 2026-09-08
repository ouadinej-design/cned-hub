// ═══════════════════════════════════════════════════
// SINGLE SOURCE OF TRUTH — Toutes les données CNED
// ═══════════════════════════════════════════════════

// ─── VACANCES SCOLAIRES (Zone B - Rennes) ───
export const VACANCES = [
  { start: "2026-10-17", end: "2026-11-01", label: "Toussaint" },
  { start: "2026-12-19", end: "2027-01-03", label: "Noël" },
  { start: "2027-02-20", end: "2027-03-07", label: "Hiver" },
  { start: "2027-04-17", end: "2027-04-25", label: "Printemps (fin programme)" },
];

// ─── SEMESTRES ───
export const SEMESTRES = {
  s1: { start: "2026-09-01", end: "2027-01-17", label: "Semestre 1" },
  s2: { start: "2027-01-18", end: "2027-04-25", label: "Semestre 2" },
};

// ─── DATES CLÉS ───
export const DATES_CLES = [
  { date: "2026-09-01", label: "Ouverture espace de formation", icon: "🚀" },
  { date: "2026-09-14", label: "Ouverture tutorat disciplinaire", icon: "📚" },
  { date: "2026-09-22", label: "Ouverture dépôts de devoirs", icon: "📤" },
  { date: "2026-11-01", label: "Inscriptions bac Cyclades (nov-déc)", icon: "📝", critical: true },
  { date: "2027-01-17", label: "FIN SEMESTRE 1 — 100% devoirs S1 obligatoire", icon: "🔴", critical: true },
  { date: "2027-01-18", label: "Mise en ligne devoirs Semestre 2", icon: "📤" },
  { date: "2027-02-01", label: "Conseil de classe S1 + Bulletin", icon: "📊" },
  { date: "2027-03-01", label: "Convocations bac Cyclades", icon: "📬", critical: true },
  { date: "2027-04-01", label: "Campagne affectation lycée (si changement)", icon: "🏫" },
  { date: "2027-04-25", label: "FIN SEMESTRE 2 — 100% devoirs S2 obligatoire", icon: "🔴", critical: true },
  { date: "2027-06-01", label: "Conseil de classe S2 + Bulletin + LSL", icon: "📊" },
  { date: "2027-07-02", label: "Fin tutorat disciplinaire", icon: "📚" },
  { date: "2027-07-16", label: "Fermeture plateforme CNED — SAUVEGARDER TOUT", icon: "🔒", critical: true },
];

// ─── RÈGLES CONTRÔLE CONTINU ───
export const REGLES = [
  { text: "Note globale du bac = 40% contrôle continu + 60% épreuves terminales", type: "info" },
  { text: "100% des devoirs du Semestre 1 rendus avant le 17 janvier 2027", type: "critical" },
  { text: "100% des devoirs du Semestre 2 rendus avant le 25 avril 2027", type: "critical" },
  { text: "14 jours minimum entre 2 devoirs d'une même matière", type: "warning" },
  { text: "Les devoirs doivent être rendus dans l'ordre des séquences", type: "warning" },
  { text: "Après le 25 avril, les devoirs sont corrigés mais NE COMPTENT PAS pour le contrôle continu", type: "critical" },
  { text: "Si non éligible → convocation épreuve de remplacement par l'académie (juin ou sept)", type: "critical" },
  { text: "Suivre la progression des séquences et ne pas sauter de devoirs", type: "warning" },
];

// ─── MATIÈRES & COULEURS ───
export const MATIERES = {
  FR: { nom: "Français", court: "Fr", color: "#3b82f6", bg: "#dbeafe", text: "#1e40af", priority: 1 },
  MA: { nom: "Maths", court: "Ma", color: "#ec4899", bg: "#fce7f3", text: "#9d174d", priority: 1 },
  SE: { nom: "SES", court: "SES", color: "#10b981", bg: "#d1fae5", text: "#065f46", priority: 2 },
  HG: { nom: "HGGSP", court: "HG", color: "#f59e0b", bg: "#fef3c7", text: "#92400e", priority: 2 },
  HI: { nom: "Hist-Géo", court: "HGéo", color: "#f97316", bg: "#fed7aa", text: "#9a3412", priority: 2 },
  AN: { nom: "Anglais", court: "Ang", color: "#6366f1", bg: "#e0e7ff", text: "#3730a3", priority: 2 },
  ES: { nom: "Espagnol", court: "Esp", color: "#ef4444", bg: "#fecaca", text: "#991b1b", priority: 2 },
  SC: { nom: "Ens.Sci", court: "Sci", color: "#14b8a6", bg: "#ccfbf1", text: "#115e59", priority: 3 },
  EM: { nom: "EMC", court: "EMC", color: "#a855f7", bg: "#f3e8ff", text: "#6b21a8", priority: 3 },
};

// ─── DEVOIRS CNED (TOUS) ───
// Deadline = date limite recommandée (avancée avant vacances si nécessaire)
// realDeadline = vraie date CNED
export const DEVOIRS = [
  // ══ SEMESTRE 1 (avant 17 jan 2027) ══
  // Français (8 devoirs total, 4 en S1)
  { id: "FR-1", m: "FR", n: 1, sem: 1, deadline: "2026-10-04", type: "depot", seq: 1 },
  { id: "FR-2", m: "FR", n: 2, sem: 1, deadline: "2026-10-25", type: "depot", seq: 2 },
  { id: "FR-3", m: "FR", n: 3, sem: 1, deadline: "2026-11-15", type: "depot", seq: 3 },
  { id: "FR-4", m: "FR", n: 4, sem: 1, deadline: "2026-12-13", type: "depot", seq: 4 },
  // Maths spé (6 total, 3 en S1)
  { id: "MA-1", m: "MA", n: 1, sem: 1, deadline: "2026-09-27", type: "depot", seq: 1 },
  { id: "MA-2", m: "MA", n: 2, sem: 1, deadline: "2026-10-16", type: "ligne", seq: 1, note: "Avancé : vacances Toussaint" },
  { id: "MA-3", m: "MA", n: 3, sem: 1, deadline: "2026-12-06", type: "depot", seq: 2 },
  // Hist-Géo (6 total, 3 en S1)
  { id: "HI-1", m: "HI", n: 1, sem: 1, deadline: "2026-10-04", type: "depot", seq: 1 },
  { id: "HI-2", m: "HI", n: 2, sem: 1, deadline: "2026-10-16", type: "depot", seq: 2, note: "Avancé : vacances Toussaint" },
  { id: "HI-3", m: "HI", n: 3, sem: 1, deadline: "2026-12-13", type: "depot", seq: 3 },
  // SES (6 total, 3 en S1)
  { id: "SE-1", m: "SE", n: 1, sem: 1, deadline: "2026-10-04", type: "depot", seq: 1 },
  { id: "SE-2", m: "SE", n: 2, sem: 1, deadline: "2026-10-16", type: "depot", seq: 2, note: "Avancé : vacances Toussaint" },
  { id: "SE-3", m: "SE", n: 3, sem: 1, deadline: "2026-12-13", type: "depot", seq: 3 },
  // HGGSP (6 total, 3 en S1)
  { id: "HG-1", m: "HG", n: 1, sem: 1, deadline: "2026-10-04", type: "depot", seq: 1 },
  { id: "HG-2", m: "HG", n: 2, sem: 1, deadline: "2026-10-16", type: "depot", seq: 2, note: "Avancé : vacances Toussaint" },
  { id: "HG-3", m: "HG", n: 3, sem: 1, deadline: "2026-12-13", type: "depot", seq: 3 },
  // Anglais (6 total, 3 en S1)
  { id: "AN-1", m: "AN", n: 1, sem: 1, deadline: "2026-10-11", type: "depot", seq: 1 },
  { id: "AN-2", m: "AN", n: 2, sem: 1, deadline: "2026-11-22", type: "depot", seq: 2 },
  { id: "AN-3", m: "AN", n: 3, sem: 1, deadline: "2027-01-10", type: "depot", seq: 3 },
  // Espagnol (6 total, 3 en S1)
  { id: "ES-1", m: "ES", n: 1, sem: 1, deadline: "2026-10-11", type: "depot", seq: 1 },
  { id: "ES-2", m: "ES", n: 2, sem: 1, deadline: "2026-11-22", type: "depot", seq: 2 },
  { id: "ES-3", m: "ES", n: 3, sem: 1, deadline: "2027-01-10", type: "depot", seq: 3 },
  // Ens.Sci (4 total, 2 en S1)
  { id: "SC-1", m: "SC", n: 1, sem: 1, deadline: "2026-10-16", type: "ligne", seq: 1, note: "Avancé : vacances Toussaint" },
  { id: "SC-2", m: "SC", n: 2, sem: 1, deadline: "2026-12-13", type: "ligne", seq: 2 },
  // EMC (4 total, 2 en S1)
  { id: "EM-1", m: "EM", n: 1, sem: 1, deadline: "2026-10-16", type: "ligne", seq: 1, note: "Avancé : vacances Toussaint" },
  { id: "EM-2", m: "EM", n: 2, sem: 1, deadline: "2027-01-10", type: "ligne", seq: 2 },

  // ══ SEMESTRE 2 (avant 25 avr 2027) ══
  // Français
  { id: "FR-5", m: "FR", n: 5, sem: 2, deadline: "2027-02-07", type: "depot", seq: 5 },
  { id: "FR-6", m: "FR", n: 6, sem: 2, deadline: "2027-02-19", type: "ligne", seq: 6, note: "Avancé : vacances Hiver" },
  { id: "FR-7", m: "FR", n: 7, sem: 2, deadline: "2027-03-28", type: "depot", seq: 7 },
  { id: "FR-8", m: "FR", n: 8, sem: 2, deadline: "2027-04-16", type: "depot", seq: 8, note: "Avancé : vacances Printemps" },
  // Maths
  { id: "MA-4", m: "MA", n: 4, sem: 2, deadline: "2027-01-31", type: "ligne", seq: 3 },
  { id: "MA-5", m: "MA", n: 5, sem: 2, deadline: "2027-03-14", type: "depot", seq: 4 },
  { id: "MA-6", m: "MA", n: 6, sem: 2, deadline: "2027-04-16", type: "depot", seq: 5, note: "Avancé : vacances Printemps" },
  // Hist-Géo
  { id: "HI-4", m: "HI", n: 4, sem: 2, deadline: "2027-02-14", type: "depot", seq: 4 },
  { id: "HI-5", m: "HI", n: 5, sem: 2, deadline: "2027-03-21", type: "depot", seq: 5 },
  { id: "HI-6", m: "HI", n: 6, sem: 2, deadline: "2027-04-16", type: "depot", seq: 6, note: "Avancé : vacances Printemps" },
  // SES
  { id: "SE-4", m: "SE", n: 4, sem: 2, deadline: "2027-02-14", type: "depot", seq: 4 },
  { id: "SE-5", m: "SE", n: 5, sem: 2, deadline: "2027-03-21", type: "depot", seq: 5 },
  { id: "SE-6", m: "SE", n: 6, sem: 2, deadline: "2027-04-16", type: "depot", seq: 6, note: "Avancé : vacances Printemps" },
  // HGGSP
  { id: "HG-4", m: "HG", n: 4, sem: 2, deadline: "2027-02-14", type: "depot", seq: 4 },
  { id: "HG-5", m: "HG", n: 5, sem: 2, deadline: "2027-03-21", type: "depot", seq: 5 },
  { id: "HG-6", m: "HG", n: 6, sem: 2, deadline: "2027-04-16", type: "depot", seq: 6, note: "Avancé : vacances Printemps" },
  // Anglais
  { id: "AN-4", m: "AN", n: 4, sem: 2, deadline: "2027-02-14", type: "depot", seq: 4 },
  { id: "AN-5", m: "AN", n: 5, sem: 2, deadline: "2027-03-21", type: "depot", seq: 5 },
  { id: "AN-6", m: "AN", n: 6, sem: 2, deadline: "2027-04-16", type: "depot", seq: 6, note: "Avancé : vacances Printemps" },
  // Espagnol
  { id: "ES-4", m: "ES", n: 4, sem: 2, deadline: "2027-02-14", type: "depot", seq: 4 },
  { id: "ES-5", m: "ES", n: 5, sem: 2, deadline: "2027-03-21", type: "depot", seq: 5 },
  { id: "ES-6", m: "ES", n: 6, sem: 2, deadline: "2027-04-16", type: "depot", seq: 6, note: "Avancé : vacances Printemps" },
  // Ens.Sci
  { id: "SC-3", m: "SC", n: 3, sem: 2, deadline: "2027-02-19", type: "ligne", seq: 3, note: "Avancé : vacances Hiver" },
  { id: "SC-4", m: "SC", n: 4, sem: 2, deadline: "2027-04-16", type: "ligne", seq: 4, note: "Avancé : vacances Printemps" },
  // EMC
  { id: "EM-3", m: "EM", n: 3, sem: 2, deadline: "2027-02-19", type: "ligne", seq: 3, note: "Avancé : vacances Hiver" },
  { id: "EM-4", m: "EM", n: 4, sem: 2, deadline: "2027-04-16", type: "ligne", seq: 4, note: "Avancé : vacances Printemps" },
];

// ─── EMPLOI DU TEMPS HEBDOMADAIRE ───
// FR & MA = matin. Profs : Ven FR 8-10h, Mar+Sam MA 9-11h (à confirmer)
export const EMPLOI_SEMAINE = {
  0: [ // Dimanche
    { time: "9h-11h", matiere: "MA", desc: "Consolidation maths — Exercices de la séquence" },
    { time: "14h-16h", matiere: "FR", desc: "Consolidation français — Révisions + apprentissage" },
    { time: "16h30-18h", matiere: "EM", desc: "EMC — Activités CNED" },
  ],
  1: [ // Lundi
    { time: "9h-11h", matiere: "FR", desc: "Français — Cours CNED : avancement séquence" },
    { time: "11h-12h", matiere: "MA", desc: "Maths — Exercices d'application" },
    { time: "14h-16h", matiere: "MA", desc: "Maths — Cours CNED : nouvelle séance" },
    { time: "16h30-18h", matiere: "SE", desc: "SES — Cours CNED" },
  ],
  2: [ // Mardi
    { time: "9h-11h", matiere: "MA", desc: "📚 PROF DE MATHS (9h-11h)", prof: true, tentative: true },
    { time: "11h-12h", matiere: "MA", desc: "Exercices du prof + corrections" },
    { time: "14h-16h", matiere: "FR", desc: "Français — Analyse de texte" },
    { time: "16h30-18h", matiere: "HG", desc: "HGGSP — Cours CNED" },
  ],
  3: [ // Mercredi
    { time: "9h-11h", matiere: "FR", desc: "Français — Commentaire / Grammaire" },
    { time: "11h-12h", matiere: "MA", desc: "Maths — Exercices sans calculatrice" },
    { time: "14h-16h", matiere: "MA", desc: "Maths — Suite de la séquence" },
    { time: "16h30-18h", matiere: "AN", desc: "Anglais — Compréhension + expression" },
  ],
  4: [ // Jeudi
    { time: "9h-11h", matiere: "FR", desc: "Français — Textes complémentaires / Méthode" },
    { time: "11h-12h", matiere: "FR", desc: "Français — Exercices O-C-E + rédaction" },
    { time: "14h-16h", matiere: "MA", desc: "Maths — Exercices de la séquence" },
    { time: "16h30-18h", matiere: "HI", desc: "Hist-Géo — Cours CNED" },
  ],
  5: [ // Vendredi
    { time: "8h-10h", matiere: "FR", desc: "📚 PROF DE FRANÇAIS (8h-10h)", prof: true },
    { time: "10h-11h", matiere: "FR", desc: "Exercices de la prof + révisions" },
    { time: "14h-16h", matiere: "MA", desc: "Maths — Approfondissement" },
    { time: "16h30-18h", matiere: "SC", desc: "Ens. Scientifique — Module CNED" },
  ],
  6: [ // Samedi
    { time: "9h-11h", matiere: "MA", desc: "📚 PROF DE MATHS (9h-11h)", prof: true, tentative: true },
    { time: "11h-12h", matiere: "MA", desc: "Bilan maths de la semaine" },
    { time: "14h-16h", matiere: "FR", desc: "Bilan français de la semaine — Fiches + quiz" },
    { time: "16h30-18h", matiere: "ES", desc: "Espagnol — Compréhension + expression" },
  ],
};

// ─── EMPLOI BAC BLANC (26 avr → juin) ───
export const EMPLOI_BAC = [
  { time: "9h-11h", matiere: "FR", desc: "BAC BLANC — Épreuve écrite de français" },
  { time: "11h-12h", matiere: "FR", desc: "Correction + analyse des erreurs" },
  { time: "14h-16h", matiere: "MA", desc: "BAC BLANC — Épreuve de maths type bac" },
  { time: "16h-17h", matiere: "MA", desc: "Correction + reprise des points faibles" },
];

// ─── HELPERS ───
export const formatDate = (d) => d.toISOString().split("T")[0];

export const isVacation = (dateStr) =>
  VACANCES.some((v) => dateStr >= v.start && dateStr <= v.end);

export const getVacationLabel = (dateStr) =>
  VACANCES.find((v) => dateStr >= v.start && dateStr <= v.end)?.label || "";

export const isBacPeriod = (dateStr) =>
  dateStr >= "2027-04-26" && dateStr <= "2027-06-20";

export const getDevoirsForDate = (dateStr) =>
  DEVOIRS.filter((d) => d.deadline === dateStr);

export const getDevoirsThisWeek = (weekStart, weekEnd) =>
  DEVOIRS.filter((d) => d.deadline >= weekStart && d.deadline <= weekEnd);

export const check14DayRule = (matiereCode, devoirsSent) => {
  const sent = DEVOIRS.filter((d) => d.m === matiereCode && devoirsSent[d.id]);
  if (sent.length === 0) return null;
  const lastSent = sent.sort((a, b) => (devoirsSent[b.id] || "").localeCompare(devoirsSent[a.id] || ""))[0];
  const lastDate = new Date(devoirsSent[lastSent.id]);
  const nextOk = new Date(lastDate);
  nextOk.setDate(nextOk.getDate() + 14);
  if (nextOk > new Date()) return formatDate(nextOk);
  return null;
};
