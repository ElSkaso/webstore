import React from "react";
import { FileSpreadsheet } from "lucide-react";

export default function WaitlistTab({
  handleExport,
  isExporting,
  regStats,
  registrations
}) {
  return (
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
  );
}
