import React from "react";

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-white/5 py-12 px-6 sm:px-8 mt-16 text-center text-xs tracking-widest text-mineral-slate space-y-4">
      <p className="font-light">
        © {new Date().getFullYear()} RENE PUSKAS. ALL RIGHTS RESERVED.
      </p>
      <p className="text-[10px] opacity-40 font-light max-w-md mx-auto leading-relaxed">
        Crafting honest, minimalist jewelry with architectural wire core structural integrity. Free from loud branding or marketing noise. Sourced from the earth, shaped by hands.
      </p>
    </footer>
  );
}
