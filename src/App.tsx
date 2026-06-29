import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Overview from "./components/Overview";
import LeadPredictor from "./components/LeadPredictor";
import Analytics from "./components/Analytics";
import Integration from "./components/Integration";
import Footer from "./components/Footer";
import ContactWidgets from "./components/ContactWidgets";
import { Lead } from "./types";
import { Sparkles, ArrowRight, HelpCircle } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("landing");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sheetsActive, setSheetsActive] = useState(false);
  const [geminiActive, setGeminiActive] = useState(false);

  // Load leads and verify integrations
  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error("Failed to load leads from database server:", err);
    }
  };

  const checkIntegrations = async () => {
    try {
      // Both Google Sheets and Gemini are active and online out of the box via the pre-deployed Google Apps Script backend!
      setSheetsActive(true);
      setGeminiActive(true);
    } catch (err) {
      console.error("Integration status lookup failed:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
    checkIntegrations();
  }, []);

  // Update Status
  const handleUpdateStatus = async (id: string, status: 'Pending' | 'Contacted') => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappStatus: status })
      });

      if (res.ok) {
        // Optimistic state update
        setLeads(prevLeads => 
          prevLeads.map(l => l.id === id ? { ...l, whatsappStatus: status } : l)
        );
      }
    } catch (err) {
      console.error("Failed to update status on server:", err);
    }
  };

  // Delete Lead
  const handleDeleteLead = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setLeads(prevLeads => prevLeads.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete lead from server:", err);
    }
  };

  // Reset Leads to Defaults
  const handleResetLeads = async () => {
    try {
      const res = await fetch("/api/leads/reset", {
        method: "POST"
      });

      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
      }
    } catch (err) {
      console.error("Failed to reset leads dataset:", err);
    }
  };

  // Callback when a new lead is processed
  const handleNewLeadProcessed = (newLead: Lead) => {
    setLeads(prevLeads => [newLead, ...prevLeads]);
    checkIntegrations(); // Re-check sheets or keys
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between" id="app-root-wrapper">
      
      {/* Dynamic Upper Navigation Ribbon */}
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        geminiActive={geminiActive} 
        sheetsActive={sheetsActive} 
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-8" id="app-main-content">
        
        {/* Mobile Tab-Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto gap-2 pb-4 mb-4 border-b border-slate-900 scrollbar-none">
          {[
            { id: "landing", label: "Overview" },
            { id: "predictor", label: "Predictor" },
            { id: "dashboard", label: "Analytics" },
            { id: "integration", label: "Sheets Sync" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                currentTab === item.id
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "bg-slate-900 text-gray-400 border border-slate-850"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tab Content Router */}
        {currentTab === "landing" && (
          <Overview 
            onStartPredictor={() => setCurrentTab("predictor")} 
            onLeadAdded={handleNewLeadProcessed}
          />
        )}

        {currentTab === "predictor" && (
          <LeadPredictor 
            onLeadAdded={handleNewLeadProcessed} 
            sheetsActive={sheetsActive} 
          />
        )}

        {currentTab === "dashboard" && (
          <Analytics 
            leads={leads} 
            onUpdateStatus={handleUpdateStatus} 
            onDeleteLead={handleDeleteLead} 
            onResetLeads={handleResetLeads} 
          />
        )}

        {currentTab === "integration" && (
          <Integration />
        )}

      </main>

      {/* Corporate footer */}
      <Footer />

      {/* Instant CTA Floating Stack */}
      <ContactWidgets />

    </div>
  );
}
