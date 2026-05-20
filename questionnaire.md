# E-Commerce Web Shop Questionnaire

Welcome! Planning is the most crucial part of building a successful web shop. To help me understand exactly what you want to build and how we should design/architect it, please take a moment to answer the questions below. 

You can edit this file directly to add your answers, or you can reply in the chat and I will update this document for you.

---

## 1. Product & Business Model
* **What are you selling?** High-quality, aesthetic, and honest jewelry for men.
* **How many products are we starting with?** A single hero jewelry product at launch, allowing 100% focus on showcasing its premium value.
* **How will products be structured?** A highly detailed single product featuring interactive configuration options (size, color/materials like silver, gold).
* **Who is your target audience?** Fashion-conscious men who value aesthetic, high-quality, and honest jewelry.

---

## 2. Customer Experience & Core Features
* **User Accounts:** No user registration or customer accounts needed at launch. This keeps the initial user flow frictionless and lightweight.
* **Core Flow & Features:** A single-product landing page experience. The homepage functions as a high-fidelity showcase detailing the design, materials, and craftsmanship of the hero item. The center of attention is an interactive live product configurator. Clicking "Pre-order" or "Reserve" triggers a high-conversion newsletter/drop registration flow.
* **Special Shopping Features:** Focused purely on the single hero product with an Apple-style landing page feel (clean, immersive layouts, high-impact animations, interactive configuration). Secondary information and trust elements are separated into distinct pages:
  * **Secondary Pages:** Craftsmanship & Sourcing Page, Reviews Page, and FAQ Page.
  * **Drop Registration Flow:** Users choose their configuration (metal type, ring size, etc.) and enter their email address to register interest for the next exclusive product drop.

---

## 3. Design & Brand Aesthetics
* **Brand Assets:** Building from scratch. However, the brand identity should be extremely quiet, minimalist, and fade completely into the background. The focus is entirely on the item's material, weight, and craftsmanship. Truly high-quality jewelry does not need loud marketing or branding.
* **Visual Vibe & Aesthetic:** "Quiet Luxury" / "Understated Elegance". A premium, high-impact minimalist design inspired by Apple product landing pages:
  * **Color Palette:** Curated neutral HSL colors (e.g., deep slate/obsidian, soft mineral gray, pure matte white, with brushed silver/champagne gold accents) to reflect raw precious metals.
  * **Typography:** Clean, luxury typography focused on high readability and elegant letter-spacing.
* **Interactive Elements:** Immersive, buttery-smooth micro-animations. A fluid, interactive configurator (switching metals and sizes with sleek CSS state transitions) and a slide-out cart/checkout drawer to maintain a seamless flow.

---

## 4. Technical Stack & Architecture
* **Frontend Tech:** React + Vite. Perfect for building a highly reactive product page and custom configurator.
* **Styling Choice:** TailwindCSS v4. Provides rapid styling while enabling modern CSS design features and lightning-fast compilation.
* **Backend & Database:** Firebase (Cloud Firestore for database + Firebase Authentication for optional user logins). Completely serverless, real-time, and robust.
* **Payments & Integrations:** No active purchasing or payment processing functions at launch. Instead, a Firebase Firestore database integration will collect and securely store email registrations and their configured product variants. This allows data-driven validation of consumer interest and pricing before full production.

---

## 5. Administration & Order Fulfillment
* **Inventory Management:** Simple configuration. Product parameters (details, sizes, materials, prices) will be stored in a structured JSON configuration file and Firestore database (easily editable directly or in the console). No bloated admin UI required for managing a single product.
* **Interest Tracking & Admin Dashboard:** A private, secure administrative panel (e.g., `/admin/registrations`) that pulls data from Firestore to display registered emails, their chosen configurations (metal, size), and the dates they signed up. This acts as a centralized dashboard to track product demand.

---

## 6. Planning & Scope
* **What is the target timeline?** A rapid, short-term high-fidelity validation prototype to immediately test product-market fit and pricing.
* **What is the Minimum Viable Product (MVP)?**
  * Immersive Apple-style single-product showcase.
  * Interactive live product configurator (metal selections, sizing, pricing updates).
  * Exclusivity drop email registration flow (saving email and configuration state to Firestore).
  * Informative craftsmanship, materials, reviews, and FAQ sub-pages.
  * Private Admin Dashboard to view and analyze sign-ups.
