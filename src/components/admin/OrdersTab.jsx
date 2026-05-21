import React from "react";
import { RefreshCw, ExternalLink } from "lucide-react";

export default function OrdersTab({
  orders,
  orderStats,
  adminLoading,
  inlineStageSelectors,
  trackingInputs,
  setTrackingInputs,
  handleOrderStatusChange,
  commitDispatchOrder,
  handleBatchSourcingStart,
  handleBatchProductionStart,
  fetchAdminData
}) {
  return (
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
  );
}
