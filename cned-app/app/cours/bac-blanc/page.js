"use client";
import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════
// MODE BAC BLANC — Conditions réelles d'examen
// Français : 4h | Maths : 2h sans calculatrice
// ══════════════════════════════════════════════════════

const EPREUVES = {
  FR: {
    nom: "Français — Épreuve écrite",
    duree: 4 * 3600, // 4h
    coeff: "Coefficient 5",
    icon: "📖",
    color: "#3b82f6",
    consignes: [
      "Durée : 4 heures",
      "Vous traiterez AU CHOIX l'un des deux sujets : commentaire ou dissertation",
      "L'usage du dictionnaire n'est pas autorisé",
    ],
    sujets: [
      {
        id: "FR-1",
        title: "Bac blanc n°1 — Rimbaud, Les Cahiers de Douai",
        type: "commentaire",
        texte: "Vous commenterez le poème « Ma Bohème » d'Arthur Rimbaud (Les Cahiers de Douai, 1870).\n\nVous montrerez comment le poète transforme l'errance en expérience poétique.",
        bareme: "Introduction /4 — Développement structuré /12 — Conclusion /2 — Expression /2",
      },
      {
        id: "FR-2",
        title: "Bac blanc n°2 — La poésie, émancipation ?",
        type: "dissertation",
        texte: "La poésie est-elle une forme d'émancipation ?\n\nVous répondrez à cette question en vous appuyant sur les œuvres et textes étudiés pendant l'année, ainsi que sur votre culture personnelle.",
        bareme: "Introduction /3 — Thèse /5 — Antithèse /5 — Synthèse /5 — Expression /2",
      },
    ],
  },
  MA: {
    nom: "Mathématiques — Épreuve anticipée",
    duree: 2 * 3600, // 2h
    coeff: "Coefficient 2 — SANS CALCULATRICE",
    icon: "📐",
    color: "#ec4899",
    consignes: [
      "Durée : 2 heures",
      "L'usage de la calculatrice N'EST PAS autorisé",
      "Partie 1 : QCM Automatismes (6 points)",
      "Partie 2 : Exercices (14 points)",
    ],
    sujets: [
      {
        id: "MA-1",
        title: "Sujet type bac n°1 — Second degré & dérivation",
        type: "sujet complet",
        texte: "PARTIE 1 — QCM AUTOMATISMES (6 points)\nPour chaque question, une seule réponse est correcte.\n\n1. (x+3)² = ?\n   a) x²+9   b) x²+6x+9   c) x²+3x+9   d) 2x+6\n\n2. Le discriminant de 2x²−3x+1 vaut :\n   a) 1   b) −1   c) 5   d) 17\n\n3. f(x) = 3x²−2x+1, f'(x) = ?\n   a) 6x−2   b) 3x−2   c) 6x²−2   d) 6x+1\n\n4. L'équation x²−4 = 0 a pour solutions :\n   a) x=4   b) x=2   c) x=−2 et x=2   d) x=−4 et x=4\n\n5. La fonction f(x)=−x²+4x−3 a un maximum pour x = ?\n   a) 2   b) −2   c) 3   d) 4\n\n6. (2a−b)(2a+b) = ?\n   a) 4a²−b²   b) 4a²+b²   c) 2a²−b²   d) 4a−b\n\nPARTIE 2 — EXERCICES (14 points)\n\nExercice 1 (7 points) — Second degré\nSoit f(x) = x² − 6x + 5.\n1. Calculer le discriminant et les racines.\n2. Donner la forme canonique.\n3. Dresser le tableau de signes de f(x).\n4. En déduire l'ensemble des solutions de f(x) ≤ 0.\n\nExercice 2 (7 points) — Dérivation\nSoit g(x) = x³ − 3x² + 2.\n1. Calculer g'(x).\n2. Étudier le signe de g'(x).\n3. Dresser le tableau de variations de g.\n4. La tangente à la courbe au point d'abscisse 1 a pour équation y = ax + b. Déterminer a et b.",
        bareme: "QCM : 1 pt × 6 = 6 pts | Exercice 1 : 7 pts | Exercice 2 : 7 pts",
      },
      {
        id: "MA-2",
        title: "Sujet type bac n°2 — Probabilités & suites",
        type: "sujet complet",
        texte: "PARTIE 1 — QCM AUTOMATISMES (6 points)\n\n1. √(49) + √(16) = ?\n   a) √65   b) 11   c) 65   d) 13\n\n2. P(A∪B) = P(A)+P(B)−P(A∩B). Si P(A)=0.6 et P(B)=0.3 et A⊥B :\n   a) 0.72   b) 0.9   c) 0.18   d) 0.3\n\n3. u₀=5, r=−3. u₅ de la suite arithmétique = ?\n   a) −10   b) 20   c) −15   d) 8\n\n4. Factoriser 9x²−25 :\n   a) (3x−5)²   b) (3x+5)(3x−5)   c) (9x+5)(x−5)   d) (3x−5)(3x+25)\n\n5. Si f'(a) = 0 et f''(a) < 0, alors f(a) est :\n   a) un minimum   b) un maximum   c) un point d'inflexion   d) on ne peut pas conclure\n\n6. e^(ln2) = ?\n   a) ln2   b) 2   c) e²   d) 2e\n\nPARTIE 2 — EXERCICES (14 points)\n\nExercice 1 (7 points) — Probabilités\nUne urne contient 3 boules rouges et 5 boules bleues.\n1. On tire une boule. Calculer P(Rouge).\n2. On remet la boule et on tire à nouveau. Calculer P(2 rouges).\n3. Sans remise : calculer P(1 rouge puis 1 bleue).\n4. Construire l'arbre de probabilités pour 2 tirages sans remise.\n\nExercice 2 (7 points) — Suites\nSoit (uₙ) définie par u₀ = 2 et uₙ₊₁ = 3uₙ − 4.\n1. Calculer u₁, u₂, u₃.\n2. Conjecturer le sens de variation.\n3. Montrer que vₙ = uₙ − 2 est géométrique. Préciser la raison.\n4. Exprimer uₙ en fonction de n.",
        bareme: "QCM : 1 pt × 6 = 6 pts | Exercice 1 : 7 pts | Exercice 2 : 7 pts",
      },
    ],
  },
};

export default function BacBlancPage() {
  const [matiere, setMatiere] = useState(null);
  const [sujetIdx, setSujetIdx] = useState(null);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [notes, setNotes] = useState("");
  const timerRef = useRef(null);

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

  const hh = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const mm = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  // ── MENU ──
  if (!matiere) return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <a href="/cours" style={{ fontSize: 22, color: "#94a3b8", textDecoration: "none" }}>←</a>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>📝 Mode Bac Blanc</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Conditions réelles · Chronomètre · Barème officiel</div>
        </div>
      </div>

      <div style={{ background: "rgba(239,68,68,.08)", borderRadius: 14, padding: 14, marginBottom: 20, border: "1px solid rgba(239,68,68,.2)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fca5a5", marginBottom: 4 }}>⚠️ Conditions d'examen</div>
        <div style={{ fontSize: 12, color: "#fca5a5", lineHeight: 1.6 }}>
          Mets-toi en conditions réelles : pas de téléphone, pas d'aide, pas de pause. Le chronomètre tourne. C'est comme ça que tu progresseras.
        </div>
      </div>

      {Object.entries(EPREUVES).map(([key, ep]) => (
        <div key={key} onClick={() => setMatiere(key)}
          style={{ background: "#1e293b", borderRadius: 14, padding: 20, marginBottom: 12, cursor: "pointer", borderLeft: `4px solid ${ep.color}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{ep.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{ep.nom}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{ep.coeff}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{ep.sujets.length} sujet{ep.sujets.length > 1 ? "s" : ""} disponible{ep.sujets.length > 1 ? "s" : ""}</div>
            </div>
            <span style={{ color: ep.color, fontSize: 20, fontWeight: 700 }}>→</span>
          </div>
        </div>
      ))}

      <div style={{ background: "#1e293b", borderRadius: 14, padding: 14, marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>📊 Historique des bac blancs</div>
        {(() => {
          try {
            const log = JSON.parse(localStorage.getItem("bacblanc_log") || "[]");
            if (log.length === 0) return <div style={{ fontSize: 12, color: "#64748b" }}>Aucun bac blanc terminé</div>;
            return log.slice(-5).reverse().map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #334155", fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>{l.date} — {l.matiere} — {l.sujet}</span>
                <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{l.dureeMin} min</span>
              </div>
            ));
          } catch { return null; }
        })()}
      </div>
    </div>
  );

  const ep = EPREUVES[matiere];

  // ── CHOIX DU SUJET ──
  if (sujetIdx === null) return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span onClick={() => setMatiere(null)} style={{ fontSize: 22, color: "#94a3b8", cursor: "pointer" }}>←</span>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{ep.icon} {ep.nom}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{ep.coeff}</div>
        </div>
      </div>

      <div style={{ background: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>📋 Consignes</div>
        {ep.consignes.map((c, i) => (
          <div key={i} style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>• {c}</div>
        ))}
      </div>

      <div style={{ fontWeight: 700, marginBottom: 10 }}>Choisis un sujet</div>
      {ep.sujets.map((s, i) => (
        <div key={s.id} onClick={() => setSujetIdx(i)}
          style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 10, cursor: "pointer", borderLeft: `4px solid ${ep.color}` }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{s.title}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.type} · {s.bareme}</div>
        </div>
      ))}
    </div>
  );

  const sujet = ep.sujets[sujetIdx];

  // ── ÉPREUVE EN COURS ──
  if (!started) return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px 16px 80px" }}>
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{ep.icon}</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{sujet.title}</div>
        <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 4 }}>{ep.coeff}</div>
        <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>Durée : {Math.floor(ep.duree / 3600)}h</div>
        {matiere === "MA" && (
          <div style={{ background: "rgba(239,68,68,.1)", borderRadius: 12, padding: 12, marginBottom: 20, border: "1px solid rgba(239,68,68,.3)" }}>
            <div style={{ fontWeight: 700, color: "#fca5a5", fontSize: 14 }}>🚫 CALCULATRICE INTERDITE</div>
            <div style={{ fontSize: 12, color: "#fca5a5", marginTop: 4 }}>Range ton téléphone. Travaille uniquement sur papier.</div>
          </div>
        )}
        <button onClick={() => { setStarted(true); setTimeLeft(ep.duree); setFinished(false); setNotes(""); }}
          style={{ padding: "16px 40px", borderRadius: 14, border: "none", background: ep.color, color: "#fff", fontWeight: 800, fontSize: 18, cursor: "pointer" }}>
          🏁 Commencer l'épreuve
        </button>
      </div>
    </div>
  );

  // ── FINI ──
  if (finished) {
    const dureeMin = Math.round((ep.duree - timeLeft) / 60);
    // Log
    try {
      const log = JSON.parse(localStorage.getItem("bacblanc_log") || "[]");
      const today = new Date().toISOString().split("T")[0];
      if (!log.find(l => l.date === today && l.sujet === sujet.id)) {
        log.push({ date: today, matiere, sujet: sujet.id, dureeMin });
        localStorage.setItem("bacblanc_log", JSON.stringify(log));
      }
    } catch {}

    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px 16px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Épreuve terminée</div>
          <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>Durée : {dureeMin} min</div>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>📋 Barème de correction</div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{sujet.bareme}</div>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>💡 Prochaine étape</div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
            1. Corrige ta copie avec le barème ci-dessus{"\n"}
            2. Identifie tes erreurs principales{"\n"}
            3. Utilise le Prof IA pour comprendre les points difficiles{"\n"}
            4. Refais les parties ratées demain
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setMatiere(null); setSujetIdx(null); setStarted(false); }}
            style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: "#334155", color: "#e2e8f0", fontWeight: 700, cursor: "pointer" }}>
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  // ── ÉPREUVE ──
  const pctTime = ((ep.duree - timeLeft) / ep.duree) * 100;
  const urgent = timeLeft < 600; // 10 min

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Barre sticky */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#1e293b", padding: "10px 16px", borderBottom: `2px solid ${urgent ? "#ef4444" : ep.color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: ep.color }}>{sujet.type.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: urgent ? "#ef4444" : "#e2e8f0" }}>
              {hh}:{mm}:{ss}
            </span>
            <button onClick={() => setFinished(true)}
              style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: "rgba(239,68,68,.15)", color: "#f87171", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
              Terminer
            </button>
          </div>
        </div>
        <div style={{ height: 3, background: "#334155", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", background: urgent ? "#ef4444" : ep.color, width: `${pctTime}%`, transition: "width 1s linear" }} />
        </div>
      </div>

      {/* Sujet */}
      <div style={{ padding: "16px 16px 80px" }}>
        {matiere === "MA" && (
          <div style={{ background: "rgba(239,68,68,.08)", borderRadius: 10, padding: 10, marginBottom: 12, textAlign: "center", border: "1px solid rgba(239,68,68,.2)" }}>
            <span style={{ fontWeight: 700, color: "#fca5a5", fontSize: 12 }}>🚫 CALCULATRICE INTERDITE</span>
          </div>
        )}
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: ep.color }}>{sujet.title}</div>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "'Inter',system-ui,sans-serif", fontSize: 14, lineHeight: 1.8, margin: 0, color: "#e2e8f0" }}>
            {sujet.texte}
          </pre>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#94a3b8" }}>📝 Tes notes / brouillon</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Tu peux prendre des notes ici, mais écris ta copie sur papier..."
            style={{ width: "100%", minHeight: 150, padding: 12, borderRadius: 10, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 14, lineHeight: 1.6, resize: "vertical", boxSizing: "border-box" }} />
        </div>
      </div>
    </div>
  );
}
