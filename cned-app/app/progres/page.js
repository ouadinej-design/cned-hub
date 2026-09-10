"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { EMPLOI_SEMAINE, isVacation, isBacPeriod, formatDate } from "../../data/cned-data";

const HOLIDAYS = ["2026-11-01","2026-11-11","2026-12-25","2027-01-01","2027-04-05","2027-05-01","2027-05-08","2027-05-14","2027-05-25"];
const MATIERE_LABELS = { FR:{nom:"Français",icon:"📖",color:"#60a5fa"}, MA:{nom:"Maths",icon:"📐",color:"#818cf8"}, SE:{nom:"SES",icon:"📊",color:"#34d399"}, HG:{nom:"HGGSP",icon:"🌍",color:"#fbbf24"}, HI:{nom:"Hist-Géo",icon:"🗺️",color:"#fb923c"}, AN:{nom:"Anglais",icon:"🇬🇧",color:"#818cf8"}, ES:{nom:"Espagnol",icon:"🇪🇸",color:"#f87171"}, SC:{nom:"Ens. Sci",icon:"🔬",color:"#2dd4bf"}, EM:{nom:"EMC",icon:"⚖️",color:"#c084fc"} };

export default function ProgresPage() {
  const [loading, setLoading] = useState(true);
  const [subjectStats, setSubjectStats] = useState({});
  const [streak, setStreak] = useState(0);
  const [totalPct, setTotalPct] = useState(0);

  useEffect(() => {
    (async () => {
      const [{ data: act }, { data: sd }, { data: abs }] = await Promise.all([
        supabase.from("activity_log").select("event_date,matiere"),
        supabase.from("slot_done").select("event_date,matiere,done").eq("done", true),
        supabase.from("absences_log").select("event_date"),
      ]);
      const doneSet = new Set();
      const activeDates = new Set();
      (act || []).forEach(r => { doneSet.add(`${r.event_date}__${r.matiere}`); activeDates.add(r.event_date); });
      (sd || []).forEach(r => doneSet.add(`${r.event_date}__${r.matiere}`));
      const absSet = new Set((abs || []).map(r => r.event_date));

      const codes = Object.keys(MATIERE_LABELS);
      const result = {};
      codes.forEach(c => { result[c] = { expected: 0, done: 0 }; });

      const cur = new Date(2026, 8, 7);
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0,0,0,0);
      while (cur <= yesterday) {
        const ds = formatDate(cur);
        const dow = cur.getDay();
        if (!isVacation(ds) && !HOLIDAYS.includes(ds) && !isBacPeriod(ds) && !absSet.has(ds)) {
          const daySlots = EMPLOI_SEMAINE[dow] || [];
          codes.forEach(code => {
            if (daySlots.some(s => s.matiere === code && !s.prof)) {
              result[code].expected += 1;
              if (doneSet.has(`${ds}__${code}`)) result[code].done += 1;
            }
          });
        }
        cur.setDate(cur.getDate() + 1);
      }
      setSubjectStats(result);

      const totalExpected = codes.reduce((s, c) => s + result[c].expected, 0);
      const totalDone = codes.reduce((s, c) => s + result[c].done, 0);
      setTotalPct(totalExpected > 0 ? Math.round((totalDone / totalExpected) * 100) : 100);

      // streak: consecutive days going back from today with at least one subject active
      let s = 0;
      let d = new Date();
      while (true) {
        const ds = formatDate(d);
        const dow = d.getDay();
        if (isVacation(ds) || HOLIDAYS.includes(ds)) { d.setDate(d.getDate() - 1); continue; }
        if (activeDates.has(ds)) { s += 1; d.setDate(d.getDate() - 1); }
        else if (ds === formatDate(new Date())) { d.setDate(d.getDate() - 1); continue; } // today not done yet doesn't break streak
        else break;
      }
      setStreak(s);
      setLoading(false);
    })();
  }, []);

  const codes = Object.keys(MATIERE_LABELS);
  const upToDate = codes.filter(c => subjectStats[c] && subjectStats[c].done >= subjectStats[c].expected);
  const behind = codes.filter(c => subjectStats[c] && subjectStats[c].done < subjectStats[c].expected);

  let message = "Continue comme ça ! 💪";
  if (totalPct >= 90) message = "Excellent travail, tu es à jour ! 🌟";
  else if (totalPct >= 70) message = "Bon rythme, encore un petit effort ! 💪";
  else if (behind.length > 0) message = "Quelques matières à rattraper — tu peux le faire ! 🚀";

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Inter',system-ui,sans-serif", padding: "16px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <a href="/" style={{ fontSize: 22, color: "#94a3b8", textDecoration: "none" }}>←</a>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>🌟 Mon suivi</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Ta progression cette année</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>Chargement...</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "#1e293b", borderRadius: 14, padding: 18, textAlign: "center" }}>
              <div style={{ fontSize: 30 }}>🔥</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b" }}>{streak}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>jour{streak > 1 ? "s" : ""} d'affilée</div>
            </div>
            <div style={{ background: "#1e293b", borderRadius: 14, padding: 18, textAlign: "center" }}>
              <div style={{ fontSize: 30 }}>📈</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: totalPct >= 80 ? "#22c55e" : "#818cf8" }}>{totalPct}%</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>de l'année vue</div>
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)", borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{message}</div>
          </div>

          {upToDate.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e", marginBottom: 8 }}>✅ Matières à jour</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {upToDate.map(c => (
                  <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 20, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.3)" }}>
                    <span>{MATIERE_LABELS[c].icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{MATIERE_LABELS[c].nom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {behind.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>🔶 Matières à rattraper</div>
              {behind.map(c => {
                const { expected, done } = subjectStats[c];
                const pct = expected > 0 ? Math.round((done / expected) * 100) : 100;
                return (
                  <div key={c} style={{ background: "#1e293b", borderRadius: 12, padding: 14, marginBottom: 8, borderLeft: `4px solid ${MATIERE_LABELS[c].color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{MATIERE_LABELS[c].icon} {MATIERE_LABELS[c].nom}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{pct}%</div>
                    </div>
                    <div style={{ height: 6, background: "#334155", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <a href="/cours" style={{ display: "inline-block", padding: "12px 24px", borderRadius: 10, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Aller travailler →</a>
          </div>
        </>
      )}
    </div>
  );
}
