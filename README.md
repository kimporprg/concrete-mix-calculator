# MixDesign — ACI 211.1 Concrete Mix Calculator

A mobile-first PWA implementing the ACI 211.1 absolute volume method for normal-weight concrete.

## Features
- Full 10-step ACI 211.1 workflow
- Moisture-corrected field quantities
- Material proportions & absolute volumes
- Quantity calculator (slab, beam, column, footing, circular column)
- CSV export
- Works offline on iPhone/iPad after first load
- Inputs persist via localStorage

## Quick Start (Local Dev)

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

### 1. Create the repository
- Go to github.com → New repository → name it `concrete-mix-design` (or any name)
- Copy your repo name

### 2. Update vite.config.js
Edit `vite.config.js` and change `base` to match your repo name:
```js
base: '/concrete-mix-design/',   // ← must match your GitHub repo name exactly
```

### 3. Enable GitHub Pages
- Go to your repo → **Settings** → **Pages**
- Under **Source**, select **GitHub Actions**
- Save

### 4. Push to main
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/concrete-mix-design.git
git push -u origin main
```

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy. Your site will be live at:
```
https://YOUR_USERNAME.github.io/concrete-mix-design/
```

## File Structure

```
concrete-mix/
├── src/
│   ├── lib/aci211.js          ← Pure JS ACI engine
│   ├── hooks/useLocalStorage.js
│   └── components/
│       ├── InputPanel.jsx
│       ├── ResultsPanel.jsx
│       ├── StepsTab.jsx
│       ├── MaterialsTab.jsx
│       ├── VolumesTab.jsx
│       └── QuantityTab.jsx
├── .github/workflows/deploy.yml
├── vite.config.js
└── public/manifest.json
```
