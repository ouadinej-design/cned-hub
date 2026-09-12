"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const MATIERE_MAP = {
  MA: { nom: "Maths", color: "#ec4899", icon: "📐", cours: "/cours/maths" },
  FR: { nom: "Français", color: "#3b82f6", icon: "📖", cours: "/cours/francais" },
  SE: { nom: "SES", color: "#10b981", icon: "📊", cours: "/cours/ses" },
  HG: { nom: "HGGSP", color: "#f59e0b", icon: "🌍", cours: "/cours/hggsp" },
  HI: { nom: "Hist-Géo", color: "#f97316", icon: "🗺️", cours: "/cours/histgeo" },
  AN: { nom: "Anglais", color: "#6366f1", icon: "🇬🇧", cours: "/cours/anglais" },
  ES: { nom: "Espagnol", color: "#ef4444", icon: "🇪🇸", cours: "/cours/espagnol" },
  SC: { nom: "Ens.Sci", color: "#14b8a6", icon: "🔬", cours: "/cours/enssci" },
  EM: { nom: "EMC", color: "#a855f7", icon: "⚖️", cours: "/cours/emc" },
};

function getWeekDates() {
  const now = new Date();
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function getWeekData(matiereFull) {
  const dates = getWeekDates();
  const difficulties = [];
  const successes = [];
  try {
    const log = JSON.parse(localStorage.getItem("difficulties_log") || "{}");
    dates.forEach(date => {
      if (log[date] && log[date][matiereFull]) {
        log[date][matiereFull].forEach(entry => {
          if (entry.type === "exercice") {
            difficulties.push({ ...entry, date });
          } else if (entry.type === "quiz") {
            if (entry.score < entry.total * 0.8) {
              difficulties.push({ ...entry, date });
            } else {
              successes.push({ ...entry, date });
            }
          }
        });
      }
    });
  } catch {}

  // Also check attempts_log for successes
  try {
    const attempts = JSON.parse(localStorage.getItem("attempts_log") || "{}");
    dates.forEach(date => {
      if (attempts[date]) {
        Object.entries(attempts[date]).forEach(([mat, entries]) => {
          if (mat === matiereFull || mat === Object.entries(MATIERE_MAP).find(([k,v]) => v.nom === matiereFull)?.[0]) {
            (Array.isArray(entries) ? entries : []).forEach(e => {
              if (e.correct) successes.push({ ...e, date });
            });
          }
        });
      }
    });
  } catch {}

  return { difficulties, successes };
}

function BilanExercise({ exercise, index, color }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const check = () => {
    const a = answer.trim().toLowerCase().replace(/\s+/g, "");
    const c = exercise.reponse.trim().toLowerCase().replace(/\s+/g, "");
    const ok = a === c || a.includes(c) || c.includes(a);
    setResult(ok);
  };

  return (
    <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, border: `1px solid ${result === true ? "#22c55e" : result === false ? "#ef4444" : "#334155"}` }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <span style={{ background: exercise.type === "renforcement" ? "rgba(239,68,68,.15)" : "rgba(34,197,94,.15)", color: exercise.type === "renforcement" ? "#f87171" : "#4ade80", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
          {exercise.type === "renforcement" ? "🔄 RENFORCEMENT" : "🚀 DÉFI"}
        </span>
        {exercise.seance && <span style={{ fontSize: 10, color: "#64748b" }}>{exercise.seance}</span>}
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{exercise.question}</div>
      {result === null ? (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === "Enter" && check()}
              placeholder="Ta réponse..." style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 13 }} />
            <button onClick={check} disabled={!answer.trim()}
              style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: color, color: "#fff", fontWeight: 700, cursor: answer.trim() ? "pointer" : "not-allowed", opacity: answer.trim() ? 1 : 0.5 }}>Vérifier</button>
          </div>
          {exercise.indice && (
            <div onClick={() => setShowHint(!showHint)} style={{ fontSize: 12, color: "#fbbf24", cursor: "pointer" }}>
              {showHint ? `💡 ${exercise.indice}` : "💡 Voir l'indice"}
            </div>
          )}
        </>
      ) : result ? (
        <div style={{ padding: 10, borderRadius: 8, background: "rgba(34,197,94,.1)", border: "1px solid #22c55e", fontSize: 13, color: "#4ade80" }}>✅ Correct ! Bien joué.</div>
      ) : (
        <div style={{ padding: 10, borderRadius: 8, background: "rgba(239,68,68,.1)", border: "1px solid #ef4444", fontSize: 13 }}>
          <div style={{ color: "#f87171", marginBottom: 4 }}>❌ Pas tout à fait.</div>
          <div style={{ color: "#94a3b8" }}>Réponse attendue : <strong style={{ color: "#e2e8f0" }}>{exercise.reponse}</strong></div>
          {exercise.indice && <div style={{ color: "#fbbf24", marginTop: 4, fontSize: 12 }}>💡 {exercise.indice}</div>}
          <button onClick={() => { setResult(null); setAnswer(""); }} style={{ marginTop: 8, padding: "6px 14px", borderRadius: 6, border: "none", background: "#334155", color: "#e2e8f0", fontSize: 12, cursor: "pointer" }}>Réessayer</button>
        </div>
      )}
    </div>
  );
}

function BilanContent() {
  const searchParams = useSearchParams();
  const matCode = searchParams.get("matiere") || "MA";
  const mat = MATIERE_MAP[matCode] || MATIERE_MAP.MA;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [weekData, setWeekData] = useState(null);
  const [exercises, setExercises] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const data = getWeekData(mat.nom);
    setWeekData(data);
    setLoading(false);
  }, [mat.nom]);

  const generateBilan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const r = await fetch("/api/ai/corriger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bilan_semaine",
          matiere: mat.nom,
          exercices: weekData,
        }),
      });
      const d = await r.json();
      if (d.success && d.exercises) {
        setExercises(d.exercises);
      } else if (d.exercises) {
        setExercises(d.exercises);
      } else {
        setError("Le Prof IA n'a pas pu générer les exercices. Réessaie.");
      }
    } catch {
      setError("Erreur de connexion. Réessaie.");
    }
    setGenerating(false);
  };

  const nbDiff = weekData?.difficulties?.length || 0;
  const nbSucc = weekData?.successes?.length || 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <a href="/planning" style={{ fontSize: 20, color: "#94a3b8", textDecoration: "none" }}>←</a>
          <div>
            <div style={{ fontSize: 12, color: mat.color, fontWeight: 600 }}>BILAN DE LA SEMAINE</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{mat.icon} {mat.nom}</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Chargement...</div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, background: "#1e293b", borderRadius: 12, padding: 16, textAlign: "center", border: "1px solid #334155" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: nbDiff > 0 ? "#f87171" : "#4ade80" }}>{nbDiff}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Difficultés</div>
              </div>
              <div style={{ flex: 1, background: "#1e293b", borderRadius: 12, padding: 16, textAlign: "center", border: "1px solid #334155" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#4ade80" }}>{nbSucc}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Réussites</div>
              </div>
            </div>

            {/* Difficulties detail */}
            {nbDiff > 0 && (
              <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid rgba(239,68,68,.3)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#f87171", marginBottom: 10 }}>🔍 Points à revoir</div>
                {weekData.difficulties.map((d, i) => (
                  <div key={i} style={{ padding: 8, borderRadius: 8, background: "#0f172a", marginBottom: 6, fontSize: 12 }}>
                    {d.type === "exercice" ? (
                      <>
                        <div style={{ color: "#e2e8f0", marginBottom: 2 }}>{d.question}</div>
                        <div style={{ color: "#f87171" }}>Ta réponse : {d.userAnswer} → Attendu : {d.correctAnswer}</div>
                        <div style={{ color: "#64748b", fontSize: 11 }}>{d.seance} • {d.date}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ color: "#e2e8f0" }}>Quiz {d.seance} : {d.score}/{d.total}</div>
                        {d.wrongQuestions && <div style={{ color: "#f87171", fontSize: 11 }}>{d.wrongQuestions.join(" | ")}</div>}
                        <div style={{ color: "#64748b", fontSize: 11 }}>{d.date}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Generate button */}
            {!exercises && (
              <button onClick={generateBilan} disabled={generating}
                style={{ width: "100%", padding: 16, borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${mat.color}, ${mat.color}cc)`, color: "#fff", fontSize: 16, fontWeight: 800, cursor: generating ? "wait" : "pointer", opacity: generating ? 0.7 : 1, marginBottom: 16 }}>
                {generating ? "🤖 Le Prof IA prépare ton bilan..." : `🚀 Lancer le bilan ${mat.nom}`}
              </button>
            )}

            {error && <div style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,.1)", border: "1px solid #ef4444", color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</div>}

            {/* Exercises */}
            {exercises && (
              <>
                {exercises.filter(e => e.type === "renforcement").length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#f87171", marginBottom: 12 }}>🔄 Renforcement — Notions à retravailler</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {exercises.filter(e => e.type === "renforcement").map((ex, i) => (
                        <BilanExercise key={`r-${i}`} exercise={ex} index={i} color={mat.color} />
                      ))}
                    </div>
                  </div>
                )}

                {exercises.filter(e => e.type === "defi").length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#4ade80", marginBottom: 12 }}>🚀 Défis — Pousse-toi plus loin</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {exercises.filter(e => e.type === "defi").map((ex, i) => (
                        <BilanExercise key={`d-${i}`} exercise={ex} index={i} color={mat.color} />
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => { setExercises(null); }} style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px solid #334155", background: "transparent", color: "#94a3b8", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>
                  🔄 Générer un nouveau bilan
                </button>
              </>
            )}

            {/* Quick link back to course */}
            <a href={mat.cours} style={{ display: "block", textAlign: "center", padding: 14, borderRadius: 12, background: "#1e293b", border: "1px solid #334155", color: mat.color, fontWeight: 600, fontSize: 14, textDecoration: "none", marginBottom: 16 }}>
              {mat.icon} Retour au cours de {mat.nom}
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function BilanPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#0f172a", color:"#94a3b8", display:"flex", alignItems:"center", justifyContent:"center" }}>Chargement...</div>}>
      <BilanContent />
    </Suspense>
  );
}
