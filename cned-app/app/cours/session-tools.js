"use client";
import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
// MÉTHODE MAÎTRISE — Outils de session v4.0
// Pilier 1 : Verrou de maîtrise (Singapour CPA)
// Pilier 2 : Récupération espacée (Dunlosky J+1/3/7/21)
// Pilier 3 : Pratique en conditions réelles (Japon/Corée)
// ══════════════════════════════════════════════════════════════

const MASTERY_THRESHOLD = 70; // % minimum pour débloquer la séance suivante

// ─── HELPERS : stockage maîtrise ───
function getMasteryData(matiereCode) {
  try {
    return JSON.parse(localStorage.getItem(`mastery_${matiereCode}`) || "{}");
  } catch { return {}; }
}
function saveMasteryData(matiereCode, data) {
  try { localStorage.setItem(`mastery_${matiereCode}`, JSON.stringify(data)); } catch {}
}
export function recordMastery(matiereCode, seanceId, correct, total) {
  const data = getMasteryData(matiereCode);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const prev = data[seanceId];
  // Garder le meilleur score
  if (!prev || pct > prev.pct) {
    data[seanceId] = { pct, correct, total, date: new Date().toISOString().split("T")[0] };
    saveMasteryData(matiereCode, data);
  }
  // Planifier la révision espacée si maîtrisé
  if (pct >= MASTERY_THRESHOLD) {
    scheduleSpacedReview(matiereCode, seanceId);
  }
  return pct;
}
export function isSeanceUnlocked(matiereCode, seanceId, seanceIndex) {
  if (seanceIndex === 0) return true; // Première séance toujours débloquée
  const data = getMasteryData(matiereCode);
  const prevId = seanceId; // On vérifie la séance précédente
  // On cherche la séance d'index précédent
  return true; // placeholder — sera vérifié par le composant avec les vrais IDs
}
export function getSeanceMastery(matiereCode, seanceId) {
  const data = getMasteryData(matiereCode);
  return data[seanceId] || null;
}

// ─── HELPERS : révision espacée ───
const INTERVALS = [1, 3, 7, 21]; // jours
function getSpacedQueue() {
  try { return JSON.parse(localStorage.getItem("spaced_queue") || "[]"); } catch { return []; }
}
function saveSpacedQueue(q) {
  try { localStorage.setItem("spaced_queue", JSON.stringify(q)); } catch {}
}
function scheduleSpacedReview(matiereCode, seanceId) {
  const queue = getSpacedQueue();
  const today = new Date();
  // Ne pas dupliquer les entrées déjà planifiées
  const existing = queue.filter(r => r.matiere === matiereCode && r.seance === seanceId);
  const scheduledIntervals = existing.map(r => r.interval);
  INTERVALS.forEach(days => {
    if (!scheduledIntervals.includes(days)) {
      const reviewDate = new Date(today);
      reviewDate.setDate(reviewDate.getDate() + days);
      queue.push({
        matiere: matiereCode,
        seance: seanceId,
        interval: days,
        reviewDate: reviewDate.toISOString().split("T")[0],
        done: false
      });
    }
  });
  saveSpacedQueue(queue);
}
export function markReviewDone(matiereCode, seanceId, interval) {
  const queue = getSpacedQueue();
  const idx = queue.findIndex(r => r.matiere === matiereCode && r.seance === seanceId && r.interval === interval && !r.done);
  if (idx >= 0) queue[idx].done = true;
  saveSpacedQueue(queue);
}

// ══════════════════════════════════════════════════════
// 1. VERROU DE MAÎTRISE — Indicateur visuel par séance
// ══════════════════════════════════════════════════════
export function MasteryGate({ matiereCode, seances, onSelectSeance, currentProgress }) {
  const [mastery, setMastery] = useState({});
  useEffect(() => { setMastery(getMasteryData(matiereCode)); }, [matiereCode]);

  const isUnlocked = (idx) => {
    if (idx === 0) return true;
    const prevSeance = seances[idx - 1];
    const prev = mastery[prevSeance.id];
    if (!prev) return false;
    return prev.pct >= MASTERY_THRESHOLD;
  };

  return (
    <div>
      {seances.map((s, i) => {
        const unlocked = isUnlocked(i);
        const m = mastery[s.id];
        const pct = m ? m.pct : 0;
        const done = currentProgress ? 
          [currentProgress(s.id,"lessons"), currentProgress(s.id,"exercises"), currentProgress(s.id,"quiz")] : [false,false,false];
        const completedCount = done.filter(Boolean).length;

        return (
          <div key={s.id}
            onClick={() => unlocked && onSelectSeance(i)}
            style={{
              background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 10,
              cursor: unlocked ? "pointer" : "not-allowed",
              opacity: unlocked ? 1 : 0.5,
              borderLeft: `4px solid ${!unlocked ? "#64748b" : pct >= MASTERY_THRESHOLD ? "#22c55e" : completedCount > 0 ? "#f59e0b" : "#334155"}`
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, color: "#818cf8", fontWeight: 600 }}>Séance {s.id}</span>
                  {!unlocked && <span style={{ fontSize: 11, background: "rgba(239,68,68,.15)", color: "#f87171", padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>🔒 Score &lt; 70%</span>}
                  {unlocked && m && pct >= MASTERY_THRESHOLD && <span style={{ fontSize: 11, background: "rgba(34,197,94,.15)", color: "#22c55e", padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>✓ Maîtrisé {pct}%</span>}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.title}</div>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {["📖","✏️","🧪"].map((e,j) => <span key={j} style={{ fontSize: 16, opacity: done[j] ? 1 : 0.3 }}>{e}</span>)}
              </div>
            </div>
            {unlocked && m && pct < MASTERY_THRESHOLD && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#fbbf24", background: "rgba(251,191,36,.08)", padding: "6px 10px", borderRadius: 8 }}>
                ⚠️ Score actuel : {pct}% — Refais les exercices pour atteindre 70% et débloquer la suite
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 2. PLANIFICATEUR DE RÉVISION ESPACÉE (J+1/3/7/21)
// ══════════════════════════════════════════════════════
export function SpacedRevision({ matiereCode, seances, onGoToSeance }) {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const queue = getSpacedQueue();
    const today = new Date().toISOString().split("T")[0];
    const due = queue.filter(r => r.matiere === matiereCode && !r.done && r.reviewDate <= today);
    setReviews(due);
  }, [matiereCode]);

  if (reviews.length === 0) return null;

  const labelInterval = (d) => d === 1 ? "J+1" : d === 3 ? "J+3" : d === 7 ? "J+7" : "J+21";

  return (
    <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16, border: "2px solid #f59e0b" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>🔄</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#fbbf24" }}>Révisions du jour (récupération espacée)</span>
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
        La science montre que réviser à J+1, J+3, J+7 et J+21 ancre la mémoire à long terme.
      </div>
      {reviews.map((r, i) => {
        const seance = seances.find(s => s.id === r.seance);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#0f172a", borderRadius: 10, marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", marginRight: 8 }}>{labelInterval(r.interval)}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Séance {r.seance}{seance ? ` — ${seance.title}` : ""}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => onGoToSeance && onGoToSeance(seances.findIndex(s => s.id === r.seance))}
                style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                Réviser
              </button>
              <button onClick={() => { markReviewDone(r.matiere, r.seance, r.interval); setReviews(rv => rv.filter((_, j) => j !== i)); }}
                style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: "rgba(34,197,94,.15)", color: "#22c55e", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                ✓ Fait
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 3. WIDGET AUTOMATISMES MATHS (5 min / jour)
// ══════════════════════════════════════════════════════
const AUTOMATISMES = [
  // Calcul mental
  { q: "7 × 8 = ?", a: "56", cat: "Calcul mental" },
  { q: "15² = ?", a: "225", cat: "Calcul mental" },
  { q: "√144 = ?", a: "12", cat: "Calcul mental" },
  { q: "3/4 + 1/3 = ?", a: "13/12", cat: "Fractions" },
  { q: "2/5 × 5/6 = ?", a: "1/3", cat: "Fractions" },
  // Identités remarquables
  { q: "(x+3)² = ?", a: "x²+6x+9", cat: "Identités" },
  { q: "(2x−1)² = ?", a: "4x²-4x+1", cat: "Identités" },
  { q: "(x+5)(x−5) = ?", a: "x²-25", cat: "Identités" },
  // Second degré
  { q: "Δ de x²−5x+6 = ?", a: "1", cat: "Second degré" },
  { q: "Racines de x²−5x+6 ?", a: "2 et 3", cat: "Second degré" },
  { q: "Sommet de x²−4x+3 : x = ?", a: "2", cat: "Second degré" },
  // Dérivation (à venir)
  { q: "f(x) = 3x² + 2x, f'(x) = ?", a: "6x+2", cat: "Dérivation" },
  { q: "f(x) = x³, f'(x) = ?", a: "3x²", cat: "Dérivation" },
  { q: "f(x) = 5x − 7, f'(x) = ?", a: "5", cat: "Dérivation" },
  // Probabilités
  { q: "P(A∪B) si P(A)=0.3, P(B)=0.5, P(A∩B)=0.1 ?", a: "0.7", cat: "Probabilités" },
  { q: "P(A|B) si P(A∩B)=0.2 et P(B)=0.4 ?", a: "0.5", cat: "Probabilités" },
  // Suites
  { q: "u₀=3, r=5, u₁₀ d'une suite arithmétique ?", a: "53", cat: "Suites" },
  { q: "u₀=2, q=3, u₄ d'une suite géométrique ?", a: "162", cat: "Suites" },
  // Exponentielle
  { q: "e⁰ = ?", a: "1", cat: "Exponentielle" },
  { q: "e^(a+b) = ?", a: "e^a × e^b", cat: "Exponentielle" },
];

export function AutomatismesWidget({ onFinish }) {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null); // true/false/null
  const [score, setScore] = useState({ ok: 0, ko: 0 });
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  const start = () => {
    // Mélanger et prendre 10 questions
    const shuffled = [...AUTOMATISMES].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setQi(0); setInput(""); setResult(null);
    setScore({ ok: 0, ko: 0 });
    setTimeLeft(300);
    setFinished(false);
    setStarted(true);
  };

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  const check = () => {
    if (!input.trim()) return;
    const q = questions[qi];
    // Normalisation simple
    const norm = s => s.toLowerCase().replace(/\s+/g, "").replace(/,/g, ".").replace(/[×]/g, "*");
    const ok = norm(input) === norm(q.a) || input.trim().toLowerCase() === q.a.toLowerCase();
    setResult(ok);
    setScore(s => ok ? { ...s, ok: s.ok + 1 } : { ...s, ko: s.ko + 1 });
    // Log
    try {
      const today = new Date().toISOString().split("T")[0];
      const log = JSON.parse(localStorage.getItem("automatismes_log") || "{}");
      if (!log[today]) log[today] = [];
      log[today].push({ q: q.q, ok, cat: q.cat, ts: Date.now() });
      localStorage.setItem("automatismes_log", JSON.stringify(log));
    } catch {}
  };

  const next = () => {
    if (qi < questions.length - 1) {
      setQi(qi + 1); setInput(""); setResult(null);
    } else {
      setFinished(true);
    }
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  // Vérifier si déjà fait aujourd'hui
  const todayDone = (() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const log = JSON.parse(localStorage.getItem("automatismes_log") || "{}");
      return (log[today] || []).length >= 5;
    } catch { return false; }
  })();

  if (!started) return (
    <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16, border: todayDone ? "2px solid #22c55e" : "2px solid #ec4899" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>🧮</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#ec4899" }}>Automatismes Maths — 5 min/jour</span>
        {todayDone && <span style={{ fontSize: 11, background: "rgba(34,197,94,.15)", color: "#22c55e", padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>✓ Fait</span>}
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
        Calcul mental sans calculatrice. 10 questions en 5 minutes. Comme au bac.
      </div>
      <button onClick={start}
        style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "#ec4899", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        {todayDone ? "🔄 Refaire une série" : "🚀 Lancer les automatismes"}
      </button>
    </div>
  );

  if (finished) {
    const total = score.ok + score.ko;
    const pct = total > 0 ? Math.round(score.ok / total * 100) : 0;
    return (
      <div style={{ background: "#1e293b", borderRadius: 14, padding: 20, marginBottom: 16, border: "2px solid #ec4899", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "💪"}</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{score.ok}/{total}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: pct >= 80 ? "#22c55e" : pct >= 60 ? "#fbbf24" : "#f87171", marginTop: 4 }}>
          {pct >= 80 ? "Excellent ! Réflexes au point." : pct >= 60 ? "Pas mal — continue chaque jour." : "À travailler — reviens demain."}
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Temps restant : {mm}:{ss}</div>
        <button onClick={start}
          style={{ marginTop: 12, padding: "10px 20px", borderRadius: 10, border: "none", background: "#ec4899", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          Relancer
        </button>
      </div>
    );
  }

  const q = questions[qi];
  return (
    <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16, border: "2px solid #ec4899" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#ec4899" }}>🧮 Automatismes — {q.cat}</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{qi + 1}/{questions.length}</span>
          <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: timeLeft < 60 ? "#ef4444" : "#e2e8f0" }}>{mm}:{ss}</span>
        </div>
      </div>
      <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, marginBottom: 10, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{q.q}</div>
      </div>
      {result === null ? (
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && check()}
            placeholder="Ta réponse..." autoFocus
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 14 }} />
          <button onClick={check}
            style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#ec4899", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            OK
          </button>
        </div>
      ) : (
        <div>
          <div style={{ padding: 10, borderRadius: 8, background: result ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)", border: `1px solid ${result ? "#22c55e" : "#ef4444"}`, marginBottom: 8, textAlign: "center" }}>
            <span style={{ fontWeight: 700, color: result ? "#22c55e" : "#ef4444" }}>
              {result ? "✓ Correct !" : `✗ Réponse : ${q.a}`}
            </span>
          </div>
          <button onClick={next}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            {qi < questions.length - 1 ? "Question suivante →" : "Voir le score"}
          </button>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#22c55e" }}>✓ {score.ok}</div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#ef4444" }}>✗ {score.ko}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 4. FLASHCARDS DE RÉVISION (gardé, amélioré)
// ══════════════════════════════════════════════════════
export function RevisionFlash({ matiere, matiereCode }) {
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [scores, setScores] = useState({ ok: 0, ko: 0 });

  useEffect(() => {
    try {
      const log = JSON.parse(localStorage.getItem("difficulties_log") || "{}");
      const errors = [];
      const now = new Date();
      Object.entries(log).forEach(([date, mats]) => {
        const daysDiff = Math.floor((now - new Date(date)) / 86400000);
        if (daysDiff <= 14 && mats[matiere]) {
          mats[matiere].filter(e => e.type === "exercice").forEach(e => {
            errors.push({ q: e.question, a: e.correctAnswer, hint: e.hint, seance: e.seance, date, age: daysDiff });
          });
        }
      });
      errors.sort((a, b) => a.age - b.age);
      const unique = []; const seen = new Set();
      errors.forEach(e => { if (!seen.has(e.q)) { seen.add(e.q); unique.push(e); } });
      setCards(unique.slice(0, 8));
    } catch {}
  }, [matiere]);

  if (cards.length === 0) return null;
  if (done) return (
    <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 12, border: "1px solid #334155", textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>🔄 Révision terminée</div>
      <div style={{ fontSize: 13, color: "#94a3b8" }}>{scores.ok} maîtrisé{scores.ok > 1 ? "s" : ""} · {scores.ko} à revoir</div>
    </div>
  );

  const card = cards[idx];
  return (
    <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 12, border: "1px solid #f59e0b" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>🔄 Erreurs récentes</span>
        <span style={{ fontSize: 11, color: "#64748b" }}>{idx + 1}/{cards.length}</span>
      </div>
      <div onClick={() => setFlipped(!flipped)}
        style={{ background: "#0f172a", borderRadius: 10, padding: 16, minHeight: 80, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #334155" }}>
        {!flipped ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>{card.q}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Tape pour voir la réponse</div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#4ade80", marginBottom: 4 }}>{card.a}</div>
            {card.hint && <div style={{ fontSize: 11, color: "#fbbf24" }}>💡 {card.hint}</div>}
          </div>
        )}
      </div>
      {flipped && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={() => { setScores(s => ({ ...s, ok: s.ok + 1 })); setFlipped(false); if (idx < cards.length - 1) setIdx(idx + 1); else setDone(true); }}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: "rgba(34,197,94,.15)", color: "#4ade80", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            ✅ Je maîtrise
          </button>
          <button onClick={() => { setScores(s => ({ ...s, ko: s.ko + 1 })); setFlipped(false); if (idx < cards.length - 1) setIdx(idx + 1); else setDone(true); }}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: "rgba(239,68,68,.15)", color: "#f87171", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            ❌ À revoir
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 5. SCORE DE SESSION (gardé)
// ══════════════════════════════════════════════════════
export function SessionScore({ attempted, correct, startTime }) {
  if (attempted === 0) return null;
  const pct = Math.round((correct / attempted) * 100);
  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 60000) : 0;
  const quality = pct >= 80 ? "Excellente" : pct >= 60 ? "Bonne" : pct >= 40 ? "À améliorer" : "Difficile";
  const qColor = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : pct >= 40 ? "#f97316" : "#ef4444";
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "👍" : pct >= 40 ? "💪" : "📚";

  return (
    <div style={{ background: "#1e293b", borderRadius: 14, padding: 14, marginTop: 12, border: `1px solid ${qColor}40` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{emoji} Score de session</span>
        <span style={{ fontSize: 11, color: "#64748b" }}>{elapsed} min</span>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${qColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: qColor }}>{pct}%</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: qColor, marginBottom: 2 }}>{quality}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{correct}/{attempted} exercices réussis</div>
          <div style={{ height: 4, borderRadius: 2, background: "#334155", marginTop: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, background: qColor, width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 6. TABLEAU DE BORD — Répartition du temps
// ══════════════════════════════════════════════════════
export function TimeDistributionAlert() {
  const [data, setData] = useState(null);
  useEffect(() => {
    try {
      const log = JSON.parse(localStorage.getItem("activity_log") || "{}");
      const now = new Date();
      const counts = {};
      // 7 derniers jours
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        if (log[key]) {
          Object.keys(log[key]).forEach(m => {
            counts[m] = (counts[m] || 0) + 1;
          });
        }
      }
      if (Object.keys(counts).length > 0) setData(counts);
    } catch {}
  }, []);

  if (!data) return null;

  const frMa = (data["FR"] || 0) + (data["MA"] || 0);
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const frMaPct = total > 0 ? Math.round(frMa / total * 100) : 0;
  const isBalanced = frMaPct >= 50; // FR+MA devraient représenter au moins 50% du temps

  return (
    <div style={{ background: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 12, border: `1px solid ${isBalanced ? "#22c55e40" : "#ef444440"}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#e2e8f0" }}>📊 Répartition semaine</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
        {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([m, c]) => {
          const colors = { FR: "#3b82f6", MA: "#ec4899", SE: "#10b981", HG: "#f59e0b", HI: "#f97316", AN: "#6366f1", ES: "#ef4444", SC: "#14b8a6", EM: "#a855f7" };
          const names = { FR: "Fr", MA: "Ma", SE: "SES", HG: "HG", HI: "HGéo", AN: "Ang", ES: "Esp", SC: "Sci", EM: "EMC" };
          return (
            <div key={m} style={{ padding: "4px 10px", borderRadius: 8, background: `${colors[m] || "#334155"}20`, color: colors[m] || "#94a3b8", fontSize: 11, fontWeight: 700 }}>
              {names[m] || m} {c}
            </div>
          );
        })}
      </div>
      {!isBalanced && (
        <div style={{ fontSize: 12, color: "#fbbf24", background: "rgba(251,191,36,.08)", padding: "6px 10px", borderRadius: 8 }}>
          ⚠️ Français + Maths = {frMaPct}% du temps. Objectif : &gt;50% (coeff. les plus élevés)
        </div>
      )}
    </div>
  );
}
