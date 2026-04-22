<div align="center">

# 📋✨ Sharone - Analyseur de CV par IA

**Système intelligent de tri et d'analyse de CV pour la Faculté des sciences juridiques, économiques et sociales**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

![Aperçu](public/Analyseur%20CV%20logo.png)

</div>

---

## 🎯 Objectif

**Sharone** est une application web moderne qui utilise l'Intelligence Artificielle pour analyser et trier automatiquement des CVs en format PDF. L'application fournit un dashboard professionnel avec des statistiques détaillées, des scores personnalisés et des visualisations animées pour faciliter le processus de recrutement.

---

## ✨ Fonctionnalités

### 📊 Dashboard des résultats
- ✅ **Vue résultats uniquement** : Les champs d'upload disparaissent quand les résultats sont affichés
- ✅ **Statistiques globales** : Total CV, Score moyen, Score maximum, Score minimum, Candidats ≥ 60%
- ✅ **Cartes candidates triées** par score global du plus élevé au plus bas
- ✅ **Couleur dynamique des cartes** :
  - 🟢 **Vert** : Score ≥ 60%
  - ⚪ **Blanc** : 50% ≤ Score < 60%
  - 🟠 **Orange/Rouge** : Score < 50%

### 👤 Détails par candidat
- ✅ **Cartes cliquables** qui ouvrent un popup modal
- ✅ **Graphiques circulaires animés** pour tous les scores
- ✅ Toutes les compétences techniques (sans limite)
- ✅ Langues parlées avec niveau de maîtrise
- ✅ Secteurs d'activité
- ✅ Niveau d'étude, expérience, entreprises précédentes
- ✅ Décision et justification détaillée

### 📤 Fonctionnalités d'upload
- ✅ Drag & Drop multiple de fichiers PDF
- ✅ Sélection par clic
- ✅ Visualisation des fichiers sélectionnés
- ✅ Suppression individuelle des fichiers
- ✅ Indicateur de progression pendant l'analyse

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Étapes d'installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/adilychaik/sharone.git
cd sharone

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos configurations

# 4. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

### Build pour production
```bash
npm run build
npm start
```

---

## 🖥️ Utilisation

1. 📁 Glissez vos CVs au format PDF dans la zone prévue
2. ✨ Cliquez sur **Analyser**
3. 📊 Consultez le dashboard avec les statistiques
4. 👆 Cliquez sur n'importe quelle carte pour voir les détails complets
5. 🔄 Cliquez sur **Nouvelle analyse** pour recommencer

---

## 📁 Structure du projet

```
sharone/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Page principale
│   │   ├── layout.tsx        # Layout global
│   │   └── api/
│   │       └── extract/      # API d'extraction et analyse
├── public/                   # Assets publics
├── package.json
└── README.md
```

---

## 🛠️ Technologies

| Technologie | Rôle |
|------------|------|
| **Next.js 16** | Framework React avec Turbopack |
| **TypeScript** | Typage statique |
| **Tailwind CSS** | Design system et utilitaires |
| **API Routes** | Backend intégré |

---

## 👥 Équipe

Projet développé pour la **Faculté des sciences juridiques, économiques et sociales**

---

<div align="center">

Fait avec 💜 à Tanger, Maroc

**© 2026 Sharone - Tous droits réservés**

</div>
