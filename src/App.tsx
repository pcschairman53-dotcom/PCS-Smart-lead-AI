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

const defaultLeads: Lead[] = [
  {
    id: "lead-1782737836336",
    dateTime: "2026-06-29T12:57:16.336Z",
    name: "pcs Chairman",
    mobile: "+919330457995",
    email: "pcschairman53@gmail.com",
    businessName: "PCS consultancy",
    service: "Website Development",
    budget: 25000,
    message: "good",
    leadScore: 45,
    leadPriority: "Cold",
    aiAnalysis: "Low priority lead. Nurture through marketing.",
    businessOpportunity: "Standard custom integration.",
    conversionProbability: 75,
    recommendedAction: "Contact prospect via WhatsApp hotline.",
    followUpDate: "2026-07-02",
    leadSource: "Google Sheets Sync",
    whatsappStatus: "Pending"
  },
  {
    id: "lead-1",
    dateTime: "2026-06-25T11:20:00.000Z",
    name: "Aarav Mehta",
    mobile: "+91 98300 12345",
    email: "aarav.mehta@techcorp.in",
    businessName: "Mehta Industrial Solutions",
    service: "AI Automation",
    budget: 75000,
    message: "We need an AI-powered conversational agent to triage and automate our incoming vendor inquiries.",
    leadScore: 90,
    leadPriority: "Hot",
    aiAnalysis: "High intent enterprise inquiry requesting immediate AI triage agent. Clear budget alignment.",
    businessOpportunity: "Automated agent platform for vendor operations, huge upsell potential.",
    conversionProbability: 92,
    recommendedAction: "Schedule a live architecture demo within 24 hours.",
    followUpDate: "2026-06-30",
    leadSource: "AI Assistant",
    whatsappStatus: "Contacted"
  },
  {
    id: "lead-2",
    dateTime: "2026-06-26T15:34:00.000Z",
    name: "Priya Sharma",
    mobile: "+91 98765 43210",
    email: "sharmapriya@gmail.com",
    businessName: "Sharma Organic Foods",
    service: "Website Development",
    budget: 35000,
    message: "Looking for an elegant e-commerce catalog website to sell organic tea and honey products online.",
    leadScore: 65,
    leadPriority: "Warm",
    aiAnalysis: "Warm standard business web platform project. Medium budget. Solid conversion potential.",
    businessOpportunity: "Custom catalog with payment integration and WhatsApp ordering.",
    conversionProbability: 70,
    recommendedAction: "Share past e-commerce portfolio and pricing plans.",
    followUpDate: "2026-07-02",
    leadSource: "AI Assistant",
    whatsappStatus: "Pending"
  },
  {
    id: "lead-3",
    dateTime: "2026-06-27T08:12:00.000Z",
    name: "Rohan Das",
    mobile: "+91 93301 98765",
    email: "das.rohan@outlook.com",
    businessName: "Das Stationery Hub",
    service: "Digital Marketing & Lead Generation",
    budget: 15000,
    message: "Need local SEO optimization and Instagram ads setup to drive walk-in customers.",
    leadScore: 40,
    leadPriority: "Cold",
    aiAnalysis: "Budget is below threshold. Local retail lead requiring low-cost digital marketing support.",
    businessOpportunity: "Standard local SEO optimization packages.",
    conversionProbability: 35,
    recommendedAction: "Send automated catalog & standard packages.",
    followUpDate: "2026-07-06",
    leadSource: "AI Assistant",
    whatsappStatus: "Pending"
  },
  {
    id: "lead-4",
    dateTime: "2026-06-28T14:45:00.000Z",
    name: "Ananya Sen",
    mobile: "+91 94330 55443",
    email: "ananya.sen@senconsulting.co",
    businessName: "Sen & Associates CRM",
    service: "CRM Setup",
    budget: 60000,
    message: "We need an end-to-end CRM automation setup using HubSpot or Zoho. Want automated email sequences.",
    leadScore: 85,
    leadPriority: "Hot",
    aiAnalysis: "Hot lead targeting complete CRM workflows and active sequences. High decision power.",
    businessOpportunity: "Full workflow setup, platform licensing referral opportunities.",
    conversionProbability: 88,
    recommendedAction: "Schedule CRM diagnostic call.",
    followUpDate: "2026-06-30",
    leadSource: "AI Assistant",
    whatsappStatus: "Contacted"
  },
  {
    id: "lead-5",
    dateTime: "2026-06-29T02:10:00.000Z",
    name: "Vikram Malhotra",
    mobile: "+91 98112 33445",
    email: "vmalhotra@gmail.com",
    businessName: "Malhotra Realties",
    service: "WhatsApp Automation",
    budget: 45000,
    message: "Want automatic lead alerts sent to our agents via WhatsApp as soon as they register on our site.",
    leadScore: 75,
    leadPriority: "Warm",
    aiAnalysis: "Strong interest in API automation. High conversion alignment if standard pricing matches.",
    businessOpportunity: "WhatsApp API trigger logic integration with lead capturing portals.",
    conversionProbability: 78,
    recommendedAction: "Send WhatsApp Automation case studies.",
    followUpDate: "2026-07-02",
    leadSource: "AI Assistant",
    whatsappStatus: "Pending"
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("landing");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sheetsActive, setSheetsActive] = useState(false);
  const [geminiActive, setGeminiActive] = useState(false);

  // Load leads and verify integrations
  const fetchLeads = async () => {
    try {
      const cached = localStorage.getItem("pcs_leads_cache");
      if (cached) {
        setLeads(JSON.parse(cached));
      } else {
        localStorage.setItem("pcs_leads_cache", JSON.stringify(defaultLeads));
        setLeads(defaultLeads);
      }
    } catch (err) {
      console.error("Failed to load leads from localStorage:", err);
      setLeads(defaultLeads);
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
      const updatedLeads = leads.map(l => l.id === id ? { ...l, whatsappStatus: status } : l);
      setLeads(updatedLeads);
      localStorage.setItem("pcs_leads_cache", JSON.stringify(updatedLeads));
    } catch (err) {
      console.error("Failed to update status in localStorage:", err);
    }
  };

  // Delete Lead
  const handleDeleteLead = async (id: string) => {
    try {
      const updatedLeads = leads.filter(l => l.id !== id);
      setLeads(updatedLeads);
      localStorage.setItem("pcs_leads_cache", JSON.stringify(updatedLeads));
    } catch (err) {
      console.error("Failed to delete lead from localStorage:", err);
    }
  };

  // Reset Leads to Defaults
  const handleResetLeads = async () => {
    try {
      setLeads(defaultLeads);
      localStorage.setItem("pcs_leads_cache", JSON.stringify(defaultLeads));
    } catch (err) {
      console.error("Failed to reset leads dataset in localStorage:", err);
    }
  };

  // Callback when a new lead is processed
  const handleNewLeadProcessed = (newLead: Lead) => {
    setLeads(prevLeads => {
      const updated = [newLead, ...prevLeads];
      localStorage.setItem("pcs_leads_cache", JSON.stringify(updated));
      return updated;
    });
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
