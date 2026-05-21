import React from "react";
import { ShoppingBag, ShieldCheck, Printer } from "lucide-react";
import { productConfig } from "../../productConfig";
import { useShop } from "../../context/ShopContext";

export default function Configurator({ setIsCheckoutOpen }) {
  const { 
    selectedMetal, setSelectedMetal, 
    selectedStone, setSelectedStone, 
    selectedLength, setSelectedLength, 
    totalPrice 
  } = useShop();

  // Calculate dynamic stone bead count
  const silverBeadCount = 3;
  const beadDiameterMm = 12;
  const estimatedStonesCount = Math.round((selectedLength.cm * 10) / beadDiameterMm) - silverBeadCount;

  const printMeasuringTape = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Rene Puskas — Printable Wrist Sizer</title>
          <style>
            body { font-family: sans-serif; padding: 40px; text-align: center; color: #333; }
            .ruler { display: flex; align-items: flex-start; justify-content: flex-start; border: 1px solid #000; height: 35px; width: 907px; margin: 40px auto; position: relative; }
            .mark { border-left: 1px solid #333; height: 10px; position: absolute; }
            .mark-five { height: 18px; border-left: 1.5px solid #000; }
            .mark-ten { height: 25px; border-left: 2px solid #000; }
            .mark-label { position: absolute; font-size: 10px; font-weight: bold; top: 28px; transform: translateX(-50%); }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; }
            .instruction { font-size: 14px; margin: 20px auto; max-width: 600px; line-height: 1.5; text-align: left; }
            .check-square { border: 1px solid #000; width: 50mm; height: 50mm; margin: 20px auto; display: flex; align-items: center; justify-content: center; font-size: 12px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RENE PUSKAS JEWELRY</h2>
            <p>1:1 Precision Wrist Measuring Tape</p>
          </div>
          
          <div class="instruction">
            <strong>CRITICAL PRINT INSTRUCTIONS:</strong> Before cutting and using this sizer, verify page scale. 
            Ensure your print dialog settings are set to <strong>"Actual Size"</strong> or <strong>"Page Scaling: None"</strong>. 
            Do NOT select "Fit to Page" or shrink to fit. Verify scale by measuring the square box below with a physical ruler. It must be exactly 50mm x 50mm.
          </div>
 
          <div class="check-square">
            50mm x 50mm<br/>Scale Verification Box
          </div>
 
          <div class="ruler">
            ${Array.from({ length: 241 }).map((_, i) => {
              const left = (i * 3.7795).toFixed(1); 
              let tickClass = "mark";
              let label = "";
              if (i % 10 === 0) {
                tickClass = "mark mark-ten";
                label = `<div class="mark-label" style="left: ${left}px">${i / 10} cm</div>`;
              } else if (i % 5 === 0) {
                tickClass = "mark mark-five";
              }
              return `<div class="${tickClass}" style="left: ${left}px"></div>${label}`;
            }).join("")}
          </div>
 
          <p class="no-print" style="margin-top: 50px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-weight: bold; background: #000; color: #fff; border: none; cursor: pointer;">Print Sizer Template</button>
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      
      {/* Left side: Premium Animated SVG Product Visualization */}
      <div className="lg:col-span-7 w-full aspect-square max-w-2xl mx-auto lg:sticky lg:top-32 flex items-center justify-center p-8 bg-coal/30 rounded-3xl border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        
        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full max-w-[450px] filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)]"
        >
          <defs>
            <linearGradient id="metal-silver" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#DFE0E6" />
              <stop offset="65%" stopColor="#8E9099" />
              <stop offset="100%" stopColor="#43444B" />
            </linearGradient>
            <linearGradient id="metal-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFECA1" />
              <stop offset="35%" stopColor="#D4AF37" />
              <stop offset="65%" stopColor="#AA820A" />
              <stop offset="100%" stopColor="#554100" />
            </linearGradient>
            <linearGradient id="metal-rose-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD5C8" />
              <stop offset="35%" stopColor="#C08A7C" />
              <stop offset="65%" stopColor="#9C5C4D" />
              <stop offset="100%" stopColor="#4A231A" />
            </linearGradient>
            <linearGradient id="agate-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4E4039" />
              <stop offset="25%" stopColor="#705C53" />
              <stop offset="50%" stopColor="#A38F85" />
              <stop offset="75%" stopColor="#5C4D46" />
              <stop offset="100%" stopColor="#302622" />
            </linearGradient>
            <radialGradient id="onyx-polished" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#7F7F7F" />
              <stop offset="15%" stopColor="#2A2A2A" />
              <stop offset="100%" stopColor="#050505" />
            </radialGradient>
            <radialGradient id="onyx-matte" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3E3E3E" />
              <stop offset="80%" stopColor="#1E1E1E" />
              <stop offset="100%" stopColor="#0B0B0B" />
            </radialGradient>
            <radialGradient id="lava-base" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4A4A4A" />
              <stop offset="70%" stopColor="#262626" />
              <stop offset="100%" stopColor="#121212" />
            </radialGradient>
            <filter id="lava-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="bead-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.8"/>
            </filter>
          </defs>

          <ellipse 
            cx="200" 
            cy="200" 
            rx="135" 
            ry="95" 
            fill="none" 
            stroke="#2E303A" 
            strokeWidth="2.5" 
            className="opacity-70"
          />

          <g filter="url(#bead-shadow)">
            <circle 
              cx="200" 
              cy="295" 
              r="15" 
              fill={`url(#metal-${selectedMetal.id})`} 
              stroke="rgba(0,0,0,0.3)" 
              strokeWidth="0.5" 
            />
            <line x1="200" y1="280" x2="200" y2="310" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
            <path 
              d="M 180,295 C 180,310 220,310 220,295" 
              fill="none" 
              stroke={`url(#metal-${selectedMetal.id})`} 
              strokeWidth="2" 
              className="opacity-80" 
            />
          </g>

          {Array.from({ length: estimatedStonesCount + silverBeadCount }).map((_, index) => {
            const total = estimatedStonesCount + silverBeadCount;
            const angle = (index / total) * Math.PI * 1.76 - Math.PI * 1.38; 
            const rx = 135;
            const ry = 95;
            const cx = 200 + rx * Math.cos(angle);
            const cy = 200 + ry * Math.sin(angle);

            const isSilverBead = index === 0 || index === Math.round(total / 3) || index === Math.round((2 * total) / 3);

            let beadFill = "url(#agate-grad)";
            let beadFilter = "url(#bead-shadow)";
            let sizeMultiplier = 1;

            if (isSilverBead) {
              beadFill = `url(#metal-${selectedMetal.id})`;
            } else {
              if (selectedStone.id === "black-trio") {
                const stoneCycle = index % 3;
                if (stoneCycle === 0) {
                  beadFill = "url(#lava-base)";
                  beadFilter = "url(#bead-shadow) url(#lava-noise)";
                  sizeMultiplier = 1.02;
                } else if (stoneCycle === 1) {
                  beadFill = "url(#onyx-matte)";
                } else {
                  beadFill = "url(#onyx-polished)";
                }
              } else {
                beadFill = "url(#agate-grad)";
              }
            }

            const beadRadius = 12 * sizeMultiplier;

            return (
              <g key={index} filter="url(#bead-shadow)">
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={beadRadius} 
                  fill={beadFill} 
                  filter={beadFilter}
                />
                {!isSilverBead && selectedStone.id === "black-trio" && (index % 3 === 2) ? (
                  <ellipse 
                    cx={cx - 3.5} 
                    cy={cy - 3.5} 
                    rx={3} 
                    ry={1.8} 
                    transform={`rotate(-25 ${cx - 3.5} ${cy - 3.5})`}
                    fill="rgba(255,255,255,0.4)" 
                  />
                ) : (
                  <circle 
                    cx={cx - 3} 
                    cy={cy - 3} 
                    r={beadRadius * 0.75} 
                    fill="rgba(255,255,255,0.06)" 
                    className="pointer-events-none"
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
          <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase">12MM BEADS / 1MM STEEL CORE</span>
          <span className="text-xs tracking-widest text-champagne-gold font-serif">{selectedMetal.label} Plating</span>
        </div>
      </div>

      {/* Right side: High-End Configuration Options */}
      <div className="lg:col-span-5 space-y-10 lg:pl-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-wide uppercase">
            {productConfig.name}
          </h1>
          <p className="text-xs sm:text-sm tracking-[0.2em] text-champagne-gold uppercase mt-2 font-medium">
            {productConfig.subtitle}
          </p>
          <div className="mt-6 flex items-baseline space-x-4">
            <span className="text-3xl font-light text-white tracking-wide">{totalPrice} €</span>
            <span className="text-xs text-mineral-slate tracking-widest uppercase font-mono">Pre-Order pricing</span>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-mineral-slate font-light">
          {productConfig.description}
        </p>

        {/* CONFIGURATOR STEP 1: SELECT METAL PLATING */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <label className="text-xs tracking-[0.2em] text-white uppercase font-semibold">1. SELECT METAL PLATING</label>
            <span className="text-xs text-mineral-slate font-serif">{selectedMetal.name}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {productConfig.metals.map((metal) => (
              <button
                key={metal.id}
                onClick={() => setSelectedMetal(metal)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 ${
                  selectedMetal.id === metal.id 
                    ? "border-champagne-gold bg-white/[0.02]" 
                    : "border-white/5 hover:border-white/20 hover:bg-white/[0.01]"
                }`}
              >
                <span 
                  className="w-5 h-5 rounded-full border border-white/20 mb-2.5 transition-transform duration-300"
                  style={{ backgroundColor: metal.colorCode, boxShadow: selectedMetal.id === metal.id ? "0 0 10px rgba(255,255,255,0.2)" : "none" }}
                />
                <span className="text-[10px] tracking-wider font-medium text-white uppercase">{metal.label}</span>
                <span className="text-[9px] text-mineral-slate mt-1">
                  {metal.priceModifier === 0 ? "Included" : `+${metal.priceModifier} €`}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-mineral-slate italic font-light">
            {selectedMetal.description}
          </p>
        </div>

        {/* CONFIGURATOR STEP 2: SELECT STONE BEAD VARIANT */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <label className="text-xs tracking-[0.2em] text-white uppercase font-semibold">2. SELECT STONE BEAD VARIANT</label>
            <span className="text-xs text-mineral-slate font-serif">{selectedStone.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {productConfig.stones.map((stone) => (
              <button
                key={stone.id}
                onClick={() => setSelectedStone(stone)}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 ${
                  selectedStone.id === stone.id 
                    ? "border-champagne-gold bg-white/[0.02]" 
                    : "border-white/5 hover:border-white/20 hover:bg-white/[0.01]"
                }`}
              >
                <span 
                  className="w-8 h-4 rounded-full border border-white/10 mb-3 block"
                  style={{ background: stone.beadColor }}
                />
                <span className="text-xs font-medium text-white uppercase tracking-wider">{stone.label}</span>
                <span className="text-[9px] text-mineral-slate mt-1 block leading-normal line-clamp-2">
                  {stone.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* CONFIGURATOR STEP 3: SIZE */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs tracking-[0.2em] text-white uppercase font-semibold">3. SELECT LENGTH (SIZE)</label>
            <button 
              onClick={() => printMeasuringTape()}
              className="text-xs text-champagne-gold hover:underline flex items-center space-x-1.5 focus:outline-none"
            >
              <Printer size={12} />
              <span>Printable Sizing Tape</span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {productConfig.lengths.map((len) => (
              <button
                key={len.cm}
                onClick={() => setSelectedLength(len)}
                className={`py-3 rounded-lg border text-center text-xs tracking-widest font-medium transition-all duration-300 ${
                  selectedLength.cm === len.cm 
                    ? "border-champagne-gold bg-white/[0.02] text-white" 
                    : "border-white/5 text-mineral-slate hover:border-white/20 hover:text-white"
                }`}
              >
                {len.cm} CM
              </button>
            ))}
          </div>
          <div className="bg-coal/20 border border-white/5 p-4 rounded-xl flex items-center justify-between text-xs tracking-wider font-light text-mineral-slate">
            <span>Contains: <strong className="text-white font-normal">{silverBeadCount} Silver Beads</strong></span>
            <span className="text-white/30">•</span>
            <span>Contains: <strong className="text-white font-normal">{estimatedStonesCount} Natural Stones</strong></span>
            <span className="text-white/30">•</span>
            <span>Clasp: <strong className="text-white font-normal">Double Lock</strong></span>
          </div>
        </div>

        {/* Primary Pre-Order Action Button */}
        <div className="pt-4 space-y-3">
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full py-5 rounded-xl bg-white text-black font-semibold hover:bg-champagne-gold hover:text-black shadow-[0_10px_20px_-10px_rgba(255,255,255,0.15)] hover:shadow-none hover:translate-y-px transition-all duration-300 tracking-[0.15em] text-sm uppercase flex items-center justify-center space-x-2"
          >
            <ShoppingBag size={16} />
            <span>PRE-ORDER NOW</span>
          </button>
          <div className="flex items-center justify-center space-x-2 text-[10px] sm:text-xs text-mineral-slate tracking-widest uppercase">
            <ShieldCheck size={14} className="text-champagne-gold" />
            <span>8 weeks procurement & studio handcrafting lifecycle updates</span>
          </div>
        </div>

      </div>
    </div>
  );
}
