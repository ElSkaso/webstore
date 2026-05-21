import React, { useState, useEffect } from "react";
import { Database } from "lucide-react";

// Layout & Context
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Store
import Configurator from "./components/store/Configurator";
import StaticTabs from "./components/store/StaticTabs";
import CheckoutDrawer from "./components/store/CheckoutDrawer";

// Admin
import AdminLogin from "./components/admin/AdminLogin";
import OrdersTab from "./components/admin/OrdersTab";
import WaitlistTab from "./components/admin/WaitlistTab";
import EmailPreviewTab from "./components/admin/EmailPreviewTab";

// Services & Config
import { 
  getRegistrations, 
  isMockFirebase, 
  markRegistrationsExported,
  getOrders,
  updateOrderStatus,
  batchUpdateOrderStatus,
  getEmailTemplateHtml
} from "./firebase/config";
import { stageIntros } from "./firebase/emailTemplates";

// Context
import { useShop } from "./context/ShopContext";

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState("store");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Shop Context
  const { selectedMetal, selectedStone, selectedLength, totalPrice } = useShop();

  // Checkout
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Admin states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState("orders");
  const [adminUser, setAdminUser] = useState(null);
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // Data states
  const [registrations, setRegistrations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [mockSentMails, setMockSentMails] = useState([]);
  
  // Analytics Stats
  const [regStats, setRegStats] = useState({ total: 0, silver: 0, gold: 0, roseGold: 0, agate: 0, blackTrio: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, sourcing: 0, production: 0, shipped: 0, totalRevenue: 0 });

  // Inline Admin fulfillment states
  const [trackingInputs, setTrackingInputs] = useState({});
  const [inlineStageSelectors, setInlineStageSelectors] = useState({});
  const [isExporting, setIsExporting] = useState(false);

  // Email Preview states
  const [previewStage, setPreviewStage] = useState(1);
  const [activePreviewHtml, setActivePreviewHtml] = useState("");
  const [viewingMockMail, setViewingMockMail] = useState(null);

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
        const mails = JSON.parse(localStorage.getItem("rp_mock_emails") || "[]");
        setMockSentMails(mails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }
    } catch (error) {
      console.error("Failed to load admin dashboard data:", error);
    } finally {
      setAdminLoading(false);
    }
  };

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
    const html = getEmailTemplateHtml(
      mockOrder, 
      previewStage, 
      stageIntros[previewStage - 1], 
      previewStage === 4 ? "1Z999AA10123456784" : ""
    );
    setActivePreviewHtml(html);
  }, [previewStage, selectedMetal, selectedStone, selectedLength, totalPrice]);

  const handleAdminLoginSuccess = (user) => {
    setAdminUser(user);
    setIsAdminLoggedIn(true);
  };

  const handleOrderStatusChange = async (orderId, stage) => {
    if (stage === 4) {
      setInlineStageSelectors(prev => ({ ...prev, [orderId]: stage }));
      return;
    }
    try {
      await updateOrderStatus(orderId, stage);
      fetchAdminData();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(`Failed to update status: ${error.message || "Unknown error."}`);
    }
  };

  const commitDispatchOrder = async (orderId) => {
    const tracking = trackingInputs[orderId];
    if (!tracking || tracking.trim() === "") {
      alert("Please enter a valid DHL tracking number.");
      return;
    }
    try {
      await updateOrderStatus(orderId, 4, tracking.trim());
      setTrackingInputs(prev => ({ ...prev, [orderId]: "" }));
      setInlineStageSelectors(prev => ({ ...prev, [orderId]: null }));
      fetchAdminData();
    } catch (error) {
      console.error("Failed to dispatch order:", error);
      alert(`Failed to dispatch order: ${error.message || "Unknown error."}`);
    }
  };

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
        console.error("Batch sourcing update failed:", err);
        alert(`Batch update failed: ${err.message || "Unknown error."}`);
      } finally {
        setAdminLoading(false);
      }
    }
  };

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
        console.error("Batch production update failed:", err);
        alert(`Batch update failed: ${err.message || "Unknown error."}`);
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
          await fetchAdminData();
        }
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-silver-accent font-sans antialiased flex flex-col selection:bg-champagne-gold/30 selection:text-white">
      
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />

      <main className="flex-grow">
        {currentTab === "store" && <Configurator setIsCheckoutOpen={setIsCheckoutOpen} />}
        
        {["craftsmanship", "reviews", "faq"].includes(currentTab) && <StaticTabs currentTab={currentTab} />}

        {currentTab === "admin" && (
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12 md:py-20 space-y-12">
            {!isAdminLoggedIn ? (
              <AdminLogin onLoginSuccess={handleAdminLoginSuccess} adminError={adminError} setAdminError={setAdminError} />
            ) : (
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

                {adminSubTab === "orders" && (
                  <OrdersTab
                    orders={orders}
                    orderStats={orderStats}
                    adminLoading={adminLoading}
                    inlineStageSelectors={inlineStageSelectors}
                    trackingInputs={trackingInputs}
                    setTrackingInputs={setTrackingInputs}
                    handleOrderStatusChange={handleOrderStatusChange}
                    commitDispatchOrder={commitDispatchOrder}
                    handleBatchSourcingStart={handleBatchSourcingStart}
                    handleBatchProductionStart={handleBatchProductionStart}
                    fetchAdminData={fetchAdminData}
                  />
                )}

                {adminSubTab === "waitlist" && (
                  <WaitlistTab
                    handleExport={handleExport}
                    isExporting={isExporting}
                    regStats={regStats}
                    registrations={registrations}
                  />
                )}

                {adminSubTab === "emails" && (
                  <EmailPreviewTab
                    viewingMockMail={viewingMockMail}
                    setViewingMockMail={setViewingMockMail}
                    previewStage={previewStage}
                    setPreviewStage={setPreviewStage}
                    activePreviewHtml={activePreviewHtml}
                    mockSentMails={mockSentMails}
                    fetchAdminData={fetchAdminData}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      <CheckoutDrawer isCheckoutOpen={isCheckoutOpen} setIsCheckoutOpen={setIsCheckoutOpen} />

    </div>
  );
}
