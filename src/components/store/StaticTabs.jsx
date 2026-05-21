import React from "react";
import { Layers, Star, HelpCircle } from "lucide-react";
import { productConfig } from "../../productConfig";

export default function StaticTabs({ currentTab }) {
  if (currentTab === "craftsmanship") {
    return (
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 md:py-20 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide uppercase">
            {productConfig.sourcing.headline}
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-mineral-slate font-light max-w-2xl mx-auto">
            {productConfig.sourcing.intro}
          </p>
          <div className="w-12 h-px bg-champagne-gold mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-6">
          {productConfig.sourcing.aspects.map((aspect, idx) => (
            <div 
              key={idx}
              className="p-6 md:p-8 rounded-2xl bg-coal/20 border border-white/5 hover:border-white/10 transition-all duration-300 space-y-3 hover:translate-y-[-2px]"
            >
              <div className="flex items-center space-x-3 text-champagne-gold">
                <span className="font-serif text-xl tracking-wider">0{idx + 1}.</span>
                <h3 className="font-serif text-lg tracking-wide text-white">{aspect.title}</h3>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-mineral-slate font-light">
                {aspect.text}
              </p>
            </div>
          ))}
        </div>

        <div className="glass-premium rounded-3xl p-8 md:p-12 text-center space-y-6 max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-silver-accent via-champagne-gold to-rose-gold" />
          <Layers className="text-champagne-gold mx-auto" size={32} />
          <h3 className="font-serif text-xl md:text-2xl text-white tracking-wide">
            Indestructible Structural Integrity
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-mineral-slate font-light max-w-xl mx-auto">
            We stringently construct our bracelets on a solid 1mm stainless steel wire. It is chemical-resistant, corrosion-proof, and impervious to daily life. It represents the literal core of Rene Puskas: honest materials built to last a lifetime.
          </p>
        </div>
      </div>
    );
  }

  if (currentTab === "reviews") {
    return (
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 md:py-20 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide uppercase">
            HONEST FEEDBACK
          </h2>
          <p className="text-sm leading-relaxed text-mineral-slate font-light max-w-lg mx-auto">
            Real customer feedback of early pre-production releases. Every review represents genuine verification.
          </p>
          <div className="w-12 h-px bg-champagne-gold mx-auto mt-6" />
        </div>

        <div className="space-y-6 max-w-3xl mx-auto">
          {[
            {
              name: "Alexander M.",
              rating: 5,
              date: "2026-05-12",
              metal: "925 Sterling Silver Plating",
              text: "The weight is the first thing that hits you. The volcanic lava stones have an incredibly tactile feel, and the magnetic clasp has such a premium snapping sound. Feels raw and exceptionally high-end."
            },
            {
              name: "Julian B.",
              rating: 5,
              date: "2026-04-28",
              metal: "18k Gold Plated",
              text: "A beautiful, quiet luxury accessory. No visible branding makes it perfect. The safety chain is such a clever lock design. I printed the paper tape size guide and the 19cm fit is perfectly snug."
            },
            {
              name: "Maximilian S.",
              rating: 4,
              date: "2026-04-15",
              metal: "18k Rose Gold Plated",
              text: "Very polished piece. The contrast between the rough lava rock and the smooth shiny onyx beads in the Black-Trio version is brilliant. Worth every euro."
            }
          ].map((rev, idx) => (
            <div key={idx} className="p-6 md:p-8 rounded-2xl bg-coal/20 border border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-white tracking-wide">{rev.name}</h4>
                  <p className="text-[10px] text-mineral-slate mt-0.5 tracking-wider">{rev.metal} / Size: Medium</p>
                </div>
                <div className="flex items-center space-x-1 text-champagne-gold">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-mineral-slate font-light italic">
                "{rev.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentTab === "faq") {
    return (
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 md:py-20 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide uppercase">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-sm leading-relaxed text-mineral-slate font-light">
            Answers regarding sizing, pre-order timelines, and metal care.
          </p>
          <div className="w-12 h-px bg-champagne-gold mx-auto mt-6" />
        </div>

        <div className="space-y-6">
          {[
            {
              q: "How do I know my correct wrist length?",
              a: "Use our custom 'Printable Sizing Tape' utility on the store page. Ensure your printer scale is set to '100%' / 'Actual Size' before printing. Wrap the cut-out tape securely around your wrist. If you do not have a printer, wrap a physical piece of paper around your wrist and measure it against a standard ruler in centimeters."
            },
            {
              q: "How does the Pre-Order and E-Mail update system work?",
              a: "To eliminate inventory waste and support highly ethical crafting, each beaded bracelet is built to order. Sourcing materials from Bali takes ca. 4-5 weeks, followed by 2 weeks handcrafting in Germany. Throughout this 8-week lifecycle, we email you status updates at 4 exact stages: Order Confirmed, Bali Procurement, Sourcing Done/Production Start, and Dispatch."
            },
            {
              q: "Will the silver beads oxidise or tarnish?",
              a: "Our beads are made of genuine 925 sterling silver. Unplated silver will slowly build an organic patina unique to your skin oils, which is a desirable premium aspect. If you prefer high-lustre brilliance, a quick swipe with a microfiber polishing cloth restores complete silver reflections immediately."
            },
            {
              q: "Is the magnetic clasp secure enough for active wear?",
              a: "Absolutely. The clasp is custom-crafted around strong neodymium magnets. However, to guarantee it is impossible to lose accidentally, we have integrated a micro-carabiner safety chain. Even if the magnet is forced open, the safety chain captures the bracelet securely around your wrist."
            }
          ].map((faq, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-coal/10 border border-white/5 space-y-3">
              <h4 className="font-serif text-sm font-semibold text-white tracking-wide flex items-start space-x-2">
                <HelpCircle size={15} className="text-champagne-gold mt-0.5 flex-shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-mineral-slate font-light pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
