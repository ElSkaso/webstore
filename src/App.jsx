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
  Database,
  CreditCard,
  Send,
  ShoppingBag,
  Eye,
  RefreshCw,
  Landmark,
  ExternalLink
} from "lucide-react";
import { productConfig } from "./productConfig";
import { 
  saveRegistration, 
  getRegistrations, 
  isMockFirebase, 
  loginWithGoogle, 
  markRegistrationsExported,
  saveOrder,
  getOrders,
  updateOrderStatus,
  batchUpdateOrderStatus,
  getEmailTemplateHtml
} from "./firebase/config";

export default function App() {
  // Navigation & View States
  const [currentTab, setCurrentTab] = useState("store"); // "store" | "craftsmanship" | "reviews" | "faq" | "admin"
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Configurator States
  const [selectedMetal, setSelectedMetal] = useState(productConfig.metals[0]);
  const [selectedStone, setSelectedStone] = useState(productConfig.stones[0]);
  const [selectedLength, setSelectedLength] = useState(productConfig.lengths[1]); // Default to 19cm

  // Checkout & Pre-order Drawer States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("form"); // "form" | "processing" | "success"
  
  // Checkout Form inputs
  const [checkoutInputs, setCheckoutInputs] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    zip: "",
    country: "Deutschland"
  });
  
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" | "paypal"
  const [mockCardInputs, setMockCardInputs] = useState({ number: "", expiry: "", cvc: "" });
  const [processingMessage, setProcessingMessage] = useState("Verbindung zu Bezahlgateway wird aufgebaut...");
  const [createdOrder, setCreatedOrder] = useState(null);

  // Admin Dashboard States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState("orders"); // "orders" | "waitlist" | "emails"
  const [adminUser, setAdminUser] = useState(null);
  const [adminError, setAdminError] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [mockSentMails, setMockSentMails] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Sizing popup state
  const [isSizerOpen, setIsSizerOpen] = useState(false);

  // Analytics Stats
  const [regStats, setRegStats] = useState({ total: 0, silver: 0, gold: 0, roseGold: 0, agate: 0, blackTrio: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, sourcing: 0, production: 0, shipped: 0, totalRevenue: 0 });

  // Email Previewer State
  const [previewStage, setPreviewStage] = useState(1);
  const [activePreviewHtml, setActivePreviewHtml] = useState("");
  const [viewingMockMail, setViewingMockMail] = useState(null);

  // Fulfillment inline input states (mapped by orderId)
  const [trackingInputs, setTrackingInputs] = useState({});
  const [inlineStageSelectors, setInlineStageSelectors] = useState({});

  // Calculate dynamic stone bead count and total price
  const silverBeadCount = 3;
  const beadDiameterMm = 12;
  const estimatedStonesCount = Math.round((selectedLength.cm * 10) / beadDiameterMm) - silverBeadCount;
  const totalPrice = productConfig.basePrice + selectedMetal.priceModifier;

  // Load Data for Admin Dashboard
  useEffect(() => {
    if (currentTab === "admin" && isAdminLoggedIn) {
      fetchAdminData();
    }
  }, [currentTab, isAdminLoggedIn, adminSubTab]);

  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      if (adminSubTab === "waitlist") {
        const data = await getRegistrations();
        setRegistrations(data);
        
        // Calculate Waitlist Stats
        const statsObj = { total: data.length, silver: 0, gold: 0, roseGold: 0, agate: 0, blackTrio: 0 };
        data.forEach((reg) => {
          if (reg.metal === "925 Sterling Silver") statsObj.silver++;
          else if (reg.metal === "18k Gold Plated") statsObj.gold++;
          else if (reg.metal === "18k Rose Gold Plated") statsObj.roseGold++;

          if (reg.stones === "Brown Stripe-Agate") statsObj.agate++;
          else if (reg.stones === "Black-Trio") statsObj.blackTrio++;
        });
        setRegStats(statsObj);
      } else if (adminSubTab === "orders") {
        const data = await getOrders();
        setOrders(data);
        
        // Calculate Pre-Order Stats
        const oStats = { total: data.length, pending: 0, sourcing: 0, production: 0, shipped: 0, totalRevenue: 0 };
        data.forEach((o) => {
          oStats.totalRevenue += o.configuration.totalPrice || 165;
          const stage = o.productionStatus.currentStage;
          if (stage === 1) oStats.pending++;
          else if (stage === 2) oStats.sourcing++;
          else if (stage === 3) oStats.production++;
          else if (stage === 4) oStats.shipped++;
        });
        setOrderStats(oStats);
      } else if (adminSubTab === "emails") {
        // Read simulated emails from localstorage
        const mails = JSON.parse(localStorage.getItem("rp_mock_emails") || "[]");
        setMockSentMails(mails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }
    } catch (error) {
      console.error("Failed to load admin dashboard data:", error);
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

  // Generate and set active HTML email template preview
  useEffect(() => {
    const mockOrder = {
      id: "RP-2026-MOCK",
      customerName: "Maximilian Muster",
      configuration: {
        metal: selectedMetal.name,
        stones: selectedStone.name,
        length: selectedLength.cm,
        totalPrice: totalPrice
      }
    };
    const stageIntros = [
      `Vielen Dank für Dein Vertrauen in ehrliche Handwerkskunst. Wir haben Deine Pre-Order für das Beaded Bracelet erfolgreich gesichert. Die Materialanforderungen sind zusammengestellt und der Sourcing-Auftrag für die Rohmaterialien nach Bali ist initiiert.`,
      `Ein wichtiger Meilenstein ist erreicht: Unsere Partner in Bali haben die ethically-sourced 925 Sterling Silber Perlen und die vulkanischen Gesteine für Deine Bestellung ausgewählt und erworben. Die Komponenten machen sich nun auf den Weg in unser deutsches Atelier.`,
      `Die edlen Mineralkomponenten und handgebürsteten Silberperlen sind unversehrt im Atelier eingetroffen. Dein Armband wird nun in präziser Handarbeit auf den hochfesten 1.0mm Edelstahl-Kern aufgezogen und mit unserer doppelten Sicherungskette vollendet.`,
      `Nach strengster Qualitätskontrolle (Gewichtsprüfung und Magnet-Zugkraftmessung) ist Dein Beaded Bracelet fertiggestellt und in unserer obsidian-schwarzen Leinen-Verpackung sicher verstaut. Das Paket wurde soeben an DHL Express übergeben.`
    ];
    
    const html = getEmailTemplateHtml(
      mockOrder, 
      previewStage, 
      stageIntros[previewStage - 1], 
      previewStage === 4 ? "1Z999AA10123456784" : ""
    );
    setActivePreviewHtml(html);
  }, [previewStage, selectedMetal, selectedStone, selectedLength, totalPrice]);

  // Handle Checkout Pre-order creation
  const handlePreOrderSubmit = async (e) => {
    e.preventDefault();
    setCheckoutStep("processing");

    // Cycle through realistic premium payment gateway loader text
    const loaderMessages = [
      { delay: 0, text: "Verbindung zu Bezahlgateway wird aufgebaut..." },
      { delay: 600, text: "Zahlung wird autorisiert..." },
      { delay: 1200, text: "Sichere Transaktion registriert..." },
      { delay: 1800, text: "Silber- und Steinkontingente in Bali reserviert..." }
    ];

    loaderMessages.forEach((msg) => {
      setTimeout(() => {
        setProcessingMessage(msg.text);
      }, msg.delay);
    });

    try {
      const result = await saveOrder(checkoutInputs, {
        metal: selectedMetal.name,
        stones: selectedStone.name,
        length: selectedLength.cm,
        basePrice: productConfig.basePrice,
        priceModifier: selectedMetal.priceModifier,
        totalPrice: totalPrice
      });

      setTimeout(() => {
        if (result.success) {
          setCreatedOrder(result.data);
          setCheckoutStep("success");
          
          // Clear inputs
          setCheckoutInputs({
            firstName: "",
            lastName: "",
            email: "",
            street: "",
            city: "",
            zip: "",
            country: "Deutschland"
          });
          setMockCardInputs({ number: "", expiry: "", cvc: "" });
        }
      }, 2400); // Complete processing sequence
    } catch (error) {
      setTimeout(() => {
        alert("Transaction failed. Please review details.");
        setCheckoutStep("form");
      }, 2400);
    }
  };

  // Admin Single Order Fulfillment Status drop handler
  const handleOrderStatusChange = async (orderId, stage) => {
    if (stage === 4) {
      // Need tracking number
      setInlineStageSelectors(prev => ({ ...prev, [orderId]: stage }));
      return;
    }
    try {
      await updateOrderStatus(orderId, stage);
      fetchAdminData();
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  // Admin Dispatch Individual Order Commit
  const commitDispatchOrder = async (orderId) => {
    const tracking = trackingInputs[orderId];
    if (!tracking || tracking.trim() === "") {
      alert("Please enter a valid DHL tracking number.");
      return;
    }
    try {
      await updateOrderStatus(orderId, 4, tracking.trim());
      // Clean inline state
      setTrackingInputs(prev => ({ ...prev, [orderId]: "" }));
      setInlineStageSelectors(prev => ({ ...prev, [orderId]: null }));
      fetchAdminData();
    } catch (error) {
      alert("Failed to dispatch order.");
    }
  };

  // Batch Sourcing Procurement (Stage 1 -> Stage 2)
  const handleBatchSourcingStart = async () => {
    const pendingOrders = orders.filter(o => o.productionStatus.currentStage === 1);
    if (pendingOrders.length === 0) {
      alert("No pending pre-orders in Availability state.");
      return;
    }
    if (confirm(`Do you want to batch-move ${pendingOrders.length} pre-orders to Stage 2 (Einkaufsbestätigung) and automatically trigger their sourcing status emails?`)) {
      setAdminLoading(true);
      try {
        const ids = pendingOrders.map(o => o.id);
        await batchUpdateOrderStatus(ids, 2);
        fetchAdminData();
      } catch (err) {
        alert("Batch update failed.");
      } finally {
        setAdminLoading(false);
      }
    }
  };

  // Batch Production Materials Arrived (Stage 2 -> Stage 3)
  const handleBatchProductionStart = async () => {
    const sourcingOrders = orders.filter(o => o.productionStatus.currentStage === 2);
    if (sourcingOrders.length === 0) {
      alert("No pre-orders currently in Material Sourcing state.");
      return;
    }
    if (confirm(`Do you want to batch-move ${sourcingOrders.length} pre-orders to Stage 3 (Produktionsstart) and trigger production update emails?`)) {
      setAdminLoading(true);
      try {
        const ids = sourcingOrders.map(o => o.id);
        await batchUpdateOrderStatus(ids, 3);
        fetchAdminData();
      } catch (err) {
        alert("Batch update failed.");
      } finally {
        setAdminLoading(false);
      }
    }
  };

  const handleExport = async (exportAll = false) => {
    setIsExporting(true);
    try {
      const dataToExport = exportAll 
        ? registrations 
        : registrations.filter(r => !r.exported);
        
      if (dataToExport.length === 0) {
        alert("No new leads to export.");
        setIsExporting(false);
        return;
      }

      const csvContent = "data:text/csv;charset=utf-8,Email,Metal Plating,Stones,Length,Timestamp,Status\n" + 
        dataToExport.map(r => `"${r.email}","${r.metal}","${r.stones}",${r.length},"${r.timestamp}","${r.exported ? 'EXPORTED' : 'NEW'}"`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rp_demand_${exportAll ? 'all' : 'new'}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (!exportAll) {
        const ids = dataToExport.map(r => r.id).filter(id => id);
        if (ids.length > 0) {
          await markRegistrationsExported(ids);
          await fetchRegistrations();
        }
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const resetCheckoutFlow = () => {
    setIsCheckoutOpen(false);
    setCheckoutStep("form");
    setCreatedOrder(null);
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
    <div className="min-h-screen bg-obsidian text-silver-accent font-sans antialiased flex flex-col selection:bg-champagne-gold/30 selection:text-white">
      
      {/* 1. QUIET LUXURY HEADER */}
      <header className="sticky top-0 z-40 bg-obsidian/75 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
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
        )}

        {/* ================= PRIVATE ADMIN PORTAL TAB ================= */}
        {currentTab === "admin" && (
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12 md:py-20 space-y-12">
            
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto p-8 rounded-3xl bg-coal/20 border border-white/5 space-y-6 text-center">
                <Lock className="text-champagne-gold mx-auto" size={32} />
                <div>
                  <h3 className="font-serif text-xl text-white tracking-wide">Secure Admin Access</h3>
                  <p className="text-xs text-mineral-slate mt-2 tracking-wide font-light">
                    Authenticate with your Google account to view orders.
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
              // ADMIN CONSOLE
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl text-white tracking-wide">
                      RENE PUSKAS ADMIN PORTAL
                    </h2>
                    <p className="text-xs text-mineral-slate tracking-widest uppercase mt-2 flex items-center space-x-2">
                      <Database size={12} className="text-champagne-gold" />
                      <span>{isMockFirebase ? "LOCAL STORAGE DEV MODE" : "FIREBASE FIREBASE SECURE LIVE"}</span>
                    </p>
                  </div>
                  
                  {/* Global Sub-Tabs */}
                  <div className="flex bg-coal/40 p-1 rounded-xl border border-white/5 text-[11px] font-semibold tracking-widest uppercase">
                    <button 
                      onClick={() => setAdminSubTab("orders")}
                      className={`px-4 py-2 rounded-lg transition-all ${adminSubTab === "orders" ? "bg-white text-black font-bold" : "text-mineral-slate hover:text-white"}`}
                    >
                      Pre-Orders
                    </button>
                    <button 
                      onClick={() => setAdminSubTab("waitlist")}
                      className={`px-4 py-2 rounded-lg transition-all ${adminSubTab === "waitlist" ? "bg-white text-black font-bold" : "text-mineral-slate hover:text-white"}`}
                    >
                      Drop-Waitlist
                    </button>
                    <button 
                      onClick={() => setAdminSubTab("emails")}
                      className={`px-4 py-2 rounded-lg transition-all ${adminSubTab === "emails" ? "bg-white text-black font-bold" : "text-mineral-slate hover:text-white"}`}
                    >
                      E-Mail-Logs
                    </button>
                  </div>
                </div>

                {/* TAB CONTENT: PRE-ORDERS */}
                {adminSubTab === "orders" && (
                  <div className="space-y-8">
                    {/* Order Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                      <div className="p-5 rounded-2xl bg-coal/20 border border-white/5 space-y-1">
                        <p className="text-[9px] text-mineral-slate tracking-widest uppercase">Gesamtumsatz</p>
                        <p className="text-2xl font-light text-champagne-gold font-serif">{orderStats.totalRevenue} €</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-coal/20 border border-white/5 space-y-1">
                        <p className="text-[9px] text-mineral-slate tracking-widest uppercase">Bestellt (Phase 1)</p>
                        <p className="text-2xl font-light text-white font-serif">{orderStats.pending}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-coal/20 border border-white/5 space-y-1">
                        <p className="text-[9px] text-mineral-slate tracking-widest uppercase">Bali Sourcing (2)</p>
                        <p className="text-2xl font-light text-white font-serif">{orderStats.sourcing}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-coal/20 border border-white/5 space-y-1">
                        <p className="text-[9px] text-mineral-slate tracking-widest uppercase">Produktion (3)</p>
                        <p className="text-2xl font-light text-white font-serif">{orderStats.production}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-coal/20 border border-white/5 space-y-1">
                        <p className="text-[9px] text-mineral-slate tracking-widest uppercase">Versandt (4)</p>
                        <p className="text-2xl font-light text-white font-serif">{orderStats.shipped}</p>
                      </div>
                    </div>

                    {/* Batch Actions & Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-coal/10 border border-white/5">
                      <div>
                        <h4 className="text-xs font-semibold tracking-wider text-white uppercase">Sourcing Batch Aktionen</h4>
                        <p className="text-[10px] text-mineral-slate mt-1">Erhöhe den Status aller Bestellungen gesammelt im Produktionszyklus.</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handleBatchSourcingStart}
                          className="px-4 py-2.5 rounded-lg border border-champagne-gold/30 text-champagne-gold hover:bg-champagne-gold hover:text-black text-xs font-semibold uppercase tracking-widest transition-all"
                        >
                          Bali-Sourcing starten (Phase 2)
                        </button>
                        <button
                          onClick={handleBatchProductionStart}
                          className="px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-white uppercase tracking-widest transition-all"
                        >
                          Material eingetroffen (Phase 3)
                        </button>
                        <button 
                          onClick={() => fetchAdminData()}
                          className="p-2 rounded-lg border border-white/10 text-mineral-slate hover:text-white"
                          title="Refresh Orders"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Pre-Orders Table */}
                    <div className="bg-coal/10 border border-white/5 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        {adminLoading ? (
                          <div className="py-20 text-center text-xs tracking-widest text-mineral-slate uppercase">Loading orders...</div>
                        ) : orders.length === 0 ? (
                          <div className="py-20 text-center text-xs tracking-widest text-mineral-slate uppercase">No pre-orders recorded.</div>
                        ) : (
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-white/5 text-[10px] tracking-widest text-mineral-slate uppercase">
                                <th className="p-4 pl-6">Order ID</th>
                                <th className="p-4">Kunde</th>
                                <th className="p-4">Konfiguration</th>
                                <th className="p-4">Aktuelle Phase</th>
                                <th className="p-4">Umsatz</th>
                                <th className="p-4 text-right pr-6">Status-Steuerung</th>
                              </tr>
                            </thead>
                            <tbody className="text-white/80">
                              {orders.map((order) => {
                                const currentStage = order.productionStatus.currentStage;
                                const isStageSelected = inlineStageSelectors[order.id];
                                
                                return (
                                  <tr key={order.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                                    <td className="p-4 pl-6 font-mono font-bold text-champagne-gold">{order.id}</td>
                                    <td className="p-4">
                                      <div className="font-semibold text-white">{order.customerName}</div>
                                      <div className="text-[10px] text-mineral-slate mt-0.5">{order.email}</div>
                                    </td>
                                    <td className="p-4">
                                      <div className="text-white font-medium">{order.configuration.metal}</div>
                                      <div className="text-[10px] text-mineral-slate mt-0.5">{order.configuration.stones} / {order.configuration.length}cm</div>
                                    </td>
                                    <td className="p-4">
                                      {currentStage === 1 && <span className="px-2 py-0.5 rounded-full border border-mineral-slate/30 text-[9px] uppercase tracking-wider text-mineral-slate bg-mineral-slate/5">1. Bestellt</span>}
                                      {currentStage === 2 && <span className="px-2 py-0.5 rounded-full border border-champagne-gold/30 text-[9px] uppercase tracking-wider text-champagne-gold bg-champagne-gold/5 animate-pulse">2. Sourcing Bali</span>}
                                      {currentStage === 3 && <span className="px-2 py-0.5 rounded-full border border-orange-400/30 text-[9px] uppercase tracking-wider text-orange-400 bg-orange-400/5">3. Handarbeit</span>}
                                      {currentStage === 4 && <span className="px-2 py-0.5 rounded-full border border-green-500/30 text-[9px] uppercase tracking-wider text-green-400 bg-green-500/5">4. Versandt</span>}
                                    </td>
                                    <td className="p-4 font-mono font-semibold text-white">{order.configuration.totalPrice} €</td>
                                    <td className="p-4 text-right pr-6">
                                      
                                      {/* Stage Trigger dropdown selector */}
                                      {isStageSelected === 4 || (currentStage < 4 && !isStageSelected) ? (
                                        <div className="inline-flex items-center space-x-2">
                                          {currentStage < 4 && (
                                            <select
                                              value={isStageSelected || currentStage}
                                              onChange={(e) => handleOrderStatusChange(order.id, parseInt(e.target.value))}
                                              className="bg-obsidian border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                                            >
                                              <option value="1">1. Bestellt</option>
                                              <option value="2">2. Sourcing</option>
                                              <option value="3">3. Handarbeit</option>
                                              <option value="4">4. Versenden</option>
                                            </select>
                                          )}

                                          {/* DHL Tracking Input box when stage 4 chosen */}
                                          {(isStageSelected === 4 || currentStage === 4) && (
                                            <div className="flex items-center space-x-2">
                                              <input
                                                type="text"
                                                placeholder="DHL Sendungsnummer"
                                                value={trackingInputs[order.id] || order.shipping.trackingNumber || ""}
                                                onChange={(e) => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                disabled={currentStage === 4}
                                                className="bg-obsidian border border-white/10 rounded px-2 py-1 text-[10px] w-36 text-white placeholder:text-mineral-slate/50"
                                              />
                                              {currentStage < 4 ? (
                                                <button
                                                  onClick={() => commitDispatchOrder(order.id)}
                                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] uppercase font-bold"
                                                >
                                                  Ship
                                                </button>
                                              ) : (
                                                <a 
                                                  href={`https://www.dhl.com/de-de/home/tracking/tracking-express.html?submit=1&tracking-id=${order.shipping.trackingNumber}`}
                                                  target="_blank" 
                                                  rel="noreferrer"
                                                  className="p-1.5 border border-white/10 rounded hover:bg-white/5 text-mineral-slate hover:text-white"
                                                  title="DHL Track Link"
                                                >
                                                  <ExternalLink size={12} />
                                                </a>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <select
                                          value={currentStage}
                                          onChange={(e) => handleOrderStatusChange(order.id, parseInt(e.target.value))}
                                          className="bg-obsidian border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                                        >
                                          <option value="1">1. Bestellt</option>
                                          <option value="2">2. Sourcing</option>
                                          <option value="3">3. Handarbeit</option>
                                          <option value="4">4. Versenden</option>
                                        </select>
                                      )}

                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: DROPS WAITLIST */}
                {adminSubTab === "waitlist" && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <h3 className="font-serif text-lg text-white">Legacy Lead Registrations</h3>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleExport(false)}
                          disabled={isExporting}
                          className="px-3 py-1.5 rounded-lg bg-champagne-gold text-black hover:bg-white text-xs font-semibold uppercase tracking-widest transition-all flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          <FileSpreadsheet size={12} />
                          <span>Export New Leads</span>
                        </button>
                        <button 
                          onClick={() => handleExport(true)}
                          disabled={isExporting}
                          className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-white uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                          <span>Export All</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="p-4 rounded-xl bg-coal/20 border border-white/5">
                        <p className="text-[9px] text-mineral-slate tracking-widest uppercase">Total Waitlist Leads</p>
                        <p className="text-2xl font-light text-white font-serif">{regStats.total}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-coal/20 border border-white/5">
                        <p className="text-[9px] text-mineral-slate tracking-widest uppercase">Sterling Silver</p>
                        <p className="text-2xl font-light text-white font-serif">{regStats.silver}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-coal/20 border border-white/5">
                        <p className="text-[9px] text-mineral-slate tracking-widest uppercase">Gold plated</p>
                        <p className="text-2xl font-light text-white font-serif">{regStats.gold + regStats.roseGold}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-coal/20 border border-white/5">
                        <p className="text-[9px] text-mineral-slate tracking-widest uppercase">Agate / Black-Trio</p>
                        <p className="text-2xl font-light text-white font-serif">{regStats.agate} / {regStats.blackTrio}</p>
                      </div>
                    </div>

                    <div className="bg-coal/10 border border-white/5 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/5 text-[10px] tracking-widest text-mineral-slate uppercase">
                              <th className="p-4 pl-6">Status</th>
                              <th className="p-4">Email Address</th>
                              <th className="p-4">Metal Plating</th>
                              <th className="p-4">Stone Variant</th>
                              <th className="p-4">Sizing Length</th>
                              <th className="p-4 text-right pr-6">Signup Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="text-white/80">
                            {registrations.map((reg, idx) => (
                              <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                                <td className="p-4 pl-6">
                                  {reg.exported ? (
                                    <span className="px-2 py-0.5 rounded-full border border-white/10 text-[9px] uppercase tracking-wider text-mineral-slate">Exported</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full border border-champagne-gold/50 bg-champagne-gold/10 text-[9px] uppercase tracking-wider text-champagne-gold">New Lead</span>
                                  )}
                                </td>
                                <td className="p-4 font-semibold text-white">{reg.email}</td>
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
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: EMAIL LOGS & LIVE PREVIEWER */}
                {adminSubTab === "emails" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Email preview widget */}
                    <div className="lg:col-span-7 bg-coal/20 border border-white/5 p-6 rounded-2xl space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif text-base text-white uppercase tracking-wider">E-Mail Visualisierungs-Vorschau</h3>
                          <p className="text-[10px] text-mineral-slate mt-0.5">Betrachte das Layout der Newsletter-Vorlagen live.</p>
                        </div>
                        <div className="flex bg-obsidian p-1 rounded-lg border border-white/5 text-[10px] font-semibold tracking-wider">
                          {[1, 2, 3, 4].map(st => (
                            <button
                              key={st}
                              onClick={() => { setViewingMockMail(null); setPreviewStage(st); }}
                              className={`px-2.5 py-1.5 rounded transition-all ${previewStage === st && !viewingMockMail ? "bg-champagne-gold text-black font-bold" : "text-mineral-slate hover:text-white"}`}
                            >
                              St.{st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* HTML Render Frame */}
                      <div className="border border-white/5 rounded-xl bg-obsidian overflow-hidden h-[480px] relative">
                        {viewingMockMail && (
                          <div className="absolute top-2 left-2 right-2 bg-coal/90 px-3 py-1.5 border border-white/10 rounded flex items-center justify-between text-[10px] z-10">
                            <span className="text-champagne-gold">Vorschau für reale gesendete Mail an: <strong>{viewingMockMail.to}</strong></span>
                            <button 
                              onClick={() => setViewingMockMail(null)}
                              className="text-mineral-slate hover:text-white"
                            >
                              Zurück zu Vorlagen
                            </button>
                          </div>
                        )}
                        <iframe
                          title="Email Preview"
                          srcDoc={viewingMockMail ? viewingMockMail.html : activePreviewHtml}
                          className="w-full h-full border-0 bg-obsidian"
                        />
                      </div>
                    </div>

                    {/* Right: Sent email mock history */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif text-base text-white uppercase tracking-wider">Mails Mock Log (Simuliert)</h3>
                          <p className="text-[10px] text-mineral-slate mt-0.5">Reale Mails, die lokal getriggert wurden.</p>
                        </div>
                        <button
                          onClick={() => {
                            localStorage.removeItem("rp_mock_emails");
                            fetchAdminData();
                          }}
                          className="text-[9px] tracking-widest font-semibold uppercase text-red-400 hover:text-red-300 transition-all border border-red-400/20 px-2 py-1 rounded"
                        >
                          Clear Logs
                        </button>
                      </div>

                      <div className="bg-coal/10 border border-white/5 rounded-xl max-h-[440px] overflow-y-auto">
                        {mockSentMails.length === 0 ? (
                          <div className="py-20 text-center text-[10px] tracking-widest uppercase text-mineral-slate">No emails sent yet. Place a pre-order to test.</div>
                        ) : (
                          <div className="divide-y divide-white/[0.04] text-xs">
                            {mockSentMails.map((mail) => (
                              <div key={mail.id} className="p-4 space-y-2 hover:bg-white/[0.01] transition-colors">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-mono text-champagne-gold">Phase {mail.stage}</span>
                                  <span className="text-mineral-slate font-mono">{new Date(mail.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="font-semibold text-white">{mail.to}</div>
                                <div className="text-[11px] text-mineral-slate truncate font-serif italic">"{mail.subject}"</div>
                                <button
                                  onClick={() => setViewingMockMail(mail)}
                                  className="text-[10px] font-semibold text-champagne-gold hover:underline flex items-center space-x-1"
                                >
                                  <Eye size={10} />
                                  <span>HTML anzeigen</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 3. MOCK CHECKOUT OVERLAY DRAWER */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-text">
          {/* Backdrop blur */}
          <div 
            onClick={() => checkoutStep !== "processing" && resetCheckoutFlow()}
            className="absolute inset-0 bg-obsidian/85 backdrop-blur-sm transition-opacity" 
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-coal border-l border-white/5 relative">
              
              {/* Close trigger button */}
              {checkoutStep !== "processing" && (
                <button 
                  onClick={() => resetCheckoutFlow()}
                  className="absolute top-5 right-5 p-2 text-mineral-slate hover:text-white rounded-full hover:bg-white/5 focus:outline-none z-10"
                >
                  <X size={18} />
                </button>
              )}

              {/* DRAWER STATE A: CHECKOUT FORM */}
              {checkoutStep === "form" && (
                <div className="h-full flex flex-col justify-between p-6 sm:p-8">
                  <div className="space-y-6 overflow-y-auto pr-1">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl text-white tracking-wide uppercase">PRE-ORDER CHECKOUT</h3>
                      <p className="text-[10px] tracking-widest text-champagne-gold uppercase mt-1">Ehrliche Materialien gesichert</p>
                    </div>

                    {/* Sourced design recap container */}
                    <div className="bg-obsidian border border-white/5 p-4 rounded-xl space-y-2 text-xs leading-normal">
                      <div className="font-serif text-sm text-white uppercase tracking-wider">Ausgewähltes Design</div>
                      <div className="text-mineral-slate flex justify-between">
                        <span>Beaded Bracelet (Series 1)</span>
                        <span className="text-white font-medium">{productConfig.basePrice} €</span>
                      </div>
                      <div className="text-mineral-slate flex justify-between">
                        <span>{selectedMetal.name}</span>
                        <span className="text-white font-medium">+{selectedMetal.priceModifier} €</span>
                      </div>
                      <div className="text-mineral-slate flex justify-between">
                        <span>{selectedStone.name} / {selectedLength.cm}cm</span>
                        <span className="text-white font-medium">Inklusive</span>
                      </div>
                      <div className="border-t border-white/5 pt-2 flex justify-between text-sm font-serif">
                        <span className="text-champagne-gold uppercase tracking-wider font-semibold">Gesamtbetrag:</span>
                        <span className="text-white font-bold">{totalPrice} €</span>
                      </div>
                    </div>

                    <form id="preorder-form" onSubmit={handlePreOrderSubmit} className="space-y-4">
                      {/* Name fields row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] tracking-[0.2em] text-white/50 uppercase font-semibold">VORNAME</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Maximilian"
                            value={checkoutInputs.firstName}
                            onChange={(e) => setCheckoutInputs(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] tracking-[0.2em] text-white/50 uppercase font-semibold">NACHNAME</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Muster"
                            value={checkoutInputs.lastName}
                            onChange={(e) => setCheckoutInputs(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] tracking-[0.2em] text-white/50 uppercase font-semibold">E-MAIL ADDRESS</label>
                        <input 
                          type="email" 
                          required
                          placeholder="maximilian@muster.de"
                          value={checkoutInputs.email}
                          onChange={(e) => setCheckoutInputs(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold"
                        />
                      </div>

                      {/* Shipping address fields */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] tracking-[0.2em] text-white/50 uppercase font-semibold">STRASSE & HAUSNUMMER</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Mineralienallee 12"
                          value={checkoutInputs.street}
                          onChange={(e) => setCheckoutInputs(prev => ({ ...prev, street: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5 col-span-1">
                          <label className="text-[9px] tracking-[0.2em] text-white/50 uppercase font-semibold">PLZ</label>
                          <input 
                            type="text" 
                            required
                            placeholder="20095"
                            value={checkoutInputs.zip}
                            onChange={(e) => setCheckoutInputs(prev => ({ ...prev, zip: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold"
                          />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[9px] tracking-[0.2em] text-white/50 uppercase font-semibold">STADT</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Hamburg"
                            value={checkoutInputs.city}
                            onChange={(e) => setCheckoutInputs(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] tracking-[0.2em] text-white/50 uppercase font-semibold">LAND</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Deutschland"
                          value={checkoutInputs.country}
                          onChange={(e) => setCheckoutInputs(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold"
                        />
                      </div>

                      {/* Mock payment selector */}
                      <div className="space-y-3 pt-2">
                        <label className="text-[9px] tracking-[0.2em] text-white/50 uppercase font-semibold">BEZAHLMETHODE</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("card")}
                            className={`py-3 px-4 rounded border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${paymentMethod === 'card' ? 'border-champagne-gold text-champagne-gold bg-white/[0.01]' : 'border-white/5 text-mineral-slate hover:border-white/20'}`}
                          >
                            <CreditCard size={13} />
                            <span>Kreditkarte</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("paypal")}
                            className={`py-3 px-4 rounded border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${paymentMethod === 'paypal' ? 'border-champagne-gold text-champagne-gold bg-white/[0.01]' : 'border-white/5 text-mineral-slate hover:border-white/20'}`}
                          >
                            <Landmark size={13} />
                            <span>PayPal</span>
                          </button>
                        </div>

                        {/* If credit card chosen, render mock card number fields for immersion */}
                        {paymentMethod === "card" && (
                          <div className="p-4 rounded bg-obsidian border border-white/5 space-y-3 animate-fade-in text-[10px]">
                            <div className="space-y-1">
                              <label className="text-[8px] tracking-widest text-white/30 uppercase">Karteninhaber (Simuliert)</label>
                              <div className="text-white text-xs font-mono font-semibold py-1 select-none">
                                {checkoutInputs.firstName || checkoutInputs.lastName ? `${checkoutInputs.firstName} ${checkoutInputs.lastName}`.toUpperCase() : "MAXIMILIAN MUSTER"}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2 space-y-1">
                                <label className="text-[8px] tracking-widest text-white/30 uppercase">Kartennummer</label>
                                <input
                                  type="text"
                                  placeholder="•••• •••• •••• ••••"
                                  value={mockCardInputs.number}
                                  onChange={(e) => setMockCardInputs(prev => ({ ...prev, number: e.target.value }))}
                                  className="w-full bg-coal border border-white/5 rounded px-2 py-1 text-white text-[11px] font-mono focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] tracking-widest text-white/30 uppercase">CVC</label>
                                <input
                                  type="text"
                                  maxLength="3"
                                  placeholder="•••"
                                  value={mockCardInputs.cvc}
                                  onChange={(e) => setMockCardInputs(prev => ({ ...prev, cvc: e.target.value }))}
                                  className="w-full bg-coal border border-white/5 rounded px-2 py-1 text-white text-[11px] font-mono focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <button
                      type="submit"
                      form="preorder-form"
                      className="w-full py-4 rounded-xl bg-white text-black hover:bg-champagne-gold font-bold tracking-widest text-xs sm:text-sm uppercase transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.15)] flex items-center justify-center space-x-2"
                    >
                      <span>PRE-ORDER KOSTENPFLICHTIG BESTELLEN</span>
                      <ArrowRight size={13} />
                    </button>
                    <p className="text-[10px] text-center text-mineral-slate tracking-wide">
                      Gesicherte SSL Verschlüsselung. Die erste E-Mail-Bestätigung folgt sofort.
                    </p>
                  </div>
                </div>
              )}

              {/* DRAWER STATE B: MOCK PROCESSING loader */}
              {checkoutStep === "processing" && (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
                  <div className="relative w-16 h-16">
                    {/* Quiet-luxury high fidelity loading spinner */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-champagne-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-lg text-white uppercase tracking-wider">Zahlung wird verarbeitet</h4>
                    <p className="text-xs text-mineral-slate font-mono animate-pulse">{processingMessage}</p>
                  </div>
                </div>
              )}

              {/* DRAWER STATE C: SUCCESS POST-PURCHASE MODAL */}
              {checkoutStep === "success" && createdOrder && (
                <div className="h-full flex flex-col justify-between p-6 sm:p-8 text-center select-text">
                  <div className="space-y-6 overflow-y-auto py-4">
                    <CheckCircle className="text-green-400 mx-auto" size={54} />
                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl text-white tracking-wide uppercase">PRE-ORDER GESICHERT</h3>
                      <p className="text-[10px] text-champagne-gold tracking-widest uppercase font-mono">
                        Bestellnummer: {createdOrder.id}
                      </p>
                    </div>

                    <div className="bg-obsidian border border-white/5 p-4 rounded-xl text-left text-xs space-y-2 leading-relaxed font-light">
                      <p className="font-semibold text-white uppercase tracking-wider text-[10px] border-b border-white/5 pb-2">Zusammenfassung:</p>
                      <div className="flex justify-between">
                        <span className="text-mineral-slate">Kunde:</span>
                        <span className="text-white font-medium">{createdOrder.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mineral-slate">Konfiguration:</span>
                        <span className="text-white font-medium text-right">{selectedMetal.label} / {selectedStone.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mineral-slate">Umfang:</span>
                        <span className="text-white font-medium">{selectedLength.cm} cm</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                        <span className="text-champagne-gold font-medium uppercase">Bezahlt per:</span>
                        <span className="text-white font-bold">{paymentMethod === "card" ? "Simulierte Kreditkarte" : "Simuliertes PayPal"}</span>
                      </div>
                    </div>

                    <p className="text-xs text-mineral-slate leading-relaxed font-light text-left">
                      Vielen Dank für Dein Vertrauen. Wir haben soeben Deine **Verfügbarkeitsbestätigung (E-Mail Phase 1)** an Deine Adresse <strong className="text-white">{createdOrder.email}</strong> versendet. 
                    </p>
                    <p className="text-xs text-mineral-slate leading-relaxed font-light text-left">
                      Wir halten Dich ab jetzt proaktiv über jeden einzelnen Produktionsmeilenstein des Bracelets auf dem Laufenden.
                    </p>
                  </div>

                  <button 
                    onClick={() => resetCheckoutFlow()}
                    className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-champagne-gold tracking-widest text-xs uppercase transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.15)]"
                  >
                    Zurück zum Store
                  </button>
                </div>
              )}

            </div>
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
