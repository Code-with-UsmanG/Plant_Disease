# PlantGuard — Diagnostic Instrument (Frontend Revamp)

A full rebuild of the plant disease detection frontend, moved from static HTML/CSS/JS
to **React + TypeScript + Vite**. Same FastAPI backend and model — new interface, new
visual language, and a much faster build pipeline.

## Why this stack

- **Vite** — near-instant dev server, and a production build that ships ~50 KB gzipped
  of JS with no runtime framework bloat. This is what fixes the "slow to interact with"
  complaint: the old site loaded fonts/CSS/JS in a render-blocking chain with no bundling
  or minification; this one ships pre-optimized, code-split, cached assets.
- **React + TypeScript** — the upload → loading → results → error flow is now modeled as
  explicit, type-checked state instead of manually toggling `hidden` attributes on DOM
  nodes, which is where most of the old script's fragility lived.
- **Hand-written CSS with design tokens** (`src/styles/tokens.css`) instead of a UI
  kit — so the visual identity is specific to this product rather than a generic
  component-library look.

## Design direction

The visual language is built around the idea of a **lab diagnostic instrument** for
plant pathology, not a generic "AI SaaS" landing page:

- **Color** — pulled from real plant pigments (chlorophyll green, anthocyanin wine,
  xanthophyll gold) but desaturated into a clinical, print-safe palette. See
  `src/styles/tokens.css` for the full token set.
- **Type** — Fraunces (display) for a botanical-but-modern serif headline face, Work
  Sans for body copy, and IBM Plex Mono for every number, percentage, and class label —
  so a reading always looks like an instrument's numeric printout, not decorative text.
- **Signature moment** — while a specimen is being analyzed, a leaf-vein path draws
  itself across the photo (`ScanningOverlay.tsx`), tying the loading state directly to
  the subject matter instead of a generic spinner.
- **Results panel** — redesigned as a full diagnostic readout: status chip, confidence
  gauge with tick marks, a plain-language reading, a specific recommended action drawn
  from a small rules engine (`src/diagnosis.ts`) keyed to the actual pathology (blight,
  rust, mildew, viral, bacterial, etc.), and the full top-3 ranked printout.

## Project structure

```
plantguard/
├─ index.html
├─ src/
│  ├─ main.tsx              # entry point
│  ├─ App.tsx                # view-state orchestration (upload/loading/results/error)
│  ├─ api.ts                  # fetch() wrapper for the FastAPI backend
│  ├─ diagnosis.ts            # condition → plain-language reading + advice
│  ├─ types.ts
│  ├─ styles/
│  │  ├─ tokens.css           # design tokens: color, type, spacing
│  │  ├─ global.css           # resets, base type, buttons
│  │  └─ app.css              # component styling
│  └─ components/
│     ├─ Header.tsx
│     ├─ Hero.tsx
│     ├─ SpecimenUpload.tsx
│     ├─ ScanningOverlay.tsx
│     ├─ DiagnosticReadout.tsx
│     ├─ ErrorPanel.tsx
│     └─ Footer.tsx
└─ public/
   └─ leaf-mark.svg
```

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

## Pointing it at your backend

The backend (`backend/app.py` in the original repo — FastAPI + the ResNet-9 model) is
unchanged. By default the frontend calls the same Hugging Face Space used before:

```
https://usmang-plant-disease-detection.hf.space
```

To point at a different backend (local dev, your own deployment), create a `.env` file:

```
VITE_API_URL=http://localhost:8000
```

The expected response shape from `POST /predict` (multipart form field `image`) is
unchanged from the original backend:

```json
{
  "prediction": "Tomato___Early_blight",
  "plant": "Tomato",
  "condition": "Early blight",
  "is_healthy": false,
  "confidence": 92.4,
  "top_3": [{ "class_name": "...", "plant": "...", "condition": "...", "is_healthy": false, "confidence": 92.4 }]
}
```

## Deployment

This is a static site after `npm run build` — deploy `dist/` to Vercel, Netlify,
Cloudflare Pages, or GitHub Pages. Set `VITE_API_URL` as an environment variable on
whichever platform you use if you're not using the default Hugging Face Space.

## Notes for the paper

If you're citing this in your research writeup: the frontend change doesn't touch the
model, preprocessing, or class list — accuracy and predictions are identical to the
original backend. What changed is purely presentation and delivery (bundle size, load
time, and the clarity of how a prediction is explained to a reader).
