"use client";
import { useState, useEffect, useRef } from "react";

// ── Banque d'automatismes — Exercices type bac (sans calculatrice) ──
const BANQUE = [
  // CALCUL MENTAL
  { q: "7 × 13 = ?", a: "91", cat: "Calcul mental" },
  { q: "256 ÷ 8 = ?", a: "32", cat: "Calcul mental" },
  { q: "15² = ?", a: "225", cat: "Calcul mental" },
  { q: "√196 = ?", a: "14", cat: "Calcul mental" },
  { q: "11² = ?", a: "121", cat: "Calcul mental" },
  { q: "0,75 × 40 = ?", a: "30", cat: "Calcul mental" },
  { q: "3/4 de 80 = ?", a: "60", cat: "Calcul mental" },
  { q: "2³ × 3² = ?", a: "72", cat: "Calcul mental" },
  // FRACTIONS
  { q: "3/4 + 1/3 = ?", a: "13/12", cat: "Fractions" },
  { q: "2/5 × 5/6 = ?", a: "1/3", cat: "Fractions" },
  { q: "7/8 − 1/2 = ?", a: "3/8", cat: "Fractions" },
  { q: "3/4 ÷ 2/3 = ?", a: "9/8", cat: "Fractions" },
  { q: "5/6 + 1/4 = ?", a: "13/12", cat: "Fractions" },
  // IDENTITÉS REMARQUABLES
  { q: "(x+3)² = ?", a: "x²+6x+9", cat: "Identités remarquables" },
  { q: "(2x−1)² = ?", a: "4x²-4x+1", cat: "Identités remarquables" },
  { q: "(x+5)(x−5) = ?", a: "x²-25", cat: "Identités remarquables" },
  { q: "(3x+2)² = ?", a: "9x²+12x+4", cat: "Identités remarquables" },
  { q: "(x−7)(x+7) = ?", a: "x²-49", cat: "Identités remarquables" },
  { q: "Factoriser x²−16 = ?", a: "(x-4)(x+4)", cat: "Identités remarquables" },
  { q: "Factoriser 4x²+4x+1 = ?", a: "(2x+1)²", cat: "Identités remarquables" },
  // SECOND DEGRÉ
  { q: "Δ de x²−5x+6 = ?", a: "1", cat: "Second degré" },
  { q: "Racines de x²−5x+6 ?", a: "2 et 3", cat: "Second degré" },
  { q: "Δ de 2x²+3x−2 = ?", a: "25", cat: "Second degré" },
  { q: "Signe de x²−4 pour x=0 ?", a: "négatif", cat: "Second degré" },
  { q: "Sommet de f(x)=x²−6x+5 : x=?", a: "3", cat: "Second degré" },
  { q: "Forme canonique de x²−4x+3 ?", a: "(x-2)²-1", cat: "Second degré" },
  // DÉRIVATION
  { q: "f(x) = 3x² + 2x, f'(x) = ?", a: "6x+2", cat: "Dérivation" },
  { q: "f(x) = x³, f'(x) = ?", a: "3x²", cat: "Dérivation" },
  { q: "f(x) = 5x − 7, f'(x) = ?", a: "5", cat: "Dérivation" },
  { q: "f(x) = 1/x, f'(x) = ?", a: "-1/x²", cat: "Dérivation" },
  { q: "f(x) = √x, f'(x) = ?", a: "1/(2√x)", cat: "Dérivation" },
  { q: "f(x) = 4x³ − x, f'(x) = ?", a: "12x²-1", cat: "Dérivation" },
  // PROBABILITÉS
  { q: "P(A∪B) si P(A)=0.3, P(B)=0.5, P(A∩B)=0.1 ?", a: "0.7", cat: "Probabilités" },
  { q: "P(A|B) si P(A∩B)=0.2 et P(B)=0.4 ?", a: "0.5", cat: "Probabilités" },
  { q: "P(Ā) si P(A)=0.35 ?", a: "0.65", cat: "Probabilités" },
  // SUITES
  { q: "u₀=3, r=5, u₁₀ (arithmétique) ?", a: "53", cat: "Suites" },
  { q: "u₀=2, q=3, u₄ (géométrique) ?", a: "162", cat: "Suites" },
  { q: "Somme 1+2+...+100 = ?", a: "5050", cat: "Suites" },
  { q: "S = u₀(1−qⁿ)/(1−q), avec u₀=1, q=2, n=5 ?", a: "31", cat: "Suites" },
  // EXPONENTIELLE
  { q: "e⁰ = ?", a: "1", cat: "Exponentielle" },
  { q: "eᵃ × eᵇ = ?", a: "e^(a+b)", cat: "Exponentielle" },
  { q: "eᵃ / eᵇ = ?", a: "e^(a-b)", cat: "Exponentielle" },
  { q: "(eᵃ)² = ?", a: "e^(2a)", cat: "Exponentielle" },
  // PRODUIT SCALAIRE
  { q: "ū·v̄ si ||ū||=3, ||v̄||=4, angle=60° ?", a: "6", cat: "Produit scalaire" },
  { q: "ū⊥v̄ ⟺ ū·v̄ = ?", a: "0", cat: "Produit scalaire" },
];

function normalizeCalc(s) {
  if (!s) return "";
  return s.toLowerCase()
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\u00B2/g, "²")
    .replace(/\*\*/g, "^")
    .replace(/negatif/g, "négatif")
    .trim();
}

export default function AutomatismesPage() {
  const [mode, setMode] = useState("menu"); // menu | playing | results
  const [cat, setCat] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ ok: 0, ko: 0, details: [] });
  const [timeLeft, setTimeLeft] = useState(300);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Historique
  const [history, setHistory] = useState([]);
  useEffect(() => {
    try {
      const log = JSON.parse(localStorage.getItem("automatismes_log") || "{}");
      const days = Object.entries(log).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);
      setHistory(days.map(([date, items]) => ({
        date,
        total: items.length,
        ok: items.filter(i => i.ok).length
      })));
    } catch {}
  }, [mode]);

  const categories = [...new Set(BANQUE.map(b => b.cat))];

  const start = () => {
    const pool = cat === "all" ? BANQUE : BANQUE.filter(b => b.cat === cat);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setQi(0); setInput(""); setResult(null);
    setScore({ ok: 0, ko: 0, details: [] });
    setTimeLeft(300);
    setMode("playing");
  };

  useEffect(() => {
    if (mode !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setMode("results"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [mode]);

  useEffect(() => {
    if (mode === "playing" && result === null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [qi, result, mode]);

  const check = () => {
    if (!input.trim()) return;
    const q = questions[qi];
    const userNorm = normalizeCalc(input);
    const correctNorm = normalizeCalc(q.a);
    const ok = userNorm === correctNorm || input.trim().toLowerCase() === q.a.toLowerCase();
    setResult(ok);
    const newScore = {
      ...score,
      ok: score.ok + (ok ? 1 : 0),
      ko: score.ko + (ok ? 0 : 1),
      details: [...score.details, { q: q.q, a: q.a, user: input.trim(), ok, cat: q.cat }]
    };
    setScore(newScore);
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
      clearInterval(timerRef.current);
      setMode("results");
    }
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDone = history.find(h => h.date === todayStr);

  // ── MENU ──
  if (mode === "menu") return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <a href="/cours" style={{ fontSize: 22, color: "#94a3b8", textDecoration: "none" }}>←</a>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>🧮 Automatismes Maths</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>5 min/jour · Sans calculatrice · Format bac</div>
        </div>
      </div>

      {todayDone && (
        <div style={{ background: "rgba(34,197,94,.1)", borderRadius: 14, padding: 14, marginBottom: 16, border: "1px solid #22c55e40" }}>
          <span style={{ fontWeight: 700, color: "#22c55e" }}>✓ Aujourd'hui : {todayDone.ok}/{todayDone.total}</span>
        </div>
      )}

      <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Catégorie</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <div onClick={() => setCat("all")}
            style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", background: cat === "all" ? "#ec4899" : "#0f172a", color: cat === "all" ? "#fff" : "#94a3b8" }}>
            Tout ({BANQUE.length})
          </div>
          {categories.map(c => {
            const n = BANQUE.filter(b => b.cat === c).length;
            return (
              <div key={c} onClick={() => setCat(c)}
                style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", background: cat === c ? "#ec4899" : "#0f172a", color: cat === c ? "#fff" : "#94a3b8" }}>
                {c} ({n})
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={start}
        style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: "linear-gradient(135deg,#ec4899,#f43f5e)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", marginBottom: 20 }}>
        🚀 Lancer — 10 questions en 5 min
      </button>

      {history.length > 0 && (
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>📈 Historique</div>
          {history.map(h => {
            const pct = h.total > 0 ? Math.round(h.ok / h.total * 100) : 0;
            return (
              <div key={h.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #334155" }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{h.date}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 70 ? "#22c55e" : "#f59e0b" }}>{h.ok}/{h.total}</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ background: "rgba(236,72,153,.08)", borderRadius: 14, padding: 14, marginTop: 16, border: "1px solid rgba(236,72,153,.2)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#ec4899", marginBottom: 4 }}>💡 Pourquoi chaque jour ?</div>
        <div style={{ fontSize: 12, color: "#f9a8d4", lineHeight: 1.6 }}>
          L'épreuve du bac = QCM automatismes (6 pts / 20) sans calculatrice. La rapidité et la précision se construisent par la répétition quotidienne.
        </div>
      </div>
    </div>
  );

  // ── RÉSULTATS ──
  if (mode === "results") {
    const total = score.ok + score.ko;
    const pct = total > 0 ? Math.round(score.ok / total * 100) : 0;
    const byCat = {};
    score.details.forEach(d => {
      if (!byCat[d.cat]) byCat[d.cat] = { ok: 0, ko: 0 };
      if (d.ok) byCat[d.cat].ok++; else byCat[d.cat].ko++;
    });

    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px 16px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "💪"}</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{score.ok}/{total}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: pct >= 80 ? "#22c55e" : pct >= 60 ? "#fbbf24" : "#f87171", marginTop: 4 }}>
            {pct >= 80 ? "Réflexes au point !" : pct >= 60 ? "Progresse — continue." : "À travailler quotidiennement."}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Temps : {5 - Math.ceil(timeLeft / 60)} min {timeLeft > 0 ? `(${mm}:${ss} restant)` : "(temps écoulé)"}</div>
        </div>

        <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Par catégorie</div>
          {Object.entries(byCat).map(([c, v]) => (
            <div key={c} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ fontSize: 13 }}>{c}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: v.ko === 0 ? "#22c55e" : "#f59e0b" }}>{v.ok}/{v.ok + v.ko}</span>
            </div>
          ))}
        </div>

        {score.details.filter(d => !d.ok).length > 0 && (
          <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid rgba(239,68,68,.2)" }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: "#fca5a5" }}>❌ À revoir</div>
            {score.details.filter(d => !d.ok).map((d, i) => (
              <div key={i} style={{ marginBottom: 8, padding: 10, background: "#0f172a", borderRadius: 8, fontSize: 13 }}>
                <div style={{ fontWeight: 600 }}>{d.q}</div>
                <div style={{ color: "#ef4444", fontSize: 12 }}>Ta réponse : {d.user}</div>
                <div style={{ color: "#22c55e", fontSize: 12 }}>Bonne réponse : {d.a}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setMode("menu"); }}
            style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: "#334155", color: "#e2e8f0", fontWeight: 700, cursor: "pointer" }}>
            ← Menu
          </button>
          <button onClick={start}
            style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: "#ec4899", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            🔄 Relancer
          </button>
        </div>
      </div>
    );
  }

  // ── JEU ──
  const q = questions[qi];
  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#ec4899" }}>{q.cat}</span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>{qi + 1}/{questions.length}</span>
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: timeLeft < 60 ? "#ef4444" : "#e2e8f0" }}>{mm}:{ss}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, textAlign: "center", padding: 8, borderRadius: 8, background: "rgba(34,197,94,.1)", color: "#22c55e", fontWeight: 700 }}>✓ {score.ok}</div>
        <div style={{ flex: 1, textAlign: "center", padding: 8, borderRadius: 8, background: "rgba(239,68,68,.1)", color: "#ef4444", fontWeight: 700 }}>✗ {score.ko}</div>
      </div>

      <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, marginBottom: 16, textAlign: "center", minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{q.q}</div>
      </div>

      {result === null ? (
        <div style={{ display: "flex", gap: 8 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && check()}
            placeholder="Ta réponse..." autoFocus autoComplete="off"
            style={{ flex: 1, padding: 14, borderRadius: 12, border: "2px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 16, fontWeight: 600 }} />
          <button onClick={check}
            style={{ padding: "14px 20px", borderRadius: 12, border: "none", background: "#ec4899", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            OK
          </button>
        </div>
      ) : (
        <div>
          <div style={{ padding: 14, borderRadius: 12, background: result ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)", border: `2px solid ${result ? "#22c55e" : "#ef4444"}`, marginBottom: 10, textAlign: "center" }}>
            {result ? (
              <span style={{ fontWeight: 800, fontSize: 16, color: "#22c55e" }}>✓ Correct !</span>
            ) : (
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#ef4444", marginBottom: 4 }}>✗ Incorrect</div>
                <div style={{ fontSize: 14, color: "#94a3b8" }}>Réponse : <strong style={{ color: "#22c55e" }}>{q.a}</strong></div>
              </div>
            )}
          </div>
          <button onClick={next}
            style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            {qi < questions.length - 1 ? "Question suivante →" : "Voir le score"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
        {questions.map((_, i) => {
          const d = score.details[i];
          return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: !d ? "#334155" : d.ok ? "#22c55e" : "#ef4444" }} />;
        })}
      </div>
    </div>
  );
}
