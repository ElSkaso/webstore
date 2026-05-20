export const productConfig = {
  id: "rp-beaded-bracelet-s1",
  name: "The Beaded Bracelet",
  subtitle: "Series 1 — Honest Raw Craft",
  basePrice: 165, // In EUR
  description: "A profound statement of raw mineral weight and architectural symmetry. Designed for the modern man, this bracelet anchors the wrist with cold precious metal and porous volcanic textures.",
  details: {
    beadDiameter: "12mm",
    coreStructure: "1.0mm marine-grade stainless steel wire core",
    clasp: "Architectural round magnetic clasp",
    safetyChain: "Additional micro-carabiner safety chain locking mechanism",
  },
  metals: [
    {
      id: "silver",
      name: "925 Sterling Silver",
      label: "925 Silver",
      colorCode: "#E5E4E2",
      priceModifier: 0,
      description: "Raw unplated 925 sterling silver beads with natural brushed texture."
    },
    {
      id: "gold",
      name: "18k Gold Plated",
      label: "18k Gold",
      colorCode: "#D4AF37",
      priceModifier: 20,
      description: "Thick 18-karat gold plating over solid sterling silver core."
    },
    {
      id: "rose-gold",
      name: "18k Rose Gold Plated",
      label: "18k Rose Gold",
      colorCode: "#C08A7C",
      priceModifier: 25,
      description: "Chasing sunset warmth with premium 18-karat copper-infused rose gold."
    }
  ],
  stones: [
    {
      id: "agate",
      name: "Brown Stripe-Agate",
      label: "Stripe-Agate",
      beadColor: "linear-gradient(45deg, #4A3E3D 0%, #8C7B73 50%, #4A3E3D 100%)",
      description: "Deep, organic sediment bands showcasing ancient mineral layers.",
      beadDetailDescription: "Natural banded silicate mineral displaying warm chestnut stripes."
    },
    {
      id: "black-trio",
      name: "Black-Trio",
      label: "Lava / Onyx Trio",
      beadColor: "linear-gradient(135deg, #1C1C1C 0%, #303030 40%, #0F0F0F 100%)",
      description: "A triptych of shadow: porous volcanic Lava, high-gloss Polished Onyx, and velvet Matte Onyx.",
      beadDetailDescription: "A rhythmic combination of raw tactile volcanic rock and sleek glass-like onyx beads."
    }
  ],
  lengths: [
    { cm: 17, label: "17 cm — Small" },
    { cm: 19, label: "19 cm — Medium" },
    { cm: 21, label: "21 cm — Large" },
    { cm: 23, label: "23 cm — Extra Large" }
  ],
  sourcing: {
    headline: "Pure Elements. No Compromises.",
    intro: "We believe luxury is a contract of absolute honesty. Every bead, wire, and clasp is sourced from certified, ethical refiners and shaped under meticulous craftsmanship.",
    aspects: [
      {
        title: "925 Sterling Silver",
        text: "Cold to the touch, heavy on the skin. Our silver beads are custom-cast at 12mm and hand-brushed for a textured, anti-reflective matte finish. No synthetic coatings, allowing natural character to evolve over time."
      },
      {
        title: "Volcanic Rock & Agate",
        text: "Our stones are earth-made, not chemical-molded. The Black-Trio features vesicular basalt basalt (lava) erupted from ancient magma vents, contrasted with crystalline silica onyx. Agate beads display distinct zebra banding — no two bracelets are identical."
      },
      {
        title: "Stainless Core Integrity",
        text: "Unlike cheap elastic strings that rot and snaps, our beads ride on a 1.0mm high-tensile stainless steel wire core. Designed to withstand extreme stress and resist saltwater, sweat, and active wear."
      },
      {
        title: "Double-Security Clasp",
        text: "Features a strong neodymium orb magnetic clasp that snaps shut effortlessly, backed by a micro-carabiner safety chain. Quick to equip, impossible to lose accidentally."
      }
    ]
  }
};
