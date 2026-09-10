"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const MATIERE_COLORS = {
  "Maths": "#818cf8", "Français": "#60a5fa", "SES": "#34d399", "HGGSP": "#fbbf24",
  "Histoire-Géographie": "#fb923c", "EMC": "#c084fc", "Enseignement Scientifique": "#2dd4bf",
  "Anglais": "#818cf8", "Espagnol": "#f87171"
};

function fmtDate(d) {
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function isoDate(d) { return d.toISOString().split("T")[0]; }

export default function RapportPage() {
  const [offset, setOffset] = useState(0);
  const [activityMatieres, setActivityMatieres] = useState([]);
  const [difficultiesByMatiere, setDifficultiesByMatiere] = useState({});
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const date = new Date(); date.setDate(date.getDate() - offset);
  const ds = isoDate(date);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [{ data: act }, { data: diff }] = await Promise.all([
        supabase.from("activity_log").select("matiere").eq("event_date", ds),
        supabase.from("difficulties_log").select("*").eq("event_date", ds).order("ts", { ascending: true }),
      ]);
      if (cancelled) return;
      setActivityMatieres((act || []).map(r => r.matiere));
      const grouped = {};
      (diff || []).forEach(row => {
        if (!grouped[row.matiere]) grouped[row.matiere] = [];
        grouped[row.matiere].push(row);
      });
      setDifficultiesByMatiere(grouped);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [ds]);

  const matieresToday = [...new Set([...activityMatieres, ...Object.keys(difficultiesByMatiere)])];

  const buildReportText = () => {
    let txt = `📋 RAPPORT DE TRAVAIL — ${fmtDate(date)}\n`;
    txt += `Élève : (Première générale)\n\n`;
    if (matieresToday.length === 0) {
      txt += "Aucune activité enregistrée ce jour.\n";
      return txt;
    }
    matieresToday.forEach(m => {
      txt += `━━━━━━━━━━━━━━━━━━━━\n${m}\n━━━━━━━━━━━━━━━━━━━━\n`;
      const diffs = difficultiesByMatiere[m] || [];
      const quizzes = diffs.filter(d => d.type === "quiz");
      const exos = diffs.filter(d => d.type === "exercice");
      if (activityMatieres.includes(m)) txt += `✓ Travail effectué aujourd'hui\n`;
      quizzes.forEach(q => { txt += `\n📊 Quiz "${q.seance}" : ${q.score}/${q.total}\n`; (q.wrong_questions || []).forEach(w => txt += `   ✗ ${w}\n`); });
      if (exos.length) {
        txt += `\n⚠️ Difficultés rencontrées (${exos.length}) :\n`;
        exos.forEach(e => { txt += `\n• [${e.seance}] ${e.question}\n  Réponse donnée : "${e.user_answer}"\n  Réponse attendue : "${e.correct_answer}"\n`; });
      }
      if (!quizzes.length && !exos.length) txt += `(cours lu, pas d'exercice/quiz réalisé)\n`;
      txt += `\n`;
    });
    return txt;
  };

  const copyReport = async () => {
    const txt = buildReportText();
    try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const shareReport = async () => {
    const txt = buildReportText();
    if (navigator.share) { try { await navigator.share({ title: "Rapport de travail", text: txt }); } catch {} }
    else copyReport();
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <a href="/" style={{ fontSize: 22, color: "#94a3b8", textDecoration: "none" }}>←</a>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>📋 Rapport de travail</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Pour le professeur particulier — synchronisé</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={() => setOffset(offset + 1)} style={{ padding: "8px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", cursor: "pointer", fontSize: 13 }}>← Veille</button>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13, textTransform: "capitalize" }}>{fmtDate(date)}</div>
        <button onClick={() => setOffset(Math.max(0, offset - 1))} disabled={offset === 0} style={{ padding: "8px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", cursor: "pointer", fontSize: 13, opacity: offset === 0 ? .3 : 1 }}>Suivant →</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={copyReport} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: copied ? "#22c55e" : "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{copied ? "✓ Copié !" : "📋 Copier le rapport"}</button>
        <button onClick={shareReport} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>📤 Partager</button>
      </div>

      {loading && <div style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>Chargement...</div>}

      {!loading && matieresToday.length === 0 && (
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, textAlign: "center", color: "#94a3b8" }}>
          Aucune activité enregistrée ce jour-là.
        </div>
      )}

      {!loading && matieresToday.map(m => {
        const col = MATIERE_COLORS[m] || "#6366f1";
        const diffs = difficultiesByMatiere[m] || [];
        const quizzes = diffs.filter(d => d.type === "quiz");
        const exos = diffs.filter(d => d.type === "exercice");
        return (
          <div key={m} style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 12, borderLeft: `4px solid ${col}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: col }}>{m}</div>
              {activityMatieres.includes(m) && <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>✓ Travaillé</span>}
            </div>

            {quizzes.map((q, i) => (
              <div key={i} style={{ marginBottom: 10, padding: 10, background: "rgba(99,102,241,.08)", borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>📊 Quiz — {q.seance}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: q.score >= q.total * 0.6 ? "#22c55e" : "#ef4444" }}>{q.score}/{q.total}</div>
                {(q.wrong_questions || []).length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    {q.wrong_questions.map((w, wi) => <div key={wi} style={{ fontSize: 11, color: "#fca5a5" }}>✗ {w}</div>)}
                  </div>
                )}
              </div>
            ))}

            {exos.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 6 }}>⚠️ {exos.length} difficulté(s)</div>
                {exos.map((e, i) => (
                  <div key={i} style={{ marginBottom: 8, padding: 10, background: "rgba(239,68,68,.08)", borderRadius: 8, fontSize: 12 }}>
                    <div style={{ color: "#94a3b8", fontSize: 10, marginBottom: 2 }}>{e.seance}</div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{e.question}</div>
                    <div style={{ color: "#fca5a5" }}>Réponse donnée : "{e.user_answer}"</div>
                    <div style={{ color: "#86efac" }}>Attendu : "{e.correct_answer}"</div>
                  </div>
                ))}
              </div>
            )}

            {quizzes.length === 0 && exos.length === 0 && (
              <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Cours consulté, pas d'exercice/quiz réalisé.</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
