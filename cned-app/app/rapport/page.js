"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const MATIERE_COLORS = {
  "Maths": "#818cf8", "Français": "#60a5fa", "SES": "#34d399", "HGGSP": "#fbbf24",
  "Histoire-Géographie": "#fb923c", "EMC": "#c084fc", "Enseignement Scientifique": "#2dd4bf",
  "Anglais": "#818cf8", "Espagnol": "#f87171"
};
const MATIERES_LIST = Object.keys(MATIERE_COLORS);

function fmtDate(d) {
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function isoDate(d) { return d.toISOString().split("T")[0]; }

export default function RapportPage() {
  const [mode, setMode] = useState("jour"); // "jour" | "prep"

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <a href="/" style={{ fontSize: 22, color: "#94a3b8", textDecoration: "none" }}>←</a>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>📋 Rapport de travail</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Suivi & préparation des séances</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        <div onClick={() => setMode("jour")} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, background: mode === "jour" ? "#6366f1" : "#1e293b", color: mode === "jour" ? "#fff" : "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>📅 Rapport du jour</div>
        <div onClick={() => setMode("prep")} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, background: mode === "prep" ? "#6366f1" : "#1e293b", color: mode === "prep" ? "#fff" : "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🎯 Préparer une séance</div>
      </div>

      {mode === "jour" ? <RapportJour /> : <PrepSeance />}
    </div>
  );
}

function RapportJour() {
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
    if (matieresToday.length === 0) { txt += "Aucune activité enregistrée ce jour.\n"; return txt; }
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

  const copyReport = async () => { const txt = buildReportText(); try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };
  const shareReport = async () => { const txt = buildReportText(); if (navigator.share) { try { await navigator.share({ title: "Rapport de travail", text: txt }); } catch {} } else copyReport(); };

  return (<div>
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
      <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, textAlign: "center", color: "#94a3b8" }}>Aucune activité enregistrée ce jour-là.</div>
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
              {(q.wrong_questions || []).length > 0 && (<div style={{ marginTop: 6 }}>{q.wrong_questions.map((w, wi) => <div key={wi} style={{ fontSize: 11, color: "#fca5a5" }}>✗ {w}</div>)}</div>)}
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
          {quizzes.length === 0 && exos.length === 0 && (<div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Cours consulté, pas d'exercice/quiz réalisé.</div>)}
        </div>
      );
    })}
  </div>);
}

function PrepSeance() {
  const [matiere, setMatiere] = useState("Maths");
  const [days, setDays] = useState(7);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchData = async () => {
    setLoading(true); setFetched(true);
    const since = new Date(); since.setDate(since.getDate() - days);
    const sinceStr = isoDate(since);
    const { data } = await supabase.from("difficulties_log").select("*").eq("matiere", matiere).gte("event_date", sinceStr).order("ts", { ascending: true });
    setRows(data || []);
    setLoading(false);
  };

  const quizzes = rows.filter(r => r.type === "quiz");
  const exos = rows.filter(r => r.type === "exercice");
  // group exos by "seance" to spot recurring weak spots
  const seanceCount = {};
  exos.forEach(e => { seanceCount[e.seance] = (seanceCount[e.seance] || 0) + 1; });
  const weakSeances = Object.entries(seanceCount).sort((a, b) => b[1] - a[1]);

  const buildMessage = () => {
    let txt = `Bonjour,\n\nAvant la prochaine séance de ${matiere}, voici les points sur lesquels mon fils a rencontré des difficultés ces ${days} derniers jours, pour préparer la séance :\n\n`;
    if (rows.length === 0) {
      txt += "Pas de difficulté particulière détectée récemment — RAS.\n";
    } else {
      if (weakSeances.length > 0) {
        txt += `📌 Notions à retravailler en priorité :\n`;
        weakSeances.forEach(([s, c]) => txt += `  • ${s} (${c} erreur${c > 1 ? "s" : ""})\n`);
        txt += `\n`;
      }
      if (exos.length > 0) {
        txt += `Détail des erreurs sur les exercices :\n`;
        exos.forEach(e => { txt += `\n• [${e.seance}] ${e.question}\n  → Il a répondu : "${e.user_answer}" au lieu de "${e.correct_answer}"\n`; });
        txt += `\n`;
      }
      if (quizzes.length > 0) {
        txt += `Résultats aux quiz :\n`;
        quizzes.forEach(q => { txt += `  • "${q.seance}" : ${q.score}/${q.total}\n`; (q.wrong_questions || []).forEach(w => txt += `     ✗ ${w}\n`); });
        txt += `\n`;
      }
    }
    txt += `Merci d'avance de vous concentrer sur ces points bloqués pendant la séance.\n\nCordialement`;
    return txt;
  };

  const copyMsg = async () => { const txt = buildMessage(); try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };
  const shareMsg = async () => { const txt = buildMessage(); if (navigator.share) { try { await navigator.share({ title: `Préparation séance ${matiere}`, text: txt }); } catch {} } else copyMsg(); };

  return (<div>
    <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Matière</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {MATIERES_LIST.map(m => (
          <div key={m} onClick={() => setMatiere(m)} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", background: matiere === m ? (MATIERE_COLORS[m]) : "#0f172a", color: matiere === m ? "#0f172a" : "#94a3b8" }}>{m}</div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Période à analyser</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[3, 7, 14, 30].map(d => (
          <div key={d} onClick={() => setDays(d)} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: days === d ? "#6366f1" : "#0f172a", color: days === d ? "#fff" : "#94a3b8" }}>{d}j</div>
        ))}
      </div>
      <button onClick={fetchData} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{loading ? "Analyse..." : "🔍 Analyser les difficultés"}</button>
    </div>

    {fetched && !loading && (
      <>
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: MATIERE_COLORS[matiere] }}>Aperçu du message</div>
          {rows.length === 0 ? (
            <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>Aucune difficulté enregistrée en {matiere} sur les {days} derniers jours. Rien à signaler au prof pour l'instant.</div>
          ) : (
            <>
              {weakSeances.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>📌 Notions à retravailler</div>
                  {weakSeances.map(([s, c], i) => <div key={i} style={{ fontSize: 12, color: "#fcd34d" }}>• {s} ({c} erreur{c > 1 ? "s" : ""})</div>)}
                </div>
              )}
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{exos.length} exercice(s) raté(s) · {quizzes.length} quiz réalisé(s)</div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={copyMsg} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: copied ? "#22c55e" : "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{copied ? "✓ Copié !" : "📋 Copier le message"}</button>
          <button onClick={shareMsg} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>📤 Envoyer</button>
        </div>
      </>
    )}
  </div>);
}
