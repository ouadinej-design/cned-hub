"use client";
import { REGLES, DATES_CLES } from "../../data/cned-data";

const EPREUVES_TERMINALES = [
  "Français écrit + oral (fin de Première)",
  "Mathématiques — épreuve anticipée (fin de Première)",
  "2 épreuves de spécialité (fin de Terminale)",
  "Grand oral (fin de Terminale)",
  "Philosophie (fin de Terminale)",
];
const CC_OBLIGATOIRE = [
  "Histoire-Géographie", "Langue vivante A (Anglais)", "Langue vivante B (Espagnol)",
  "Mathématiques spécifiques (1re, si pas de spé Maths)", "Enseignement scientifique", "EMC",
  "Spécialité de Première non poursuivie en Terminale",
];
const CC_OPTIONNEL = [
  "Langue vivante C", "Maths complémentaires / expertes", "Langues et cultures de l'Antiquité",
  "Droit et grands enjeux du monde contemporain", "Arts",
];

export default function ReglesPage() {
  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", color:"#e2e8f0", fontFamily:"'Inter',system-ui,sans-serif", padding:"16px 16px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <a href="/" style={{ fontSize:22, color:"#94a3b8", textDecoration:"none" }}>←</a>
        <div>
          <div style={{ fontSize:24, fontWeight:800 }}>⚠️ Règles CNED</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>Projet d'évaluation Bac — Session 2027</div>
        </div>
      </div>

      <div style={{ background:"#450a0a", borderRadius:14, padding:16, marginBottom:16, border:"1px solid #991b1b" }}>
        <div style={{ fontWeight:700, fontSize:16, color:"#fca5a5", marginBottom:8 }}>🔴 Règles obligatoires</div>
        {REGLES.filter(r=>r.type==="critical").map((r,i) => (
          <div key={i} style={{ padding:10, marginBottom:6, background:"rgba(239,68,68,.1)", borderRadius:8, fontSize:13, color:"#fca5a5", borderLeft:"3px solid #ef4444" }}>{r.text}</div>
        ))}
      </div>

      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:16, color:"#fbbf24", marginBottom:8 }}>⚠️ Règles importantes</div>
        {REGLES.filter(r=>r.type==="warning").map((r,i) => (
          <div key={i} style={{ padding:10, marginBottom:6, background:"rgba(245,158,11,.08)", borderRadius:8, fontSize:13, color:"#fcd34d", borderLeft:"3px solid #f59e0b" }}>{r.text}</div>
        ))}
      </div>

      <div style={{ background:"rgba(168,85,247,.08)", borderRadius:14, padding:16, marginBottom:16, border:"1px solid rgba(168,85,247,.3)" }}>
        <div style={{ fontWeight:700, fontSize:16, color:"#c084fc", marginBottom:8 }}>🎲 Évaluations aléatoires de contrôle</div>
        <div style={{ fontSize:13, color:"#e9d5ff", lineHeight:1.6 }}>
          Pour lutter contre la fraude, ton fils peut être <strong>convoqué de manière totalement aléatoire</strong> à une évaluation surveillée à distance, sur des séquences déjà travaillées.
        </div>
        <ul style={{ fontSize:12, color:"#e9d5ff", marginTop:8, paddingLeft:18, lineHeight:1.8 }}>
          <li>Convocation minimum <strong>3 semaines</strong> avant l'épreuve</li>
          <li>Passation <strong>obligatoire</strong></li>
          <li>Absence non justifiée = <strong>note de 0</strong></li>
          <li>Si la nouvelle note est nettement inférieure à la note initiale → convocations complémentaires possibles, voire sanction pour fraude en cas d'écarts répétés</li>
        </ul>
        <div style={{ fontSize:11, color:"#c4b5fd", marginTop:8, fontStyle:"italic" }}>→ Bon réflexe : garder les cours à jour dans sa tête, pas seulement les devoirs rendus.</div>
      </div>

      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:16, marginBottom:10 }}>📋 Les 5 règles du contrôle continu</div>
        {[
          ["Assiduité", "Temps régulier consacré aux contenus et exercices en ligne."],
          ["Travail régulier", "Nombre de devoirs équilibré sur les 2 semestres."],
          ["Suivi de la progression", "Chaque devoir fait dans l'ordre prévu par la progression."],
          ["Évaluations obligatoires", "Tous les devoirs du semestre doivent être rendus, sans omission."],
          ["Rythme à respecter", "14 jours minimum entre 2 devoirs corrigés d'une même matière."],
        ].map(([t,d],i) => (
          <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:i<4?"1px solid #334155":"none" }}>
            <div style={{ minWidth:22, color:"#818cf8", fontWeight:700 }}>{i+1}.</div>
            <div>
              <div style={{ fontWeight:600, fontSize:13 }}>{t}</div>
              <div style={{ fontSize:12, color:"#94a3b8" }}>{d}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop:10, padding:10, background:"rgba(239,68,68,.08)", borderRadius:8, fontSize:12, color:"#fca5a5" }}>
          ⚠️ Une moyenne semestrielle nécessite <strong>plusieurs notes</strong> : une seule note dans une matière ne suffit pas à établir une moyenne valable.
        </div>
      </div>

      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:16, marginBottom:10 }}>🎯 Répartition des matières (Bac 40/60)</div>
        <div style={{ fontSize:12, fontWeight:700, color:"#f87171", marginBottom:6 }}>Épreuves terminales (60%)</div>
        {EPREUVES_TERMINALES.map((m,i) => <div key={i} style={{ fontSize:12, color:"#fca5a5", padding:"3px 0" }}>• {m}</div>)}
        <div style={{ fontSize:12, fontWeight:700, color:"#818cf8", marginTop:12, marginBottom:6 }}>Contrôle continu obligatoire (40%)</div>
        {CC_OBLIGATOIRE.map((m,i) => <div key={i} style={{ fontSize:12, color:"#c7d2fe", padding:"3px 0" }}>• {m}</div>)}
        <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginTop:12, marginBottom:6 }}>Contrôle continu — options</div>
        {CC_OPTIONNEL.map((m,i) => <div key={i} style={{ fontSize:12, color:"#cbd5e1", padding:"3px 0" }}>• {m}</div>)}
        <div style={{ marginTop:10, fontSize:11, color:"#94a3b8", fontStyle:"italic" }}>EPS : examen ponctuel en fin de Terminale (remplace le contrôle continu).</div>
      </div>

      <div style={{ background:"rgba(239,68,68,.08)", borderRadius:14, padding:16, marginBottom:16, border:"1px solid rgba(239,68,68,.3)" }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#fca5a5", marginBottom:6 }}>🚫 Fraude / plagiat</div>
        <div style={{ fontSize:12, color:"#fca5a5" }}>Plagiat intégral prouvé → <strong>0/20</strong> + rapport rédigé par le correcteur. Fraude partielle → seule la production personnelle est évaluée.</div>
      </div>

      <div style={{ background:"#1e293b", borderRadius:14, padding:16, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:16, marginBottom:12 }}>📅 Dates clés de l'année</div>
        {DATES_CLES.map((d,i) => (
          <div key={i} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:i<DATES_CLES.length-1?"1px solid #334155":"none" }}>
            <div style={{ minWidth:90, fontSize:12, fontWeight:600, color:d.critical?"#ef4444":"#94a3b8" }}>{new Date(d.date).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
              <span>{d.icon}</span>
              <span style={{ fontSize:13, color:d.critical?"#fca5a5":"#e2e8f0", fontWeight:d.critical?700:400 }}>{d.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:"rgba(59,130,246,.08)", borderRadius:14, padding:16, marginBottom:16, border:"1px solid rgba(59,130,246,.3)" }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#93c5fd", marginBottom:8 }}>🌍 Élève français de l'étranger</div>
        <div style={{ fontSize:12, color:"#bfdbfe", lineHeight:1.7 }}>
          Le statut de <strong>classe complète réglementée</strong> (qui donne accès au contrôle continu pour le bac) nécessite, pour un élève résidant à l'étranger, l'<strong>avis favorable du conseiller culturel de l'ambassade de France</strong>.
        </div>
        <div style={{ fontSize:12, color:"#bfdbfe", marginTop:8, lineHeight:1.7 }}>
          Pour les <strong>évaluations aléatoires de contrôle</strong> et l'<strong>épreuve de remplacement</strong>, ces épreuves sont organisées "en présence" — les modalités précises pour un élève à l'étranger (centre d'examen local, déplacement en France...) ne sont pas détaillées dans le document général. <strong>À vérifier directement auprès du CNED ou de l'ambassade.</strong>
        </div>
      </div>

      <a href="https://modules.cned.fr/Actito/DAPN/Rennes/PROJET_EVALUATION_BACCALAUREAT_SESSION_2027.pdf" target="_blank" rel="noopener noreferrer"
        style={{ display:"block", textAlign:"center", padding:12, borderRadius:10, background:"#1e293b", border:"1px solid #334155", color:"#818cf8", textDecoration:"none", fontSize:12, fontWeight:600 }}>
        📄 Voir le document officiel CNED (PDF)
      </a>
    </div>
  );
}
