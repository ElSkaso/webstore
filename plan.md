# Project Plan & Technical Roadmap: Rene Puskas Jewelry

This is the master project plan and technical roadmap for the **Rene Puskas** quiet-luxury beaded bracelet web showcase. The goal of this application is to validate interest and pricing for an ultra-premium, honest-craftsmanship men's beaded bracelet through an interactive, Apple-style landing page and a limited-drop email registration flow.

---

## 1. Executive Summary
* **Brand Name:** Rene Puskas (minimalist typographic identifier, ultra-clean aesthetic).
* **Product:** A highly customizable, ultra-premium beaded bracelet:
  * **Bead Diameter:** 12mm
  * **Core Structure:** 1mm stainless steel wire, round magnetic clasp, additional carabiner safety chain.
  * **Materials & Configurator:**
    * *925 Sterling Silver Beads (3 per bracelet):* 925 Sterling Silver (Unplated), 18k Gold Plated, or 18k Rose Gold Plated.
    * *Stones:* Brown Stripe-Agate or Black-Trio (Lava, polished onyx, matte onyx).
    * *Length (CM):* Dynamically selectable, featuring a printable measuring tape tool.
* **Conversion / Validation Goal:** Users do not purchase directly. Clicking "Pre-order" or "Reserve" triggers a high-conversion email registration flow for the next limited product drop, capturing user configurations (metal choice, stones, size) directly in Firestore to validate demand.

---

## 2. Technical Stack & Architecture
* **Frontend Framework:** React (Vite setup) for responsive, highly reactive component states.
* **Styling System:** TailwindCSS v4 for modern utility classes, lightning-fast compilation, and native CSS variable integrations.
* **Database & Auth:** Firebase (Cloud Firestore) for secure storage of drop registrations and admin access control.
* **Hosting:** Static hosting (e.g., Firebase Hosting or Vercel).
* **Lead Tracking & Dashboard:** Secure admin panel (`/admin/registrations`) displaying registered emails, selected bracelet configuration specs, and dates.

---

## 3. UI/UX Design System (Quiet Luxury)
To capture the raw, mineral-focused, and premium nature of the materials, the design system utilizes a dark, high-contrast, minimalist "obsidian" aesthetic.

### 🎨 Color Palette
* **Obsidian Base (Background):** `hsl(220, 15%, 8%)` — Rich matte black.
* **Warm Coal (Containers/Cards):** `hsl(220, 12%, 14%)` — Subtle contrast with glassmorphism backdrop-blur.
* **Silver Accent (Metals/Typography):** `hsl(0, 0%, 90%)` — Pure metallic reflection.
* **Gold Highlight (Plated):** `hsl(38, 40%, 65%)` — Soft champagne gold.
* **Rose Gold Highlight (Plated):** `hsl(15, 35%, 70%)` — Warm cooper copper gold.
* **Muted Mineral Slate (Subtext):** `hsl(220, 10%, 60%)` — Balanced, organic grays.

### ✍️ Typography
* **Primary / Header:** Refined luxury serif (e.g., *Cinzel* or *Playfair Display* via Google Fonts) for a high-end, timeless feel.
* **Body / Interface:** Crisp, high-readability sans-serif (e.g., *Inter* or *Outfit* via Google Fonts) with open tracking (letter-spacing) for clean layouts.

### ✨ Motion & Micro-Animations
* **Interactive Configurator:** Seamless CSS transitions when toggling bead plating (Silver/18k Gold/18k Rose Gold) and stones (Agate vs. Black-Trio).
* **Apple-Style Scroll Triggers:** Clean fade-ins and subtle scale transitions as users scroll through details of the carabiner safety chain, magnetic clasp, and precious metals.

---

## 4. Milestones & Implementation Steps

### 🏁 Phase 1: Environment Setup & Scaffolding
- [ ] Initialize a React app using Vite in the workspace root.
- [ ] Configure TailwindCSS v4 and integrate Google Fonts (*Playfair Display* & *Inter*).
- [ ] Set up Firebase SDK configuration (scaffold Firestore models and collections).
- [ ] Establish basic layouts (responsive grid container, global quiet-luxury CSS rules).

### 💎 Phase 2: Immersive Hero Landing Page & Configurator
- [ ] **Hero Section:** Full-screen high-impact image showcase of the bracelet with elegant typography (understated "Rene Puskas" logo).
- [ ] **Interactive Live Configurator:**
  - [ ] Render a live, responsive visualization of the bracelet showing bead colors & textures.
  - [ ] Implement toggle selectors for **Metal Plating** (Silver, 18k Gold, 18k Rose Gold) and **Stone Type** (Brown Stripe-Agate, Black-Trio).
  - [ ] Dynamically calculate and display the number of stone beads depending on the selected bracelet length.
  - [ ] Sizing selection with a link to open/print a custom measuring tape template.

### 📬 Phase 3: Exclusivity Drop Validation Flow
- [ ] Build the "Reserve / Pre-order" CTA button with luxury click interactions.
- [ ] Develop the Drop Registration Modal:
  - [ ] Captures: User Email, chosen Metal Plating, Stone Type, and Bracelet Length.
  - [ ] Submits data to Cloud Firestore under a `registrations` collection.
  - [ ] Displays a beautiful "Reservation Successful" overlay with scarcity storytelling (e.g., *"Drop #1 is strictly limited. You will receive priority access in your inbox."*).

### 📜 Phase 4: Secondary Pages & Trust Building
- [ ] **Craftsmanship & Sourcing Page:** Editorial layout detailing the sourcing of 925 sterling silver, natural stone beads (lava, onyx, stripe-agate), 1mm steel wire, and structural hardware integrity.
- [ ] **Reviews Page:** Clean, honest customer feedback modules showcasing authentic reviews.
- [ ] **FAQ Page:** Sizing guidelines, metal plating care, and shipping drop logistics.

### 🛡️ Phase 5: Private Admin Demand Dashboard
- [ ] Create a secure route at `/admin/registrations`.
- [ ] Build a sleek, minimalist dashboard showing key metrics:
  - [ ] Total signups.
  - [ ] Popularity distribution of metals (Silver vs. 18k Gold vs. 18k Rose Gold) and stones.
  - [ ] Average requested bracelet length.
  - [ ] Complete list of registered users and configurations (sortable by date).

### 🧪 Phase 6: Refinement, Verification & Polish
- [ ] Optimize load performance (lazy loading images, optimizing SVGs for textures).
- [ ] Implement responsive behavior for all screen sizes (mobile, tablet, desktop).
- [ ] Perform a comprehensive audit for color contrasts and typographic spacing.

---

## 5. Verification Plan

### Automated & Layout Checks
* **Mobile-First Responsiveness:** Test visual rendering on screens from 320px to 2560px.
* **Database Pipeline Integrity:** Submit mock drop registrations and verify that Firestore correctly records fields (`email`, `metal`, `stones`, `length`, `timestamp`).

### Manual & UX Audits
* **Configurator State Check:** Verify that selecting "18k Gold Plated" instantly swaps highlights and details in the pricing/config state.
* **Exclusivity Flow Validation:** Ensure the registration modal cannot be submitted with empty or invalid email formatting.
