"use client";
import { useState, useCallback } from "react";
import { VACANCES, DEVOIRS, MATIERES, EMPLOI_SEMAINE, EMPLOI_BAC, isVacation, getVacationLabel, isBacPeriod, getDevoirsForDate, formatDate } from "../../data/cned-data";

const HOLIDAYS = ["2026-11-01","2026-11-11","2026-12-25","2027-01-01","2027-04-05","2027-05-01","2027-05-08","2027-05-14","2027-05-25"];
const dayN = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const dayF = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function PlanningPage() {
  const [stored, setStored] = useState(() => { try { return JSON.parse(localStorage.getItem("pl")||"{}"); } catch { return {}; } });
  const save = (s) => { setStored(s); try { localStorage.setItem("pl", JSON.stringify(s)); } catch {} };
  const [wo, setWo] = useState(() => { const now = new Date(); const start = new Date(2026,8,7); return Math.max(0, Math.floor((now-start)/(7*86400000))); });
  const [sel, setSel] = useState(null);

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
    if (dow===0) return {type:"normal", slots:EMPLOI_SEMAINE[0]};
    return { type:"normal", slots:EMPLOI_SEMAINE[dow] };
  };

  const weekDvs = DEVOIRS.filter(d => { const dd=d.deadline; return dd>=formatDate(days[0]) && dd<=formatDate(days[6]); });

  if (sel) {
    const sch = getSchedule(sel); const ds = formatDate(sel);
    const dayDvs = getDevoirsForDate(ds); const isDone = stored[ds];
    return (
      <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
        <div onClick={() => setSel(null)} style={{ cursor:"pointer", color:"#818cf8", fontWeight:600, fontSize:13, marginBottom:12 }}>← Retour à la semaine</div>
        <div style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>{dayF[sel.getDay()]} {sel.getDate()} {months[sel.getMonth()]}</div>
        {sch.type==="vacation" && <div style={{ color:"#22c55e", fontWeight:600, fontSize:14, marginBottom:12 }}>🏖️ Vacances — {sch.label}</div>}
        {sch.type==="holiday" && <div style={{ color:"#22c55e", fontWeight:600, fontSize:14, marginBottom:12 }}>🎌 Jour férié</div>}
        {dayDvs.length>0 && <div style={{ background:"#450a0a", borderRadius:10, padding:12, marginBottom:12, border:"1px solid #991b1b" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#fca5a5", marginBottom:4 }}>⚠️ DEADLINE DEVOIR</div>
          {dayDvs.map((d,i) => <div key={i} style={{ fontSize:12, color:"#fca5a5" }}>{MATIERES[d.m]?.nom} — Devoir {d.n} ({d.type==="depot"?"à déposer":"en ligne"})</div>)}
        </div>}
        {sch.slots && sch.slots.map((s,i) => {
          const m = MATIERES[s.matiere]; const col = m?.color||"#6366f1";
          return (
            <a key={i} href={s.matiere==="FR"?"/cours/francais":s.matiere==="MA"?"/cours/maths":undefined}
              style={{ display:"flex", gap:12, marginBottom:8, padding:"12px 14px", borderRadius:10, background:s.prof?"rgba(251,191,36,.1)":"#1e293b", border:`1px solid ${s.prof?"#f59e0b":"#334155"}`, textDecoration:"none", color:"#e2e8f0" }}>
              <div style={{ minWidth:70, fontSize:12, fontWeight:700, color:s.prof?"#fbbf24":col }}>{s.time}</div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:col }} />
                  <span style={{ fontSize:12, fontWeight:700, color:col }}>{m?.nom||s.matiere}</span>
                  {s.tentative && <span style={{ fontSize:9, color:"#f59e0b" }}>(à confirmer)</span>}
                </div>
                <div style={{ fontSize:12, color:"#94a3b8" }}>{s.desc}</div>
              </div>
            </a>
          );
        })}
        {(sch.type==="normal"||sch.type==="bac") && <button onClick={() => { save({...stored,[ds]:!stored[ds]}); }} style={{ marginTop:12, width:"100%", padding:12, borderRadius:10, border:"none", background:isDone?"#22c55e":"#6366f1", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>{isDone?"✓ Terminé — Annuler":"Marquer comme terminé"}</button>}
      </div>
    );
  }

  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <a href="/" style={{ fontSize:22, color:"#94a3b8", textDecoration:"none" }}>←</a>
        <div>
          <div style={{ fontSize:24, fontWeight:800 }}>📅 Planning</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Première 2026-2027 · {done} jours terminés</div>
        </div>
      </div>

      <div style={{ background:"#1e293b", borderRadius:14, padding:14, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}><span>Semaine {wo+1}/{totalW}</span><span style={{ color:"#818cf8" }}>{Math.round((wo+1)/totalW*100)}%</span></div>
        <div style={{ height:6, background:"#334155", borderRadius:3, overflow:"hidden" }}><div style={{ height:"100%", width:`${Math.min(100,(wo+1)/totalW*100)}%`, background:"linear-gradient(90deg,#6366f1,#818cf8)", borderRadius:3 }} /></div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <button onClick={() => setWo(Math.max(0,wo-1))} style={{ padding:"8px 14px", borderRadius:8, background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", cursor:"pointer", fontSize:13, opacity:wo===0?.3:1 }}>←</button>
        <div style={{ textAlign:"center", fontWeight:700, fontSize:14 }}>{wLabel}</div>
        <button onClick={() => setWo(Math.min(totalW,wo+1))} style={{ padding:"8px 14px", borderRadius:8, background:"#1e293b", border:"1px solid #334155", color:"#e2e8f0", cursor:"pointer", fontSize:13 }}>→</button>
      </div>

      {weekDvs.length>0 && <div style={{ background:"#450a0a", borderRadius:10, padding:12, marginBottom:12, border:"1px solid #991b1b" }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#fca5a5", marginBottom:4 }}>⚠️ DEVOIRS CETTE SEMAINE</div>
        {weekDvs.map((d,i) => <div key={i} style={{ fontSize:12, color:"#fca5a5" }}>📌 {MATIERES[d.m]?.nom} — Devoir {d.n} avant le {new Date(d.deadline).getDate()}/{new Date(d.deadline).getMonth()+1}</div>)}
      </div>}

      {days.map((date,i) => {
        const sch = getSchedule(date); const ds = formatDate(date); const isDone = stored[ds];
        const isToday = formatDate(new Date())===ds; const dayDvs = getDevoirsForDate(ds);
        let bg="#1e293b", bd="#334155";
        if (sch.type==="vacation"||sch.type==="holiday") { bg="#052e16"; bd="#22c55e"; }
        if (sch.type==="bac") { bg="#450a0a"; bd="#ef4444"; }
        if (isDone) bd="#22c55e"; if (isToday) bd="#3b82f6";
        return (
          <div key={i} onClick={() => { if(sch.type!=="vacation"&&sch.type!=="holiday") setSel(date); }}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", marginBottom:4, background:bg, border:`${isToday?"2px":"1px"} solid ${bd}`, borderRadius:10, cursor:sch.type==="vacation"?"default":"pointer" }}>
            <div style={{ width:36, height:36, borderRadius:"50%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0, background:isDone?"#22c55e":isToday?"#3b82f6":"#334155", color:isDone||isToday?"#fff":"#94a3b8" }}>
              <span style={{ fontSize:9, fontWeight:600 }}>{dayN[date.getDay()]}</span>
              <span style={{ fontSize:13, fontWeight:700 }}>{date.getDate()}</span>
            </div>
            <div style={{ flex:1 }}>
              {sch.type==="vacation" && <span style={{ fontSize:12, color:"#22c55e", fontWeight:600 }}>🏖️ {sch.label}</span>}
              {sch.type==="holiday" && <span style={{ fontSize:12, color:"#22c55e", fontWeight:600 }}>🎌 Jour férié</span>}
              {sch.type==="off" && <span style={{ fontSize:12, color:"#94a3b8" }}>Repos</span>}
              {sch.type==="bac" && <span style={{ fontSize:12, color:"#ef4444", fontWeight:700 }}>🎯 BAC BLANC — Fr + Ma</span>}
              {sch.type==="normal" && <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {sch.slots.map((s,si) => { const m=MATIERES[s.matiere]; return (
                  <span key={si} style={{ fontSize:9, fontWeight:600, padding:"2px 6px", borderRadius:4, background:s.prof?"#fbbf24":m?.bg||"#334155", color:s.prof?"#78350f":m?.text||"#94a3b8" }}>{s.prof?"📚 ":""}{m?.court||s.matiere}</span>
                ); })}
              </div>}
              {dayDvs.length>0 && <div style={{ fontSize:10, color:"#ef4444", fontWeight:600, marginTop:2 }}>⚠️ Devoir {dayDvs.map(d=>MATIERES[d.m]?.court).join(", ")}</div>}
            </div>
            {isDone && <span>✅</span>}
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
        <div style={{ fontSize:12, fontWeight:700, color:"#fbbf24", marginBottom:4 }}>📚 Professeurs particuliers</div>
        <div style={{ fontSize:11, color:"#fcd34d" }}>• Ven 8h-10h : Prof Français (confirmé)</div>
        <div style={{ fontSize:11, color:"#fcd34d" }}>• Mar+Sam 9h-11h : Prof Maths (⚠️ à confirmer)</div>
      </div>
    </div>
  );
}
