"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const MATIERE_COLORS = {
  "Maths": "#818cf8", "Français": "#60a5fa", "SES": "#34d399", "HGGSP": "#fbbf24",
  "Histoire-Géographie": "#fb923c", "EMC": "#c084fc", "Enseignement Scientifique": "#2dd4bf",
  "Anglais": "#818cf8", "Espagnol": "#f87171"
};
const MATIERES_LIST = Object.keys(MATIERE_COLORS);
const CODE_TO_FULL = { MA:"Maths", FR:"Français", SE:"SES", HG:"HGGSP", HI:"Histoire-Géographie", EM:"EMC", SC:"Enseignement Scientifique", AN:"Anglais", ES:"Espagnol" };
const PARENT_PIN = "2027"; // code à communiquer uniquement au parent

function fmtDate(d) {
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function isoDate(d) { return d.toISOString().split("T")[0]; }
function fmtDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  if (h === 0 && m === 0) return "< 1 min";
  if (h === 0) return `${m} min`;
  return `${h}h${m > 0 ? String(m).padStart(2,"0") : ""}`;
}

export default function RapportPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem("parent_ok") === "1") setUnlocked(true); } catch {}
  }, []);

  const tryUnlock = () => {
    if (pin === PARENT_PIN) {
      setUnlocked(true);
      try { sessionStorage.setItem("parent_ok", "1"); } catch {}
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 1000);
    }
  };

  if (!unlocked) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Espace parent</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20, textAlign: "center" }}>Code d'accès requis</div>
        <input type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && tryUnlock()}
          autoFocus placeholder="••••"
          style={{ width: 140, padding: 14, borderRadius: 10, border: `2px solid ${error ? "#ef4444" : "#334155"}`, background: "#1e293b", color: "#e2e8f0", fontSize: 20, textAlign: "center", letterSpacing: 6, marginBottom: 14 }} />
        <button onClick={tryUnlock} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Déverrouiller</button>
        <a href="/" style={{ marginTop: 20, fontSize: 12, color: "#64748b", textDecoration: "none" }}>← Retour à l'accueil</a>
      </div>
    );
  }

  return <RapportContent />;
}

function RapportContent() {
  const [mode, setMode] = useState("jour"); // "jour" | "prep" | "temps"

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <a href="/" style={{ fontSize: 22, color: "#94a3b8", textDecoration: "none" }}>←</a>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>🔒 Espace parent</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Suivi & préparation des séances</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        <div onClick={() => setMode("jour")} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, background: mode === "jour" ? "#6366f1" : "#1e293b", color: mode === "jour" ? "#fff" : "#94a3b8", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>📅 Jour</div>
        <div onClick={() => setMode("temps")} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, background: mode === "temps" ? "#6366f1" : "#1e293b", color: mode === "temps" ? "#fff" : "#94a3b8", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>⏱️ Temps</div>
        <div onClick={() => setMode("prep")} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, background: mode === "prep" ? "#6366f1" : "#1e293b", color: mode === "prep" ? "#fff" : "#94a3b8", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>🎯 Séance</div>
      </div>

      {mode === "jour" ? <RapportJour /> : mode === "temps" ? <TempsTentatives /> : <PrepSeance />}
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

function TempsTentatives() {
  const [offset, setOffset] = useState(0);
  const [timeByMatiere, setTimeByMatiere] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const date = new Date(); date.setDate(date.getDate() - offset);
  const ds = isoDate(date);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [{ data: tl }, { data: at }] = await Promise.all([
        supabase.from("time_log").select("matiere, seconds").eq("event_date", ds),
        supabase.from("attempts_log").select("*").eq("event_date", ds).order("ts", { ascending: true }),
      ]);
      if (cancelled) return;
      const byM = {};
      (tl || []).forEach(r => { byM[r.matiere] = (byM[r.matiere] || 0) + r.seconds; });
      setTimeByMatiere(byM);
      setAttempts(at || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [ds]);

  const totalSeconds = Object.values(timeByMatiere).reduce((a, b) => a + b, 0);
  const matieresWithData = [...new Set([...Object.keys(timeByMatiere), ...attempts.map(a => a.matiere)])];

  // group attempts by matiere + identifier to get retry counts
  const grouped = {};
  attempts.forEach(a => {
    if (!grouped[a.matiere]) grouped[a.matiere] = {};
    const key = a.type + "::" + a.identifier;
    if (!grouped[a.matiere][key]) grouped[a.matiere][key] = { type: a.type, identifier: a.identifier, seance: a.seance, tries: 0, lastCorrect: false, lastScore: null, lastTotal: null };
    grouped[a.matiere][key].tries += 1;
    grouped[a.matiere][key].lastCorrect = a.correct;
    if (a.type === "quiz") { grouped[a.matiere][key].lastScore = a.score; grouped[a.matiere][key].lastTotal = a.total; }
  });

  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <button onClick={() => setOffset(offset + 1)} style={{ padding: "8px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", cursor: "pointer", fontSize: 13 }}>← Veille</button>
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13, textTransform: "capitalize" }}>{fmtDate(date)}</div>
      <button onClick={() => setOffset(Math.max(0, offset - 1))} disabled={offset === 0} style={{ padding: "8px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", cursor: "pointer", fontSize: 13, opacity: offset === 0 ? .3 : 1 }}>Suivant →</button>
    </div>

    {loading && <div style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>Chargement...</div>}

    {!loading && (
      <div style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Temps total travaillé</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#22c55e" }}>{fmtDuration(totalSeconds)}</div>
      </div>
    )}

    {!loading && matieresWithData.length === 0 && (
      <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, textAlign: "center", color: "#94a3b8" }}>Aucune activité ce jour-là.</div>
    )}

    {!loading && matieresWithData.map(code => {
      const full = CODE_TO_FULL[code] || code;
      const col = MATIERE_COLORS[full] || "#6366f1";
      const seconds = timeByMatiere[code] || 0;
      const items = Object.values(grouped[code] || {});
      return (
        <div key={code} style={{ background: "#1e293b", borderRadius: 14, padding: 16, marginBottom: 12, borderLeft: `4px solid ${col}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: col }}>{full}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>⏱️ {fmtDuration(seconds)}</div>
          </div>
          {items.length === 0 ? (
            <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Pas d'exercice ni de quiz réalisé.</div>
          ) : items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < items.length - 1 ? "1px solid #334155" : "none" }}>
              <div style={{ flex: 1, paddingRight: 8 }}>
                <div style={{ fontSize: 11, color: "#64748b" }}>{it.seance} {it.type === "quiz" ? "· Quiz" : "· Exercice"}</div>
                <div style={{ fontSize: 12, color: "#e2e8f0" }}>{it.identifier.length > 60 ? it.identifier.slice(0, 60) + "…" : it.identifier}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: it.tries > 1 ? "#f59e0b" : "#94a3b8" }}>{it.tries}× tenté{it.tries > 1 ? "s" : ""}</div>
                <div style={{ fontSize: 11, color: it.lastCorrect ? "#22c55e" : "#ef4444" }}>{it.type === "quiz" ? `${it.lastScore}/${it.lastTotal}` : (it.lastCorrect ? "✓ réussi" : "✗ raté")}</div>
              </div>
            </div>
          ))}
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
  const [analyse, setAnalyse] = useState("");
  const [analysing, setAnalysing] = useState(false);

  const fetchData = async () => {
    setLoading(true); setFetched(true); setAnalyse("");
    const since = new Date(); since.setDate(since.getDate() - days);
    const sinceStr = isoDate(since);
    const { data } = await supabase.from("difficulties_log").select("*").eq("matiere", matiere).gte("event_date", sinceStr).order("ts", { ascending: true });
    const rowsData = data || [];
    setRows(rowsData);
    setLoading(false);
    if (rowsData.length > 0) {
      setAnalysing(true);
      try {
        const r = await fetch("/api/ai/corriger", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "analyse_difficultes", matiere, exercices: rowsData.map(row => ({
            type: row.type, seance: row.seance, question: row.question, reponse_eleve: row.user_answer, reponse_attendue: row.correct_answer,
            score: row.score, total: row.total, questions_ratees: row.wrong_questions
          })) }) });
        const d = await r.json();
        setAnalyse(d.reply || "");
      } catch { setAnalyse(""); }
      setAnalysing(false);
    }
  };

  const quizzes = rows.filter(r => r.type === "quiz");
  const exos = rows.filter(r => r.type === "exercice");
  // group exos by "seance" to spot recurring weak spots
  const seanceCount = {};
  exos.forEach(e => { seanceCount[e.seance] = (seanceCount[e.seance] || 0) + 1; });
  const weakSeances = Object.entries(seanceCount).sort((a, b) => b[1] - a[1]);

  const buildMessage = () => {
    let txt = `Bonjour,\n\nAvant la prochaine séance de ${matiere}, voici un point précis sur le travail de mon fils ces ${days} derniers jours :\n\n`;
    if (rows.length === 0) {
      txt += "Pas de difficulté particulière détectée récemment — RAS.\n";
    } else {
      if (analyse) {
        txt += `${analyse}\n\n`;
      }
      txt += `─── Détail brut ───\n`;
      if (exos.length > 0) {
        exos.forEach(e => { txt += `\n• [${e.seance}] ${e.question}\n  → Réponse donnée : "${e.user_answer}"\n  → Réponse attendue : "${e.correct_answer}"\n`; });
        txt += `\n`;
      }
      if (quizzes.length > 0) {
        txt += `Quiz :\n`;
        quizzes.forEach(q => { txt += `  • "${q.seance}" : ${q.score}/${q.total}\n`; (q.wrong_questions || []).forEach(w => txt += `     ✗ ${w}\n`); });
        txt += `\n`;
      }
    }
    txt += `Merci d'avance de vous concentrer sur ces points pendant la séance.\n\nCordialement`;
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
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: MATIERE_COLORS[matiere] }}>Analyse précise</div>
          {rows.length === 0 ? (
            <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>Aucune difficulté enregistrée en {matiere} sur les {days} derniers jours. Rien à signaler au prof pour l'instant.</div>
          ) : analysing ? (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Analyse en cours...</div>
          ) : (
            <>
              {analyse && <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 12 }}>{analyse}</div>}
              <div style={{ fontSize: 11, color: "#64748b" }}>{exos.length} exercice(s) raté(s) · {quizzes.length} quiz réalisé(s)</div>
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
