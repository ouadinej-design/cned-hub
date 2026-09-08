# CNED Hub — Première 2026-2027

Application de suivi scolaire pour élève CNED Première Générale.

## Fonctionnalités

- 📅 **Planning annuel** jour par jour, toutes matières
- 📋 **Suivi des devoirs** avec règle des 14 jours, éligibilité contrôle continu
- 📖 **Cours interactifs** avec professeur IA (Français, Maths)
- ✏️ **Exercices** 3 niveaux (Facile, Moyen, Difficile)
- 🧪 **Quiz quotidiens** de consolidation
- 🎯 **Bac blanc** quotidien à partir du 26 avril
- 🤒 **Gestion des absences** avec rattrapage automatique
- ⚠️ **Règles CNED** et dates clés intégrées
- 🌙 **Mode sombre**
- 💾 **Sauvegarde** de la progression

## Installation

### 1. Cloner et installer

```bash
git clone https://github.com/ouadinej-design/cned-hub.git
cd cned-hub
npm install
```

### 2. Configurer la clé API Claude

Crée un fichier `.env.local` à la racine :

```
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXX
```

Tu peux obtenir une clé API sur https://console.anthropic.com

### 3. Lancer en local

```bash
npm run dev
```

Ouvre http://localhost:3000

### 4. Déployer sur Vercel

```bash
# Avec Vercel CLI
npx vercel

# Ou push sur GitHub → Vercel détecte automatiquement
git push origin main
```

**Important :** Ajoute la variable d'environnement `ANTHROPIC_API_KEY` dans les settings Vercel :
Project Settings → Environment Variables → Add `ANTHROPIC_API_KEY`

## Structure du projet

```
cned-app/
├── app/
│   ├── layout.js          # Layout principal
│   ├── page.js            # Page d'accueil (hub)
│   ├── globals.css         # Styles globaux + Tailwind
│   ├── api/
│   │   └── ai/
│   │       └── corriger/
│   │           └── route.js  # API sécurisée pour le prof IA
│   ├── planning/           # Page planning
│   ├── devoirs/            # Page suivi des devoirs
│   ├── regles/             # Page règles CNED
│   └── cours/              # Pages de cours par matière
├── components/             # Composants réutilisables
├── data/
│   └── cned-data.js        # Source unique : devoirs, vacances, emploi du temps
├── public/
│   └── manifest.json       # PWA manifest
├── package.json
├── tailwind.config.js
└── README.md
```

## Règles CNED intégrées

- ✅ Bac = 40% contrôle continu + 60% épreuves
- ✅ 100% devoirs S1 avant le 17 janvier 2027
- ✅ 100% devoirs S2 avant le 25 avril 2027
- ✅ 14 jours min entre 2 devoirs de même matière
- ✅ Devoirs dans l'ordre des séquences
- ✅ Après 25 avril → devoirs ne comptent plus
- ✅ Vacances = OFF, devoirs avancés avant les vacances

## Ajouter du contenu

Pour ajouter des cours (français, maths, etc.), créer des fichiers dans `data/cours/` :

```js
// data/cours/francais-seq1.js
export const FRANCAIS_SEQ1 = {
  title: "Séquence 1 — Les Cahiers de Douai",
  days: [
    {
      date: "2026-09-06",
      title: "Contexte historique",
      sections: [
        { title: "L'enfance de Rimbaud", content: "...", question: "..." },
      ],
      quiz: [{ q: "...", choices: ["..."], answer: 0 }],
    },
  ],
};
```
