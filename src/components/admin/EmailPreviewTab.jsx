import React from "react";
import { Eye } from "lucide-react";

export default function EmailPreviewTab({
  viewingMockMail,
  setViewingMockMail,
  previewStage,
  setPreviewStage,
  activePreviewHtml,
  mockSentMails,
  fetchAdminData
}) {
  return (
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
  );
}
