"use client";
import { useState, useEffect } from "react";
import { VACANCES, DEVOIRS, MATIERES, EMPLOI_SEMAINE, EMPLOI_BAC, isVacation, getVacationLabel, isBacPeriod, getDevoirsForDate, formatDate } from "../../data/cned-data";
import { supabase } from "../../lib/supabase";

const HOLIDAYS = ["2026-11-01","2026-11-11","2026-12-25","2027-01-01","2027-04-05","2027-05-01","2027-05-08","2027-05-14","2027-05-25"];
const dayN = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const dayF = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function PlanningPage() {
  const [stored, setStored] = useState(() => { try { return JSON.parse(localStorage.getItem("pl")||"{}"); } catch { return {}; } });
  const [absences, setAbsences] = useState(() => { try { return JSON.parse(localStorage.getItem("abs")||"{}"); } catch { return {}; } });
  const [activity, setActivity] = useState(() => { try { return JSON.parse(localStorage.getItem("activity_log")||"{}"); } catch { return {}; } });
  useEffect(() => { const iv = setInterval(() => { try { setActivity(JSON.parse(localStorage.getItem("activity_log")||"{}")); } catch {} }, 3000); return () => clearInterval(iv); }, []);
  const [profConfig, setProfConfig] = useState({});
  const [extras, setExtras] = useState({});
  const [showReglages, setShowReglages] = useState(false);
  const loadConfig = async () => {
    const { data: pc } = await supabase.from("prof_config").select("*");
    const pcMap = {}; (pc||[]).forEach(r => { pcMap[r.matiere] = r; });
    setProfConfig(pcMap);
    const { data: ex } = await supabase.from("planning_extra").select("*");
    const exMap = {}; (ex||[]).forEach(r => { if(!exMap[r.event_date]) exMap[r.event_date]=[]; exMap[r.event_date].push(r); });
    setExtras(exMap);
  };
  useEffect(() => { loadConfig(); }, []);
  const save = (s) => { setStored(s); try { localStorage.setItem("pl", JSON.stringify(s)); } catch {} };
  const saveAbs = (a) => { setAbsences(a); try { localStorage.setItem("abs", JSON.stringify(a)); } catch {} };
  const [wo, setWo] = useState(() => { const now = new Date(); const start = new Date(2026,8,7); return Math.max(0, Math.floor((now-start)/(7*86400000))); });
  const [sel, setSel] = useState(null);
  const [showRattrapage, setShowRattrapage] = useState(false);

  const startDate = new Date(2026,8,7);
  const ws = new Date(startDate); ws.setDate(ws.getDate()+wo*7);
  const days = []; for (let i=0;i<7;i++) { const d=new Date(ws); d.setDate(d.getDate()+i); days.push(d); }
  const wLabel = `${days[0].getDate()} ${months[days[0].getMonth()]} — ${days[6].getDate()} ${months[days[6].getMonth()]}`;
  const totalW = 42; const done = Object.keys(stored).filter(k=>stored[k]).length;

  const getSchedule = (date) => {
    const ds = formatDate(date); const dow = date.getDay();
    if (isVacation(ds)) return { type:"vacation", label:getVacationLabel(ds) };
    if (HOLIDAYS.includes(ds)) return { type:"holiday" };
    if (isBacPeriod(ds)) { return dow===0?{type:"off"}:{type:"bac", slots:EMPLOI_BAC}; }
    // base template, minus hardcoded prof slots (replaced by dynamic prof_config)
    let slots = (EMPLOI_SEMAINE[dow]||[]).filter(s => !s.prof);
    // inject dynamic recurring prof sessions matching this day of week
    Object.values(profConfig).forEach(pc => {
      if (pc.jour === dow) {
        slots = [{ time: `${pc.heure_debut}-${pc.heure_fin}`, matiere: pc.matiere, desc: `📚 PROF DE ${MATIERES[pc.matiere]?.nom?.toUpperCase()||pc.matiere} (${pc.heure_debut}-${pc.heure_fin})`, prof: true, tentative: pc.tentative }, ...slots];
      }
    });
    // inject one-off extra sessions for this exact date
    const dayExtras = extras[ds] || [];
    dayExtras.forEach(ex => {
      slots = [...slots, { time: `${ex.heure_debut}-${ex.heure_fin}`, matiere: ex.matiere, desc: ex.description, prof: ex.prof, extra: true }];
    });
    return { type:"normal", slots };
  };
  const hasActivity = (dateStr, matiere) => !!(activity[dateStr] && activity[dateStr][matiere]);
  const dayFullyDone = (date) => { const ds = formatDate(date); const sch = getSchedule(date); if (sch.type !== "normal" || !sch.slots) return false; const matieres = [...new Set(sch.slots.filter(s=>!s.prof).map(s=>s.matiere))]; return matieres.length>0 && matieres.every(m => hasActivity(ds, m)); };


  // --- RATTRAPAGE : redistribute absent day's slots to remaining days ---
  const getWeekAbsences = () => days.filter(d => absences[formatDate(d)]);
  const weekAbsDates = getWeekAbsences();

  const getRattrapageSlots = (date) => {
    const ds = formatDate(date);
    const sch = getSchedule(date);
    if (sch.type !== "normal" || absences[ds]) return [];
    // Collect missed slots from absent days this week
    const missed = [];
    for (const absDay of weekAbsDates) {
      const absSch = getSchedule(absDay);
      if (absSch.slots) {
        absSch.slots.forEach(s => missed.push({ ...s, from: dayF[absDay.getDay()] }));
      }
    }
    if (missed.length === 0) return [];
    // Count available normal days (not absent, not vacation, not holiday)
    const availDays = days.filter(d => {
      const dds = formatDate(d);
      const dsch = getSchedule(d);
      return dsch.type === "normal" && !absences[dds];
    });
    if (availDays.length === 0) return [];
    // Find index of this day among available days
    const idx = availDays.findIndex(d => formatDate(d) === ds);
    if (idx === -1) return [];
    // Distribute evenly: each available day gets a chunk
    const perDay = Math.ceil(missed.length / availDays.length);
    const start = idx * perDay;
    return missed.slice(start, start + perDay);
  };

  const toggleAbsence = (date) => {
    const ds = formatDate(date);
    const n = { ...absences };
    if (n[ds]) { delete n[ds]; } else { n[ds] = true; delete stored[ds]; save({...stored}); }
    saveAbs(n);
  };

  const weekDvs = DEVOIRS.filter(d => { const dd=d.deadline; return dd>=formatDate(days[0]) && dd<=formatDate(days[6]); });

  // --- DAY DETAIL ---
  if (sel) {
    const sch = getSchedule(sel); const ds = formatDate(sel);
    const dayDvs = getDevoirsForDate(ds); const isDone = stored[ds] || dayFullyDone(sel); const isAbs = absences[ds];
    const rattrapage = getRattrapageSlots(sel);

    return (
      <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
        <div onClick={() => setSel(null)} style={{ cursor:"pointer", color:"#818cf8", fontWeight:600, fontSize:13, marginBottom:12 }}>← Retour à la semaine</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <div style={{ fontSize:20, fontWeight:700 }}>{dayF[sel.getDay()]} {sel.getDate()} {months[sel.getMonth()]}</div>
          {sch.type==="normal" && (
            <button onClick={() => toggleAbsence(sel)} style={{ padding:"8px 14px", borderRadius:10, border:"none", fontSize:12, fontWeight:700, cursor:"pointer", background:isAbs?"#22c55e":"#ef4444", color:"#fff" }}>
              {isAbs ? "✓ Retour — Annuler absence" : "🤒 Absent / Malade"}
            </button>
          )}
        </div>

        {isAbs && (
          <div style={{ background:"rgba(239,68,68,.1)", borderRadius:12, padding:14, marginBottom:14, border:"1px solid rgba(239,68,68,.3)" }}>
            <div style={{ fontWeight:700, fontSize:14, color:"#fca5a5", marginBottom:4 }}>🤒 Absent ce jour</div>
            <div style={{ fontSize:12, color:"#fca5a5" }}>Les séances sont redistribuées sur les autres jours de la semaine.</div>
          </div>
        )}

        {sch.type==="vacation" && <div style={{ color:"#22c55e", fontWeight:600, fontSize:14, marginBottom:12 }}>🏖️ Vacances — {sch.label}</div>}
        {sch.type==="holiday" && <div style={{ color:"#22c55e", fontWeight:600, fontSize:14, marginBottom:12 }}>🎌 Jour férié</div>}

        {dayDvs.length>0 && <div style={{ background:"#450a0a", borderRadius:10, padding:12, marginBottom:12, border:"1px solid #991b1b" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#fca5a5", marginBottom:4 }}>⚠️ DEADLINE DEVOIR</div>
          {dayDvs.map((d,i) => <div key={i} style={{ fontSize:12, color:"#fca5a5" }}>{MATIERES[d.m]?.nom} — Devoir {d.n} ({d.type==="depot"?"à déposer":"en ligne"})</div>)}
        </div>}

        {!isAbs && sch.slots && sch.slots.map((s,i) => {
          const m = MATIERES[s.matiere]; const col = m?.color||"#6366f1";
          const cursDone = !s.prof && hasActivity(ds, s.matiere);
          const cursHref = {FR:"/cours/francais",MA:"/cours/maths",SES:"/cours/ses",HGGSP:"/cours/hggsp",HG:"/cours/histgeo",EMC:"/cours/emc",SC:"/cours/enssci",AN:"/cours/anglais",ES:"/cours/espagnol"}[s.matiere];
          return (
            <a key={i} href={cursHref}
              style={{ display:"flex", gap:12, marginBottom:8, padding:"12px 14px", borderRadius:10, background:s.prof?"rgba(251,191,36,.1)":cursDone?"rgba(34,197,94,.08)":"#1e293b", border:`1px solid ${s.prof?"#f59e0b":cursDone?"#22c55e":"#334155"}`, textDecoration:"none", color:"#e2e8f0" }}>
              <div style={{ minWidth:70, fontSize:12, fontWeight:700, color:s.prof?"#fbbf24":col }}>{s.time}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:col }} />
                  <span style={{ fontSize:12, fontWeight:700, color:col }}>{m?.nom||s.matiere}</span>
                  {s.tentative && <span style={{ fontSize:9, color:"#f59e0b" }}>(à confirmer)</span>}
                </div>
                <div style={{ fontSize:12, color:"#94a3b8" }}>{s.desc}</div>
              </div>
              {cursDone && <span style={{ fontSize:16 }}>✅</span>}
            </a>
          );
        })}

        {!isAbs && rattrapage.length>0 && (
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#f59e0b", marginBottom:8 }}>🔄 Rattrapage (séances manquées)</div>
            {rattrapage.map((s,i) => {
              const m = MATIERES[s.matiere]; const col = m?.color||"#6366f1";
              return (
                <div key={i} style={{ display:"flex", gap:12, marginBottom:8, padding:"12px 14px", borderRadius:10, background:"rgba(251,191,36,.06)", border:"1px dashed #f59e0b" }}>
                  <div style={{ minWidth:70 }}>
                    <div style={{ fontSize:10, color:"#f59e0b", fontWeight:600 }}>Rattrapage</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>du {s.from}</div>
                  </div>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:col }} />
                      <span style={{ fontSize:12, fontWeight:700, color:col }}>{m?.nom||s.matiere}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#94a3b8" }}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isAbs && (sch.type==="normal"||sch.type==="bac") && <button onClick={() => { save({...stored,[ds]:!stored[ds]}); }} style={{ marginTop:12, width:"100%", padding:12, borderRadius:10, border:"none", background:isDone?"#22c55e":"#6366f1", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>{isDone?"✓ Terminé — Annuler":"Marquer comme terminé"}</button>}
      </div>
    );
  }

  // --- WEEK VIEW ---
  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <a href="/" style={{ fontSize:22, color:"#94a3b8", textDecoration:"none" }}>←</a>
          <div>
            <div style={{ fontSize:24, fontWeight:800 }}>📅 Planning</div>
            <div style={{ fontSize:12, color:"#94a3b8" }}>Première 2026-2027 · {done} jours terminés</div>
          </div>
        </div>
        <button onClick={() => setShowReglages(true)} style={{ padding:"8px 10px", borderRadius:8, background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", cursor:"pointer", fontSize:16 }}>⚙️</button>
      </div>

      {showReglages && <Reglages profConfig={profConfig} onClose={() => setShowReglages(false)} onSaved={loadConfig} />}

      <div style={{ background:"#1e293b", borderRadius:14, padding:14, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}><span>Semaine {wo+1}/{totalW}</span><span style={{ color:"#818cf8" }}>{Math.round((wo+1)/totalW*100)}%</span></div>
        <div style={{ height:6, background:"#334155", borderRadius:3, overflow:"hidden" }}><div style={{ height:"100%", width:`${Math.min(100,(wo+1)/totalW*100)}%`, background:"linear-gradient(90deg,#6366f1,#818cf8)", borderRadius:3 }} /></div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <button onClick={() => setWo(Math.max(0,wo-1))} style={{ padding:"8px 14px", borderRadius:8, background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", cursor:"pointer", fontSize:13, opacity:wo===0?.3:1 }}>←</button>
        <div style={{ textAlign:"center", fontWeight:700, fontSize:14 }}>{wLabel}</div>
        <button onClick={() => setWo(Math.min(totalW,wo+1))} style={{ padding:"8px 14px", borderRadius:8, background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", cursor:"pointer", fontSize:13 }}>→</button>
      </div>

      {weekAbsDates.length>0 && (
        <div style={{ background:"rgba(251,191,36,.08)", borderRadius:10, padding:12, marginBottom:12, border:"1px solid rgba(251,191,36,.3)" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#fbbf24", marginBottom:4 }}>🔄 Rattrapage actif cette semaine</div>
          <div style={{ fontSize:11, color:"#fcd34d" }}>{weekAbsDates.length} jour(s) d'absence — les séances sont redistribuées automatiquement</div>
        </div>
      )}

      {weekDvs.length>0 && <div style={{ background:"#450a0a", borderRadius:10, padding:12, marginBottom:12, border:"1px solid #991b1b" }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#fca5a5", marginBottom:4 }}>⚠️ DEVOIRS CETTE SEMAINE</div>
        {weekDvs.map((d,i) => <div key={i} style={{ fontSize:12, color:"#fca5a5" }}>📌 {MATIERES[d.m]?.nom} — Devoir {d.n} avant le {new Date(d.deadline).getDate()}/{new Date(d.deadline).getMonth()+1}</div>)}
      </div>}

      {days.map((date,i) => {
        const sch = getSchedule(date); const ds = formatDate(date); const isDone = stored[ds] || dayFullyDone(date); const isAbs = absences[ds];
        const isToday = formatDate(new Date())===ds; const dayDvs = getDevoirsForDate(ds);
        const rattrapage = getRattrapageSlots(date);
        let bg="#1e293b", bd="#334155";
        if (sch.type==="vacation"||sch.type==="holiday") { bg="#052e16"; bd="#22c55e"; }
        if (sch.type==="bac") { bg="#450a0a"; bd="#ef4444"; }
        if (isAbs) { bg="#1c1917"; bd="#78716c"; }
        if (isDone) bd="#22c55e"; if (isToday) bd="#3b82f6";
        return (
          <div key={i} onClick={() => { if(sch.type!=="vacation"&&sch.type!=="holiday") setSel(date); }}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", marginBottom:4, background:bg, border:`${isToday?"2px":"1px"} solid ${bd}`, borderRadius:10, cursor:sch.type==="vacation"?"default":"pointer", opacity:isAbs?.5:1 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0, background:isDone?"#22c55e":isAbs?"#78716c":isToday?"#3b82f6":"#334155", color:isDone||isToday?"#fff":"#94a3b8" }}>
              <span style={{ fontSize:9, fontWeight:600 }}>{dayN[date.getDay()]}</span>
              <span style={{ fontSize:13, fontWeight:700 }}>{date.getDate()}</span>
            </div>
            <div style={{ flex:1 }}>
              {isAbs && <span style={{ fontSize:12, color:"#a8a29e", fontWeight:600 }}>🤒 Absent — séances redistribuées</span>}
              {!isAbs && sch.type==="vacation" && <span style={{ fontSize:12, color:"#22c55e", fontWeight:600 }}>🏖️ {sch.label}</span>}
              {!isAbs && sch.type==="holiday" && <span style={{ fontSize:12, color:"#22c55e", fontWeight:600 }}>🎌 Jour férié</span>}
              {!isAbs && sch.type==="off" && <span style={{ fontSize:12, color:"#94a3b8" }}>Repos</span>}
              {!isAbs && sch.type==="bac" && <span style={{ fontSize:12, color:"#ef4444", fontWeight:700 }}>🎯 BAC BLANC — Fr + Ma</span>}
              {!isAbs && sch.type==="normal" && <div>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                  {(sch.slots||[]).map((s,si) => { const m=MATIERES[s.matiere]; const cd=!s.prof && hasActivity(ds, s.matiere); return (
                    <span key={si} style={{ fontSize:9, fontWeight:600, padding:"2px 6px", borderRadius:4, background:cd?"rgba(34,197,94,.2)":s.prof?"#fbbf24":m?.bg||"#334155", color:cd?"#22c55e":s.prof?"#78350f":m?.text||"#94a3b8" }}>{cd?"✅ ":s.prof?"📚 ":""}{m?.court||s.matiere}</span>
                  ); })}
                  {rattrapage.length>0 && <span style={{ fontSize:9, fontWeight:600, padding:"2px 6px", borderRadius:4, background:"rgba(251,191,36,.2)", color:"#fbbf24" }}>+{rattrapage.length} rattrapage</span>}
                </div>
              </div>}
              {dayDvs.length>0 && <div style={{ fontSize:10, color:"#ef4444", fontWeight:600, marginTop:2 }}>⚠️ Devoir {dayDvs.map(d=>MATIERES[d.m]?.court).join(", ")}</div>}
            </div>
            {isDone && <span>✅</span>}
            {isAbs && <span>🤒</span>}
          </div>
        );
      })}

      <div style={{ marginTop:16, display:"flex", gap:4, flexWrap:"wrap" }}>
        <span style={{ fontSize:11, color:"#94a3b8", paddingTop:4 }}>Aller à :</span>
        {[{l:"Auj.",w:Math.max(0,Math.floor((new Date()-startDate)/(7*86400000)))},{l:"Toussaint",w:6},{l:"Noël",w:15},{l:"Hiver",w:24},{l:"Bac blanc",w:33}].map(j => (
          <button key={j.l} onClick={() => setWo(j.w)} style={{ padding:"3px 8px", borderRadius:6, fontSize:10, fontWeight:600, background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", cursor:"pointer" }}>{j.l}</button>
        ))}
      </div>

      <div style={{ marginTop:16, padding:12, background:"rgba(251,191,36,.08)", borderRadius:10, border:"1px solid rgba(251,191,36,.3)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#fbbf24" }}>📚 Professeurs particuliers</div>
          <span onClick={() => setShowReglages(true)} style={{ fontSize:11, color:"#fbbf24", cursor:"pointer", textDecoration:"underline" }}>modifier</span>
        </div>
        {Object.values(profConfig).map(pc => (
          <div key={pc.matiere} style={{ fontSize:11, color:"#fcd34d" }}>• {DAY_NAMES_FULL[pc.jour]} {pc.heure_debut}-{pc.heure_fin} : Prof {MATIERES[pc.matiere]?.nom} {pc.tentative ? "(⚠️ à confirmer)" : "(confirmé)"}</div>
        ))}
      </div>
    </div>
  );
}

const DAY_NAMES_FULL = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

function Reglages({ profConfig, onClose, onSaved }) {
  const [ma, setMa] = useState(() => profConfig.MA || { jour: 4, heure_debut: "10h", heure_fin: "12h", tentative: false });
  const [fr, setFr] = useState(() => profConfig.FR || { jour: 5, heure_debut: "8h", heure_fin: "10h", tentative: false });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("recurrent");
  // extra session form
  const [exDate, setExDate] = useState("");
  const [exMatiere, setExMatiere] = useState("MA");
  const [exDebut, setExDebut] = useState("14h");
  const [exFin, setExFin] = useState("16h");
  const [exDesc, setExDesc] = useState("Séance supplémentaire avec le prof");
  const [exSaved, setExSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from("prof_config").upsert([
      { matiere: "MA", ...ma },
      { matiere: "FR", ...fr },
    ], { onConflict: "matiere" });
    setSaving(false);
    onSaved();
    onClose();
  };

  const addExtra = async () => {
    if (!exDate) return;
    await supabase.from("planning_extra").insert({ event_date: exDate, matiere: exMatiere, heure_debut: exDebut, heure_fin: exFin, description: exDesc, prof: true });
    setExSaved(true);
    onSaved();
    setTimeout(() => setExSaved(false), 1500);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#1e293b", borderRadius:"16px 16px 0 0", padding:20, width:"100%", maxWidth:480, maxHeight:"85vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontWeight:800, fontSize:16 }}>⚙️ Réglages planning</div>
          <span onClick={onClose} style={{ cursor:"pointer", color:"#94a3b8", fontSize:20 }}>✕</span>
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:16 }}>
          <div onClick={() => setTab("recurrent")} style={{ flex:1, textAlign:"center", padding:"8px 0", borderRadius:8, background:tab==="recurrent"?"#6366f1":"#0f172a", color:tab==="recurrent"?"#fff":"#94a3b8", fontSize:12, fontWeight:600, cursor:"pointer" }}>Horaires fixes</div>
          <div onClick={() => setTab("extra")} style={{ flex:1, textAlign:"center", padding:"8px 0", borderRadius:8, background:tab==="extra"?"#6366f1":"#0f172a", color:tab==="extra"?"#fff":"#94a3b8", fontSize:12, fontWeight:600, cursor:"pointer" }}>Séance ponctuelle</div>
        </div>

        {tab === "recurrent" && (<div>
          <div style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>Jour et horaire habituels de chaque professeur (répété chaque semaine).</div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#ec4899", marginBottom:8 }}>📐 Prof de Maths</div>
            <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
              {DAY_NAMES_FULL.map((d,i) => (
                <div key={i} onClick={() => setMa({...ma, jour:i})} style={{ padding:"6px 10px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:ma.jour===i?"#ec4899":"#0f172a", color:ma.jour===i?"#fff":"#94a3b8" }}>{d}</div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <input value={ma.heure_debut} onChange={e=>setMa({...ma,heure_debut:e.target.value})} placeholder="10h" style={{ width:60, padding:8, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
              <span style={{ color:"#94a3b8" }}>→</span>
              <input value={ma.heure_fin} onChange={e=>setMa({...ma,heure_fin:e.target.value})} placeholder="12h" style={{ width:60, padding:8, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
              <label style={{ display:"flex", alignItems:"center", gap:4, marginLeft:10, fontSize:12, color:"#94a3b8" }}>
                <input type="checkbox" checked={!!ma.tentative} onChange={e=>setMa({...ma,tentative:e.target.checked})} /> à confirmer
              </label>
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#3b82f6", marginBottom:8 }}>📖 Prof de Français</div>
            <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
              {DAY_NAMES_FULL.map((d,i) => (
                <div key={i} onClick={() => setFr({...fr, jour:i})} style={{ padding:"6px 10px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:fr.jour===i?"#3b82f6":"#0f172a", color:fr.jour===i?"#fff":"#94a3b8" }}>{d}</div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <input value={fr.heure_debut} onChange={e=>setFr({...fr,heure_debut:e.target.value})} placeholder="8h" style={{ width:60, padding:8, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
              <span style={{ color:"#94a3b8" }}>→</span>
              <input value={fr.heure_fin} onChange={e=>setFr({...fr,heure_fin:e.target.value})} placeholder="10h" style={{ width:60, padding:8, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13 }} />
              <label style={{ display:"flex", alignItems:"center", gap:4, marginLeft:10, fontSize:12, color:"#94a3b8" }}>
                <input type="checkbox" checked={!!fr.tentative} onChange={e=>setFr({...fr,tentative:e.target.checked})} /> à confirmer
              </label>
            </div>
          </div>

          <button onClick={save} disabled={saving} style={{ width:"100%", padding:12, borderRadius:10, border:"none", background:"#22c55e", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>{saving ? "Enregistrement..." : "✓ Enregistrer les horaires fixes"}</button>
        </div>)}

        {tab === "extra" && (<div>
          <div style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>
            Ajoute une séance ponctuelle (ex: le prof rajoute une séance cette semaine) sans toucher au planning habituel des autres jours.
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>Date</div>
            <input type="date" value={exDate} onChange={e=>setExDate(e.target.value)} style={{ width:"100%", padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13, boxSizing:"border-box" }} />
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>Matière</div>
            <div style={{ display:"flex", gap:6 }}>
              {["MA","FR"].map(m => (
                <div key={m} onClick={() => setExMatiere(m)} style={{ flex:1, textAlign:"center", padding:8, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:exMatiere===m?(m==="MA"?"#ec4899":"#3b82f6"):"#0f172a", color:exMatiere===m?"#fff":"#94a3b8" }}>{MATIERES[m]?.nom}</div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>Début</div>
              <input value={exDebut} onChange={e=>setExDebut(e.target.value)} style={{ width:"100%", padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13, boxSizing:"border-box" }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>Fin</div>
              <input value={exFin} onChange={e=>setExFin(e.target.value)} style={{ width:"100%", padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13, boxSizing:"border-box" }} />
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>Description</div>
            <input value={exDesc} onChange={e=>setExDesc(e.target.value)} style={{ width:"100%", padding:10, borderRadius:8, border:"1px solid #334155", background:"#0f172a", color:"#e2e8f0", fontSize:13, boxSizing:"border-box" }} />
          </div>
          <button onClick={addExtra} style={{ width:"100%", padding:12, borderRadius:10, border:"none", background:exSaved?"#22c55e":"#6366f1", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>{exSaved ? "✓ Ajoutée !" : "+ Ajouter la séance"}</button>
          <div style={{ fontSize:11, color:"#64748b", marginTop:10, fontStyle:"italic" }}>Cette séance s'ajoute au planning de ce jour précis, en plus du reste — elle ne décale pas les autres matières de la semaine.</div>
        </div>)}
      </div>
    </div>
  );
}
