import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Layers, 
  ShieldCheck, 
  Lock, 
  HelpCircle, 
  Star, 
  Menu, 
  X, 
  Mail, 
  Printer,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  Database
} from "lucide-react";
import { productConfig } from "./productConfig";
import { saveRegistration, getRegistrations, isMockFirebase, loginWithGoogle } from "./firebase/config";

export default function App() {
  // Navigation & View States
  const [currentTab, setCurrentTab] = useState("store"); // "store" | "craftsmanship" | "reviews" | "faq" | "admin"
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Configurator States
  const [selectedMetal, setSelectedMetal] = useState(productConfig.metals[0]);
  const [selectedStone, setSelectedStone] = useState(productConfig.stones[0]);
  const [selectedLength, setSelectedLength] = useState(productConfig.lengths[1]); // Default to 19cm

  // Modals & Registration Flow
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSizerOpen, setIsSizerOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Admin Dashboard States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminError, setAdminError] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, silver: 0, gold: 0, roseGold: 0, agate: 0, blackTrio: 0 });

  // Calculate dynamic stone bead count and total price
  const silverBeadCount = 3;
  const beadDiameterMm = 12;
  const estimatedStonesCount = Math.round((selectedLength.cm * 10) / beadDiameterMm) - silverBeadCount;
  const totalPrice = productConfig.basePrice + selectedMetal.priceModifier;

  // Load Registrations for Admin Dashboard
  useEffect(() => {
    if (currentTab === "admin" && isAdminLoggedIn) {
      fetchRegistrations();
    }
  }, [currentTab, isAdminLoggedIn]);

  const fetchRegistrations = async () => {
    setAdminLoading(true);
    try {
      const data = await getRegistrations();
      setRegistrations(data);
      
      // Calculate Stats
      const statsObj = { total: data.length, silver: 0, gold: 0, roseGold: 0, agate: 0, blackTrio: 0 };
      data.forEach((reg) => {
        if (reg.metal === "925 Sterling Silver") statsObj.silver++;
        else if (reg.metal === "18k Gold Plated") statsObj.gold++;
        else if (reg.metal === "18k Rose Gold Plated") statsObj.roseGold++;

        if (reg.stones === "Brown Stripe-Agate") statsObj.agate++;
        else if (reg.stones === "Black-Trio") statsObj.blackTrio++;
      });
      setStats(statsObj);
    } catch (error) {
      console.error("Failed to load registrations:", error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    try {
      setAdminError("");
      const result = await loginWithGoogle();
      if (result.success && result.user) {
        if (result.user.email === "rene.puskas@googlemail.com") {
          setAdminUser(result.user);
          setIsAdminLoggedIn(true);
        } else {
          setAdminError("Unauthorized email address.");
        }
      }
    } catch (error) {
      setAdminError("Authentication failed. Please try again.");
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveRegistration(emailInput, {
        metal: selectedMetal.name,
        stones: selectedStone.name,
        length: selectedLength.cm
      });
      
      if (result.success) {
        setSuccessData(result);
        setIsSuccess(true);
        setEmailInput("");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setIsModalOpen(false);
    setIsSuccess(false);
    setSuccessData(null);
  };

  // Helper to generate dynamic 1:1 measuring tape printable
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
            <!-- Generate ruler ticks dynamically up to 24cm -->
            ${Array.from({ length: 241 }).map((_, i) => {
              const left = (i * 3.7795).toFixed(1); // 1mm in pixels at 96 dpi is approx 3.7795px
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
    <div className="min-h-screen bg-obsidian text-silver-accent font-sans antialiased flex flex-col selection:bg-champagne-gold/30 selection:text-white">
      
      {/* 1. QUIET LUXURY HEADER */}
      <header className="sticky top-0 z-40 bg-obsidian/75 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => { setCurrentTab("store"); setIsMenuOpen(false); }}
            className="font-serif text-xl sm:text-2xl tracking-[0.25em] text-white hover:text-champagne-gold transition-colors focus:outline-none"
          >
            RENE PUSKAS
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-12">
            <button 
              onClick={() => setCurrentTab("store")}
              className={`text-sm tracking-widest hover:text-white transition-colors ${currentTab === "store" ? "text-white font-medium" : "text-mineral-slate"}`}
            >
              STORE
            </button>
            <button 
              onClick={() => setCurrentTab("craftsmanship")}
              className={`text-sm tracking-widest hover:text-white transition-colors ${currentTab === "craftsmanship" ? "text-white font-medium" : "text-mineral-slate"}`}
            >
              CRAFTSMANSHIP
            </button>
            <button 
              onClick={() => setCurrentTab("reviews")}
              className={`text-sm tracking-widest hover:text-white transition-colors ${currentTab === "reviews" ? "text-white font-medium" : "text-mineral-slate"}`}
            >
              REVIEWS
            </button>
            <button 
              onClick={() => setCurrentTab("faq")}
              className={`text-sm tracking-widest hover:text-white transition-colors ${currentTab === "faq" ? "text-white font-medium" : "text-mineral-slate"}`}
            >
              FAQ
            </button>
          </nav>

          {/* Admin Toggle & Mobile Menu Trigger */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentTab(currentTab === "admin" ? "store" : "admin")}
              className={`hidden sm:flex items-center space-x-2 text-xs tracking-widest px-3 py-1.5 rounded-full border hover:bg-white/5 transition-all ${
                currentTab === "admin" ? "border-champagne-gold text-champagne-gold" : "border-white/10 text-mineral-slate"
              }`}
            >
              <Lock size={11} />
              <span>{currentTab === "admin" ? "EXIT ADMIN" : "ADMIN"}</span>
            </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-mineral-slate hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden border-b border-white/5 bg-obsidian px-6 py-8 space-y-6 flex flex-col">
            <button 
              onClick={() => { setCurrentTab("store"); setIsMenuOpen(false); }}
              className={`text-left text-sm tracking-widest ${currentTab === "store" ? "text-white" : "text-mineral-slate"}`}
            >
              STORE
            </button>
            <button 
              onClick={() => { setCurrentTab("craftsmanship"); setIsMenuOpen(false); }}
              className={`text-left text-sm tracking-widest ${currentTab === "craftsmanship" ? "text-white" : "text-mineral-slate"}`}
            >
              CRAFTSMANSHIP
            </button>
            <button 
              onClick={() => { setCurrentTab("reviews"); setIsMenuOpen(false); }}
              className={`text-left text-sm tracking-widest ${currentTab === "reviews" ? "text-white" : "text-mineral-slate"}`}
            >
              REVIEWS
            </button>
            <button 
              onClick={() => { setCurrentTab("faq"); setIsMenuOpen(false); }}
              className={`text-left text-sm tracking-widest ${currentTab === "faq" ? "text-white" : "text-mineral-slate"}`}
            >
              FAQ
            </button>
            <button
              onClick={() => { setCurrentTab(currentTab === "admin" ? "store" : "admin"); setIsMenuOpen(false); }}
              className="text-left text-xs tracking-widest text-champagne-gold flex items-center space-x-2"
            >
              <Lock size={12} />
              <span>{currentTab === "admin" ? "EXIT ADMIN PANEL" : "ADMIN ACCESS"}</span>
            </button>
          </div>
        )}
      </header>

      {/* 2. TAB CONTROLLERS (CONTENT AREA) */}
      <main className="flex-grow">
        
        {/* ================= STORE TAB ================= */}
        {currentTab === "store" && (
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left side: Premium Animated SVG Product Visualization */}
            <div className="lg:col-span-7 w-full aspect-square max-w-2xl mx-auto lg:sticky lg:top-32 flex items-center justify-center p-8 bg-coal/30 rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
              
              {/* Dynamic SVG Visualizer of Beaded Bracelet */}
              <svg 
                viewBox="0 0 400 400" 
                className="w-full h-full max-w-[450px] filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)]"
              >
                <defs>
                  {/* Silver Brushed Gradient */}
                  <linearGradient id="metal-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="35%" stopColor="#DFE0E6" />
                    <stop offset="65%" stopColor="#8E9099" />
                    <stop offset="100%" stopColor="#43444B" />
                  </linearGradient>

                  {/* 18k Gold Plated Gradient */}
                  <linearGradient id="metal-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFECA1" />
                    <stop offset="35%" stopColor="#D4AF37" />
                    <stop offset="65%" stopColor="#AA820A" />
                    <stop offset="100%" stopColor="#554100" />
                  </linearGradient>

                  {/* 18k Rose Gold Plated Gradient */}
                  <linearGradient id="metal-rose-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FCD5C8" />
                    <stop offset="35%" stopColor="#C08A7C" />
                    <stop offset="65%" stopColor="#9C5C4D" />
                    <stop offset="100%" stopColor="#4A231A" />
                  </linearGradient>

                  {/* Agate Base Pattern */}
                  <linearGradient id="agate-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4E4039" />
                    <stop offset="25%" stopColor="#705C53" />
                    <stop offset="50%" stopColor="#A38F85" />
                    <stop offset="75%" stopColor="#5C4D46" />
                    <stop offset="100%" stopColor="#302622" />
                  </linearGradient>

                  {/* Onyx Solid Gradient */}
                  <radialGradient id="onyx-polished" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#7F7F7F" />
                    <stop offset="15%" stopColor="#2A2A2A" />
                    <stop offset="100%" stopColor="#050505" />
                  </radialGradient>

                  {/* Onyx Matte Gradient */}
                  <radialGradient id="onyx-matte" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3E3E3E" />
                    <stop offset="80%" stopColor="#1E1E1E" />
                    <stop offset="100%" stopColor="#0B0B0B" />
                  </radialGradient>

                  {/* Volcanic Lava Gradient with Noise */}
                  <radialGradient id="lava-base" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4A4A4A" />
                    <stop offset="70%" stopColor="#262626" />
                    <stop offset="100%" stopColor="#121212" />
                  </radialGradient>

                  {/* Organic texture noise overlay */}
                  <filter id="lava-noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                  </filter>

                  {/* Shadow filter for 3D depth */}
                  <filter id="bead-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.8"/>
                  </filter>
                </defs>

                {/* Bracelet structural background wire (subtle) */}
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

                {/* Snappable Magnetic Clasp & Safety Chain Detail (Bottom center) */}
                <g filter="url(#bead-shadow)">
                  {/* Round clasp shell */}
                  <circle 
                    cx="200" 
                    cy="295" 
                    r="15" 
                    fill={`url(#metal-${selectedMetal.id})`} 
                    stroke="rgba(0,0,0,0.3)" 
                    strokeWidth="0.5" 
                  />
                  {/* Center split snap line */}
                  <line x1="200" y1="280" x2="200" y2="310" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
                  
                  {/* safety chain loops (carabiner styling) */}
                  <path 
                    d="M 180,295 C 180,310 220,310 220,295" 
                    fill="none" 
                    stroke={`url(#metal-${selectedMetal.id})`} 
                    strokeWidth="2" 
                    className="opacity-80" 
                  />
                </g>

                {/* Render bracelet beads along oval perimeter */}
                {Array.from({ length: estimatedStonesCount + silverBeadCount }).map((_, index) => {
                  const total = estimatedStonesCount + silverBeadCount;
                  
                  // Math coordinates along ellipse. Leave bottom open for the clasp (offset indices)
                  const angle = (index / total) * Math.PI * 1.76 - Math.PI * 1.38; 
                  const rx = 135;
                  const ry = 95;
                  const cx = 200 + rx * Math.cos(angle);
                  const cy = 200 + ry * Math.sin(angle);

                  // Distribute 3 silver beads: one top center, two flanking midway
                  const isSilverBead = index === 0 || index === Math.round(total / 3) || index === Math.round((2 * total) / 3);

                  // Determine stone style for Agate vs Black-Trio
                  let beadFill = "url(#agate-grad)";
                  let beadFilter = "url(#bead-shadow)";
                  let sizeMultiplier = 1;

                  if (isSilverBead) {
                    beadFill = `url(#metal-${selectedMetal.id})`;
                  } else {
                    if (selectedStone.id === "black-trio") {
                      // Alternate between Lava, Matte Onyx, Polished Onyx
                      const stoneCycle = index % 3;
                      if (stoneCycle === 0) {
                        beadFill = "url(#lava-base)";
                        beadFilter = "url(#bead-shadow) url(#lava-noise)"; // Apply lava texture filter
                        sizeMultiplier = 1.02; // slightly organic raw size
                      } else if (stoneCycle === 1) {
                        beadFill = "url(#onyx-matte)";
                      } else {
                        beadFill = "url(#onyx-polished)";
                      }
                    } else {
                      // Agate style
                      beadFill = "url(#agate-grad)";
                    }
                  }

                  const beadRadius = 12 * sizeMultiplier;

                  return (
                    <g key={index} filter="url(#bead-shadow)">
                      {/* Bead Spherical Base */}
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={beadRadius} 
                        fill={beadFill} 
                        filter={beadFilter}
                      />
                      {/* Sphere light reflection cap overlay (adds premium high-end 3D glossy volumetric feel) */}
                      {!isSilverBead && selectedStone.id === "black-trio" && (index % 3 === 2) ? (
                        // Polished onyx gets high glossy reflect cap
                        <ellipse 
                          cx={cx - 3.5} 
                          cy={cy - 3.5} 
                          rx={3} 
                          ry={1.8} 
                          transform={`rotate(-25 ${cx - 3.5} ${cy - 3.5})`}
                          fill="rgba(255,255,255,0.4)" 
                        />
                      ) : (
                        // Other beads get a softer generic 3D reflection highlight
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

              {/* Dynamic specs tags overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <span className="text-[10px] tracking-[0.25em] text-white/40 uppercase">12MM BEADS / 1MM STEEL CORE</span>
                <span className="text-xs tracking-widest text-champagne-gold font-serif">{selectedMetal.label} Plating</span>
              </div>
            </div>

            {/* Right side: High-End Minimalist Configuration & Storytelling Details */}
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
                  <span className="text-xs text-mineral-slate tracking-widest uppercase">Pricing inclusive of luxury metals</span>
                </div>
              </div>

              {/* Honest jewelry introduction */}
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

              {/* CONFIGURATOR STEP 3: SIZE & Dynamic Calculation */}
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
                {/* Dynamically display honest bead-count and weight math */}
                <div className="bg-coal/20 border border-white/5 p-4 rounded-xl flex items-center justify-between text-xs tracking-wider font-light text-mineral-slate">
                  <span>Contains: <strong className="text-white font-normal">{silverBeadCount} Silver Beads</strong></span>
                  <span className="text-white/30">•</span>
                  <span>Contains: <strong className="text-white font-normal">{estimatedStonesCount} Natural Stones</strong></span>
                  <span className="text-white/30">•</span>
                  <span>Clasp: <strong className="text-white font-normal">Double Lock</strong></span>
                </div>
              </div>

              {/* Primary Call To Action (Limited Drops Validation Button) */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-5 rounded-xl bg-white text-black font-semibold hover:bg-champagne-gold hover:text-black shadow-[0_10px_20px_-10px_rgba(255,255,255,0.15)] hover:shadow-none hover:translate-y-px transition-all duration-300 tracking-[0.15em] text-sm uppercase flex items-center justify-center space-x-2"
                >
                  <Sparkles size={16} />
                  <span>RESERVE ACCESS TO NEXT DROP</span>
                </button>
                <div className="flex items-center justify-center space-x-2 text-[10px] sm:text-xs text-mineral-slate tracking-widest uppercase">
                  <ShieldCheck size={14} className="text-champagne-gold" />
                  <span>No payment required yet. Strictly limited verification slots.</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= CRAFTSMANSHIP TAB ================= */}
        {currentTab === "craftsmanship" && (
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

            {/* Material integrity highlights footer banner */}
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
        )}

        {/* ================= REVIEWS TAB ================= */}
        {currentTab === "reviews" && (
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
        )}

        {/* ================= FAQ TAB ================= */}
        {currentTab === "faq" && (
          <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 md:py-20 space-y-16">
            <div className="text-center space-y-4">
              <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide uppercase">
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <p className="text-sm leading-relaxed text-mineral-slate font-light">
                Answers regarding sizing, drop deliveries, and product details.
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
                  q: "How does the Limited Drop Reservation model work?",
                  a: "To eliminate mass production waste and guarantee premium craftsmanship, we release jewelry in highly regulated collections called 'Drops'. By reserving access today, you secure a production slot without entering payment. We will notify you in your inbox as soon as the collection drops."
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
        )}

        {/* ================= PRIVATE ADMIN REGISTERED ACCESS TAB ================= */}
        {currentTab === "admin" && (
          <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 md:py-20 space-y-12">
            
            {/* Admin Login Authorization Check */}
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto p-8 rounded-3xl bg-coal/20 border border-white/5 space-y-6 text-center">
                <Lock className="text-champagne-gold mx-auto" size={32} />
                <div>
                  <h3 className="font-serif text-xl text-white tracking-wide">Secure Admin Access</h3>
                  <p className="text-xs text-mineral-slate mt-2 tracking-wide font-light">
                    Authenticate with your Google account to view leads.
                  </p>
                </div>
                <div className="space-y-4 pt-4">
                  <button 
                    onClick={handleAdminLogin}
                    className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-champagne-gold hover:text-black tracking-[0.15em] text-sm uppercase transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.15)] hover:shadow-none hover:translate-y-px flex items-center justify-center space-x-3"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                  {adminError && <p className="text-red-400 text-xs mt-4 font-medium">{adminError}</p>}
                </div>
              </div>
            ) : (
              // ADMIN INTERFACE PANEL (AUTH OK)
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl text-white tracking-wide">
                      RESERVATIONS & DEMAND ANALYTICS
                    </h2>
                    <p className="text-xs text-mineral-slate tracking-widest uppercase mt-2 flex items-center space-x-2">
                      <Database size={12} className="text-champagne-gold" />
                      <span>{isMockFirebase ? "LOCAL STORAGE MODE" : "FIREBASE FIREBASE LIVE CLOUD"}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => fetchRegistrations()}
                      className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-white uppercase tracking-widest transition-all"
                    >
                      Refresh Data
                    </button>
                    <button 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,Email,Metal Plating,Stones,Length,Timestamp\n" + 
                          registrations.map(r => `"${r.email}","${r.metal}","${r.stones}",${r.length},"${r.timestamp}"`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `rp_drop_demand_${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-4 py-2 rounded-lg bg-champagne-gold text-black hover:bg-white text-xs font-semibold uppercase tracking-widest transition-all flex items-center space-x-1.5"
                    >
                      <FileSpreadsheet size={13} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Analytical Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-5 rounded-2xl bg-coal/20 border border-white/5 space-y-1">
                    <p className="text-[10px] text-mineral-slate tracking-widest uppercase">Total Demand Signups</p>
                    <p className="text-3xl font-light text-white font-serif">{stats.total}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-coal/20 border border-white/5 space-y-1">
                    <p className="text-[10px] text-mineral-slate tracking-widest uppercase">925 Sterling Silver Plating</p>
                    <p className="text-2xl font-light text-white font-serif">{stats.silver} <span className="text-xs text-mineral-slate">({stats.total ? Math.round((stats.silver / stats.total) * 100) : 0}%)</span></p>
                  </div>
                  <div className="p-5 rounded-2xl bg-coal/20 border border-white/5 space-y-1">
                    <p className="text-[10px] text-mineral-slate tracking-widest uppercase">18k Gold Plating</p>
                    <p className="text-2xl font-light text-white font-serif">{stats.gold + stats.roseGold} <span className="text-xs text-mineral-slate">({stats.total ? Math.round(((stats.gold + stats.roseGold) / stats.total) * 100) : 0}%)</span></p>
                  </div>
                  <div className="p-5 rounded-2xl bg-coal/20 border border-white/5 space-y-1">
                    <p className="text-[10px] text-mineral-slate tracking-widest uppercase">Agate vs Black-Trio</p>
                    <p className="text-2xl font-light text-white font-serif">
                      {stats.agate} / {stats.blackTrio}
                    </p>
                  </div>
                </div>

                {/* Lead Registrations Directory Table */}
                <div className="bg-coal/10 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    {adminLoading ? (
                      <div className="py-20 text-center text-xs tracking-widest text-mineral-slate uppercase">
                        Loading lead data...
                      </div>
                    ) : registrations.length === 0 ? (
                      <div className="py-20 text-center text-xs tracking-widest text-mineral-slate uppercase">
                        No drop registrations captured yet.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] tracking-widest text-mineral-slate uppercase">
                            <th className="p-4 pl-6">Email Address</th>
                            <th className="p-4">Metal Plating Selected</th>
                            <th className="p-4">Stone Variant</th>
                            <th className="p-4">Sizing Length</th>
                            <th className="p-4 text-right pr-6">Signup Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="text-white/80">
                          {registrations.map((reg, idx) => (
                            <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                              <td className="p-4 pl-6 font-semibold text-white">{reg.email}</td>
                              <td className="p-4 text-mineral-slate">{reg.metal}</td>
                              <td className="p-4 text-mineral-slate">{reg.stones}</td>
                              <td className="p-4">{reg.length} cm</td>
                              <td className="p-4 text-right text-[11px] text-mineral-slate pr-6 font-mono">
                                {new Date(reg.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* 3. EXCLUSIVITY RESERVATION MODAL (Pre-order / Drop signup) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div 
            onClick={() => resetFlow()} 
            className="absolute inset-0 bg-obsidian/90 backdrop-blur-md cursor-pointer" 
          />

          {/* Modal content body */}
          <div className="glass-premium rounded-3xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto relative z-10 space-y-6 select-text">
            
            {/* Close trigger */}
            <button 
              onClick={() => resetFlow()}
              className="absolute top-4 right-4 p-2 text-mineral-slate hover:text-white rounded-full hover:bg-white/5 focus:outline-none"
            >
              <X size={18} />
            </button>

            {/* A. Dynamic Success state display */}
            {isSuccess ? (
              <div className="text-center py-6 space-y-6">
                <CheckCircle className="text-champagne-gold mx-auto" size={54} />
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-white tracking-wide uppercase">RESERVATION RECORDED</h3>
                  <p className="text-xs text-mineral-slate tracking-widest uppercase">
                    You have secured slot for Drop #1
                  </p>
                </div>

                <div className="bg-coal/30 border border-white/5 p-4 rounded-2xl text-left text-xs space-y-2 leading-relaxed">
                  <div className="flex justify-between">
                    <span className="text-mineral-slate">Metal Plating:</span>
                    <span className="text-white font-medium">{selectedMetal.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mineral-slate">Stones:</span>
                    <span className="text-white font-medium">{selectedStone.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mineral-slate">Length (Size):</span>
                    <span className="text-white font-medium">{selectedLength.cm} cm</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                    <span className="text-champagne-gold font-medium">Estimated Pricing:</span>
                    <span className="text-white font-semibold">{totalPrice} €</span>
                  </div>
                </div>

                <p className="text-xs text-mineral-slate leading-relaxed font-light">
                  Thank you. Early production runs are strictly hand-assembled. We have locked in your specific config choices and registered your email. You will receive an priority alert as soon as our drop becomes live.
                </p>

                <button 
                  onClick={() => resetFlow()}
                  className="w-full py-3.5 rounded-lg border border-white/10 text-white font-semibold hover:bg-white hover:text-black tracking-widest text-xs uppercase transition-all duration-300"
                >
                  Return to Store
                </button>
              </div>
            ) : (
              // B. Initial input form state display
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-white tracking-wide uppercase">
                    DROP ACCESS REGISTRATION
                  </h3>
                  <p className="text-[10px] sm:text-xs text-mineral-slate tracking-widest uppercase mt-1">
                    Secure early allocation slot / Series 1
                  </p>
                </div>

                {/* Sizing confirmation alert */}
                <div className="p-4 rounded-xl bg-coal/20 border border-white/5 text-xs text-mineral-slate space-y-2">
                  <p className="font-semibold text-white uppercase tracking-wider text-[10px]">Your Selection Details:</p>
                  <p className="leading-relaxed">
                    {selectedMetal.name} plating, {selectedStone.name} stones, size {selectedLength.cm}cm. Estimated final price at drop: <strong>{totalPrice} €</strong>.
                  </p>
                </div>

                <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-[0.25em] text-white/50 uppercase font-semibold">ENTER EMAIL ADDRESS</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        required
                        placeholder="yourname@domain.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-lg bg-coal border border-white/10 text-white placeholder:text-mineral-slate/50 text-sm focus:outline-none focus:border-champagne-gold"
                      />
                      <Mail className="absolute left-4 top-3.5 text-mineral-slate" size={16} />
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-xs leading-relaxed text-mineral-slate font-light">
                    No payment credentials are captured. Registration acts purely as a non-binding demand reservation. We only email regarding direct Drop releases.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-champagne-gold tracking-widest text-xs sm:text-sm uppercase transition-all duration-300 flex items-center justify-center space-x-2 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.15)] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Recording Reservation...</span>
                    ) : (
                      <>
                        <span>CONFIRM RESERVATION SLOT</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. FOOTER */}
      <footer className="bg-obsidian border-t border-white/5 py-12 px-6 sm:px-8 mt-16 text-center text-xs tracking-widest text-mineral-slate space-y-4">
        <p className="font-light">
          © {new Date().getFullYear()} RENE PUSKAS. ALL RIGHTS RESERVED.
        </p>
        <p className="text-[10px] opacity-40 font-light max-w-md mx-auto leading-relaxed">
          Crafting honest, minimalist jewelry with architectural wire core structural integrity. Free from loud branding or marketing noise. Sourced from the earth, shaped by hands.
        </p>
      </footer>

    </div>
  );
}
