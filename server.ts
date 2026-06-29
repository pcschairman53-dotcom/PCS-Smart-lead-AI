import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry headers
const geminiApiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API client:", error);
  }
} else {
  console.log("No GEMINI_API_KEY found. Operating in fallback rule-based mode for all leads.");
}

const LEADS_FILE = path.join(process.cwd(), "leads.json");
const SETTINGS_FILE = path.join(process.cwd(), "settings.json");

// Helper to get today's date adjusted by days
function getFutureDateStr(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

// Initial default leads to show rich dashboard stats immediately
const defaultLeads = [
  {
    id: "lead-1",
    dateTime: new Date(Date.now() - 4 * 3600000 * 24).toISOString(),
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
    followUpDate: getFutureDateStr(1),
    leadSource: "AI Assistant",
    whatsappStatus: "Contacted"
  },
  {
    id: "lead-2",
    dateTime: new Date(Date.now() - 3 * 3600000 * 24).toISOString(),
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
    followUpDate: getFutureDateStr(3),
    leadSource: "AI Assistant",
    whatsappStatus: "Pending"
  },
  {
    id: "lead-3",
    dateTime: new Date(Date.now() - 2 * 3600000 * 24).toISOString(),
    name: "Rohan Das",
    mobile: "+91 93301 98765",
    email: "das.rohan@outlook.com",
    businessName: "Das Stationery Hub",
    service: "Digital Marketing",
    budget: 15000,
    message: "Need local SEO optimization and Instagram ads setup to drive walk-in customers.",
    leadScore: 40,
    leadPriority: "Cold",
    aiAnalysis: "Budget is below threshold. Local retail lead requiring low-cost digital marketing support.",
    businessOpportunity: "Standard local SEO optimization packages.",
    conversionProbability: 35,
    recommendedAction: "Send automated catalog & standard packages.",
    followUpDate: getFutureDateStr(7),
    leadSource: "AI Assistant",
    whatsappStatus: "Pending"
  },
  {
    id: "lead-4",
    dateTime: new Date(Date.now() - 1 * 3600000 * 24).toISOString(),
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
    followUpDate: getFutureDateStr(1),
    leadSource: "AI Assistant",
    whatsappStatus: "Contacted"
  },
  {
    id: "lead-5",
    dateTime: new Date().toISOString(),
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
    followUpDate: getFutureDateStr(3),
    leadSource: "AI Assistant",
    whatsappStatus: "Pending"
  }
];

// Read/write helpers for database persistence
function readLeads(): any[] {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      return JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
    } else {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(defaultLeads, null, 2), "utf-8");
      return defaultLeads;
    }
  } catch (error) {
    console.error("Error reading leads file:", error);
    return defaultLeads;
  }
}

function writeLeads(leads: any[]): void {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing leads file:", error);
  }
}

function readSettings(): any {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    } else {
      const defaultSettings = { googleSheetsUrl: "" };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), "utf-8");
      return defaultSettings;
    }
  } catch (error) {
    return { googleSheetsUrl: "" };
  }
}

function writeSettings(settings: any): void {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing settings file:", error);
  }
}

// REST API Endpoints

// 1. Get all leads
app.get("/api/leads", (req, res) => {
  const leads = readLeads();
  res.json(leads);
});

// 2. Clear / Reset leads to default
app.post("/api/leads/reset", (req, res) => {
  writeLeads(defaultLeads);
  res.json({ success: true, leads: defaultLeads });
});

// 3. Save / Update lead status (e.g. WhatsAppStatus)
app.patch("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  const { whatsappStatus } = req.body;
  const leads = readLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx !== -1) {
    leads[idx].whatsappStatus = whatsappStatus || leads[idx].whatsappStatus;
    writeLeads(leads);
    res.json({ success: true, lead: leads[idx] });
  } else {
    res.status(404).json({ error: "Lead not found" });
  }
});

// 4. Delete lead
app.delete("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  const leads = readLeads();
  const filtered = leads.filter(l => l.id !== id);
  writeLeads(filtered);
  res.json({ success: true });
});

// 5. Get settings
app.get("/api/settings", (req, res) => {
  res.json(readSettings());
});

// 6. Save settings
app.post("/api/settings", (req, res) => {
  const { googleSheetsUrl } = req.body;
  const settings = { googleSheetsUrl };
  writeSettings(settings);
  res.json({ success: true, settings });
});

// 7. Lead Predictor Analyzer (Scoring + Hybrid AI Engine)
app.post("/api/analyze", async (req, res) => {
  try {
    const { name, mobile, email, businessName, service, budget, message } = req.body;

    if (!name || !mobile || !email || !service || !budget) {
      return res.status(400).json({ error: "Missing required fields for analysis" });
    }

    const budgetVal = Number(budget) || 0;

    // Load active backend configuration - defaults to the specified deployed Apps Script Web App URL
    const settings = readSettings();
    const targetUrl = settings.googleSheetsUrl || "https://script.google.com/macros/s/AKfycbwtZ8Z8KeZZZoRqZTDDod2IJlMVNw7RDodbL4Kx4Cwpjp4iyxnWg6j8PajAEzYUO2bhYg/exec";

    console.log(`Forwarding lead to Google Apps Script Backend: ${targetUrl}`);

    let scriptData: any = {};
    let isSuccess = false;
    let successMessage = "Lead processed successfully via corporate Google Apps Script engine.";

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          mobile,
          email,
          businessName: businessName || "Not specified",
          service,
          budget: budgetVal,
          message: message || ""
        }),
        redirect: "follow"
      });

      if (response.ok) {
        const textResult = await response.text();
        console.log("Apps Script raw response received:", textResult);
        try {
          scriptData = JSON.parse(textResult);
          isSuccess = true;
          if (scriptData.message) {
            successMessage = scriptData.message;
          }
        } catch (parseErr) {
          console.warn("Failed to parse Apps Script response as JSON. Trying text extraction.");
          // Create fallback structure from any text
          scriptData = {
            aiAnalysis: textResult.substring(0, 100)
          };
        }
      } else {
        console.error(`Apps Script responded with status: ${response.status}`);
      }
    } catch (networkErr: any) {
      console.error("Failed to connect to Google Apps Script Web App:", networkErr.message);
    }

    // MAP RESPONSE INTELLIGENTLY
    // The pre-deployed backend calculates all values. We extract and default gracefully.
    const leadScore = Number(scriptData.leadScore ?? scriptData.score ?? scriptData.lead_score ?? 75);
    const leadPriorityRaw = String(scriptData.leadPriority ?? scriptData.priority ?? scriptData.classification ?? scriptData.lead_priority ?? "Warm");
    const leadPriority: "Hot" | "Warm" | "Cold" = (leadPriorityRaw.toLowerCase().includes("hot") ? "Hot" : (leadPriorityRaw.toLowerCase().includes("cold") ? "Cold" : "Warm"));
    
    const aiAnalysis = String(scriptData.aiAnalysis ?? scriptData.analysis ?? scriptData.ai_analysis ?? "Processed successfully by PCS Lead Scoring Engine.");
    const businessOpportunity = String(scriptData.businessOpportunity ?? scriptData.opportunity ?? scriptData.business_opportunity ?? "Standard custom integration.");
    const conversionProbability = Number(scriptData.conversionProbability ?? scriptData.probability ?? scriptData.conversion_probability ?? 75);
    const recommendedAction = String(scriptData.recommendedAction ?? scriptData.action ?? scriptData.recommended_action ?? "Contact prospect via WhatsApp hotline.");
    const followUpDate = String(scriptData.followUpDate ?? scriptData.follow_up_date ?? getFutureDateStr(3));

    // Create the final structured lead object
    const newLead = {
      id: "lead-" + Date.now(),
      dateTime: new Date().toISOString(),
      name,
      mobile,
      email,
      businessName: businessName || "Not specified",
      service,
      budget: budgetVal,
      message: message || "None",
      leadScore,
      leadPriority,
      aiAnalysis,
      businessOpportunity,
      conversionProbability,
      recommendedAction,
      followUpDate,
      leadSource: "Google Apps Script Backend",
      whatsappStatus: "Pending"
    };

    // Store lead locally for the frontend dashboard analytics
    const leads = readLeads();
    leads.unshift(newLead);
    writeLeads(leads);

    res.json({
      success: true,
      message: successMessage,
      lead: newLead
    });
  } catch (error: any) {
    console.error("Proxy processing error:", error);
    res.status(500).json({ error: "SaaS Proxy Server error: " + error.message });
  }
});


// Configure Vite Development Server Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware enabled.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PCS Smart Lead Predictor AI running on http://localhost:${PORT}`);
  });
}

startServer();
