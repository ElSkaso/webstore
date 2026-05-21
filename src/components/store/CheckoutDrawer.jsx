import React, { useState } from "react";
import { X, CreditCard, Landmark, ArrowRight, CheckCircle } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { saveOrder } from "../../firebase/config"; // Refactored config imports
import { productConfig } from "../../productConfig";

export default function CheckoutDrawer({ isCheckoutOpen, setIsCheckoutOpen }) {
  const { selectedMetal, selectedStone, selectedLength, totalPrice } = useShop();

  const [checkoutStep, setCheckoutStep] = useState("form"); // "form" | "processing" | "success"
  
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

  const resetCheckoutFlow = () => {
    setIsCheckoutOpen(false);
    setTimeout(() => {
      setCheckoutStep("form");
      setCreatedOrder(null);
    }, 300); // Give time for drawer close animation
  };

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
        priceModifier: selectedMetal.priceOffset || 0,
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
      console.error("Pre-order submission failed:", error);
      setTimeout(() => {
        alert(`Transaction failed: ${error.message || "Please review details."}`);
        setCheckoutStep("form");
      }, 2400);
    }
  };

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-text">
      {/* Backdrop blur */}
      <div 
        onClick={() => checkoutStep !== "processing" && resetCheckoutFlow()}
        className="absolute inset-0 bg-obsidian/85 backdrop-blur-sm transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-coal border-l border-white/5 relative shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.5)]">
          
          {/* Close trigger button */}
          {checkoutStep !== "processing" && (
            <button 
              onClick={() => resetCheckoutFlow()}
              className="absolute top-5 right-5 p-2 text-mineral-slate hover:text-white rounded-full hover:bg-white/5 focus:outline-none z-10 transition-colors"
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
                        className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold transition-colors"
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
                        className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] tracking-[0.2em] text-white/50 uppercase font-semibold">E-MAIL ADDRESS</label>
                    <input 
                      type="email" 
                      required
                      placeholder="maximilian@example.com"
                      value={checkoutInputs.email}
                      onChange={(e) => setCheckoutInputs(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] tracking-[0.2em] text-white/50 uppercase font-semibold">STRASSE & HAUSNUMMER</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Mineralienallee 12"
                      value={checkoutInputs.street}
                      onChange={(e) => setCheckoutInputs(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold transition-colors"
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
                        className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold transition-colors"
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
                        className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold transition-colors"
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
                      className="w-full px-3 py-2.5 rounded bg-obsidian border border-white/5 text-white placeholder:text-mineral-slate/30 text-xs focus:outline-none focus:border-champagne-gold transition-colors"
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
                              className="w-full bg-coal border border-white/5 rounded px-2 py-1 text-white text-[11px] font-mono focus:outline-none focus:border-champagne-gold transition-colors"
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
                              className="w-full bg-coal border border-white/5 rounded px-2 py-1 text-white text-[11px] font-mono focus:outline-none focus:border-champagne-gold transition-colors"
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
  );
}
