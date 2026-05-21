import React from "react";
import { Lock, Menu, X } from "lucide-react";

export default function Header({ currentTab, setCurrentTab, isMenuOpen, setIsMenuOpen }) {
  return (
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
  );
}
