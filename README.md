# Rene Puskas Jewelry — Quiet Luxury Web Store

Welcome to the **Rene Puskas** single-product validation e-commerce store. This project is a highly responsive, interactive, and premium web application designed to showcase an ultra-premium men's beaded bracelet and validate market demand through a limited-drop email registration flow.

## 💎 Project Overview
- **Brand Aesthetic:** "Quiet Luxury" — Minimalist typography, deep obsidian contrasts, and high-impact material textures.
- **Product Details:** 12mm Natural Stones (Agate/Onyx/Lava) and 925 Sterling Silver beads (with 18k Gold and Rose Gold plating options) strung on a 1mm stainless steel wire with a secure magnetic clasp.
- **Conversion Goal:** Frictionless email capture. Users configure their exact bracelet spec and "Reserve" a spot for the next drop (no payment captured yet).

## 🛠️ Technical Stack
- **Frontend Framework:** React + Vite
- **Styling System:** TailwindCSS v4 (Custom color tokens in `index.css`)
- **Database & Auth:** Firebase Cloud Firestore & Google Authentication
- **CI/CD:** GitHub Actions to Firebase Hosting

## 🚀 Running the Project Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Database Modes (Mock vs Live)
This project features a seamless **Dual-Mode Database Architecture**:
- **Mock Mode (Default):** If no Firebase API keys are present in a `.env` file, the app automatically falls back to browser `localStorage`. You can fully test the configurator, drop registrations, and the `/admin` dashboard without needing a live backend!
- **Live Firebase Mode:** To connect to the real production database, create a `.env` file in the root directory and populate it with your Firebase web credentials (`VITE_FIREBASE_API_KEY`, etc.).

## 🔐 Secure Admin Dashboard
The project includes a private administrative dashboard located at `/admin`.
- It tracks real-time demand analytics (plating preferences, sizing averages, and stone ratios).
- It features a 1-click **Export CSV** tool for marketing lists.
- **Security:** The dashboard is protected via Firebase Google Authentication and strictly hardcoded to only grant access to the authorized owner email (`rene.puskas@googlemail.com`).

## 📚 Agent & Developer Documentation
For detailed planning, workflows, and next steps, please refer to the markdown files in this repository:
- 📄 [AGENTS.md](./AGENTS.md) — System instructions and trigger words for AI agents.
- 📄 [plan.md](./plan.md) — The master architectural roadmap and design system.
- 📄 [next-steps.md](./next-steps.md) — Action checklist for deployment and live database integration.
- 📄 [questionnaire.md](./questionnaire.md) — The original discovery document for the project scope.
