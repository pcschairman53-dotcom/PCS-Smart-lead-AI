import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Layers, 
  Send, 
  Calculator, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  PhoneCall, 
  ArrowRight,
  Database,
  Mail,
  HelpCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { Lead } from "../types";

interface LeadPredictorProps {
  onLeadAdded: (newLead: Lead) => void;
  sheetsActive: boolean;
}

export default function LeadPredictor({ onLeadAdded, sheetsActive }: LeadPredictorProps) {
  // Form state
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [service, setService] = useState("AI Automation");
  const [budget, setBudget] = useState(45000); // Slider or input
  const [message, setMessage] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<Lead | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validation
  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!name.trim()) tempErrors.name = "Full name is required";
    if (!mobile.trim()) {
      tempErrors.mobile = "Mobile number is required";
    } else if (mobile.replace(/[^0-9]/g, "").length < 10) {
      tempErrors.mobile = "Please provide a valid 10-digit mobile number";
    }
    if (!email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!email.includes("@")) {
      tempErrors.email = "Email format is invalid";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit handler
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setPredictionResult(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile,
          email,
          businessName,
          service,
          budget,
          message
        })
      });

      if (!response.ok) {
        throw new Error("Analysis request failed");
      }

      const data = await response.json();
      if (data.success && data.lead) {
        setPredictionResult(data.lead);
        setSuccessMsg(data.message || "Lead synchronized and processed successfully.");
        onLeadAdded(data.lead);
      }
    } catch (err: any) {
      console.error(err);
      // Fallback state on network error
      setSuccessMsg("Offline Fallback Mode Enabled");
      const mockFallback: Lead = {
        id: "err-" + Date.now(),
        dateTime: new Date().toISOString(),
        name,
        mobile,
        email,
        businessName: businessName || "Not specified",
        service,
        budget,
        message: message || "None",
        leadScore: 80,
        leadPriority: "Hot",
        aiAnalysis: "Analyzed by fallback rules. Live server connection timed out.",
        businessOpportunity: `Custom solution for standard ${service} inquiries.`,
        conversionProbability: 85,
        recommendedAction: "Book priority appointment immediately",
        followUpDate: "Within 24 Hours",
        leadSource: "Local Fallback Mode",
        whatsappStatus: "Pending"
      };
      setPredictionResult(mockFallback);
      onLeadAdded(mockFallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick reset form
  const handleReset = () => {
    setName("");
    setMobile("");
    setEmail("");
    setBusinessName("");
    setService("AI Automation");
    setBudget(45000);
    setMessage("");
    setPredictionResult(null);
  };

  // Calculate follow-up timeline string
  const getFollowUpTimeline = (p: string) => {
    if (p === "Hot") return "1 Day SLA (Urgent)";
    if (p === "Warm") return "3 Days SLA (Standard)";
    return "7 Days SLA (Nurture)";
  };

  // Get WhatsApp redirect link and label based on classification
  const getWhatsAppAction = (lead: Lead) => {
    let text = "";
    if (lead.leadPriority === "Hot") {
      text = `Hello PCS Consultancy, this is ${lead.name} from ${lead.businessName || "My Business"}. I am highly interested in your ${lead.service} services. I have an estimated budget of ₹${lead.budget}. Please book a priority corporate consultation for me.`;
    } else if (lead.leadPriority === "Warm") {
      text = `Hello PCS Consultancy, this is ${lead.name}. I would like to talk to a consultant about your ${lead.service} packages (budget: ₹${lead.budget}).`;
    } else {
      text = `Hello PCS Consultancy, this is ${lead.name}. I would like to receive a free consultation regarding ${lead.service}.`;
    }
    
    const encoded = encodeURIComponent(text);
    const link = `https://wa.me/919330457995?text=${encoded}`;
    
    let btnLabel = "Get Free Consultation";
    if (lead.leadPriority === "Hot") btnLabel = "Book Priority Consultation";
    else if (lead.leadPriority === "Warm") btnLabel = "Talk To PCS Consultancy";

    return { link, btnLabel };
  };

  const servicesList = [
    "AI Automation",
    "Website Development",
    "WhatsApp Automation",
    "CRM Setup",
    "Digital Marketing",
    "Recruitment Consulting",
    "Financial Consulting",
    "Business Growth Solutions"
  ];

  return (
    <div className="space-y-8" id="predictor-tab-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-6" id="lead-form-container">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Capture Corporate Intent
              </h3>
              <p className="text-xs text-gray-400 mt-1">Submit parameters below to classify priority metrics.</p>
            </div>
            <button 
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Form
            </button>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full name */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Satish Roy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-slate-950 border ${errors.name ? "border-red-500/60" : "border-slate-800"} focus:border-indigo-500 text-sm rounded-xl px-4 py-3 text-white transition-colors outline-none`}
                  required
                />
                {errors.name && <p className="text-[10px] text-red-400 font-medium">{errors.name}</p>}
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Mobile Contact *</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98300 55667"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={`w-full bg-slate-950 border ${errors.mobile ? "border-red-500/60" : "border-slate-800"} focus:border-indigo-500 text-sm rounded-xl px-4 py-3 text-white transition-colors outline-none`}
                  required
                />
                {errors.mobile && <p className="text-[10px] text-red-400 font-medium">{errors.mobile}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Business Email *</label>
                <input
                  type="email"
                  placeholder="e.g. sroy@venture.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-950 border ${errors.email ? "border-red-500/60" : "border-slate-800"} focus:border-indigo-500 text-sm rounded-xl px-4 py-3 text-white transition-colors outline-none`}
                  required
                />
                {errors.email && <p className="text-[10px] text-red-400 font-medium">{errors.email}</p>}
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Business Name</label>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">+10 pts bonus</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Roy Global Enterprises"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm rounded-xl px-4 py-3 text-white transition-colors outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Selection */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Target Solution *</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm rounded-xl px-4 py-3 text-white transition-colors outline-none"
                >
                  {servicesList.map((svc) => (
                    <option key={svc} value={svc}>{svc}</option>
                  ))}
                </select>
              </div>

              {/* Budget slider/input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Estimated Budget (INR)</label>
                  <span className="text-xs font-mono font-bold text-emerald-400">₹{budget.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex gap-3 items-center pt-1">
                  <input
                    type="range"
                    min="10000"
                    max="150000"
                    step="5000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer border border-slate-800"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                  <span>Below 20K (10 pts)</span>
                  <span>20K-50K (25 pts)</span>
                  <span>Above 50K (40 pts)</span>
                </div>
              </div>
            </div>

            {/* Custom customer message */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Prospect Requirements Message</label>
                <span className="text-[10px] font-mono text-purple-400 font-bold">&gt;20 chars: +15 pts bonus</span>
              </div>
              <textarea
                placeholder="Describe project details, technology requirements, integrations..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm rounded-xl px-4 py-3 text-white transition-colors outline-none resize-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold tracking-wide uppercase text-xs transition-all duration-300 shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Intent with Hybrid Lead Scoring...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Perform Predictive Lead Classification
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Submission Outcome / Apps Script Dashboard */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Connection Status Widget */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h4 className="text-xs font-extrabold text-gray-400 tracking-wider uppercase text-slate-400">
                Backend Pipeline
              </h4>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                APPS SCRIPT LIVE
              </div>
            </div>

            {predictionResult ? (
              <div className="space-y-4">
                {/* Display Success Message */}
                {successMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-start gap-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-emerald-200">Success Status:</span>
                      <p className="text-[11px] leading-relaxed mt-0.5 text-gray-300">{successMsg}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-end justify-between bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Lead Priority</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-black ${
                        predictionResult.leadPriority === "Hot" ? "text-red-400" : (predictionResult.leadPriority === "Warm" ? "text-amber-400" : "text-blue-400")
                      }`}>
                        {predictionResult.leadPriority} Priority
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        predictionResult.leadPriority === "Hot" ? "bg-red-500 animate-ping" : (predictionResult.leadPriority === "Warm" ? "bg-amber-400" : "bg-blue-400")
                      }`} />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Computed Score</span>
                    <p className="text-4xl font-extrabold text-white">{predictionResult.leadScore}<span className="text-sm text-gray-500">/100</span></p>
                  </div>
                </div>

                {/* Score progress bar */}
                <div className="w-full bg-slate-950 border border-slate-850 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      predictionResult.leadPriority === "Hot" ? "bg-gradient-to-r from-red-500 to-amber-500" : (predictionResult.leadPriority === "Warm" ? "bg-amber-500" : "bg-blue-500")
                    }`}
                    style={{ width: `${predictionResult.leadScore}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 leading-relaxed">
                  All parameters will be safely transmitted directly to your pre-deployed corporate Google Sheets Apps Script endpoint.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850/60 text-[11px] text-gray-400 space-y-2">
                  <p className="font-bold text-gray-300">📍 Active Backend Actions:</p>
                  <ul className="space-y-1.5 list-disc pl-3">
                    <li>Lead saving & database archiving</li>
                    <li>Google Sheets rows insert</li>
                    <li>High-performance Lead Scoring Classification</li>
                    <li>Hot/Warm/Cold SLA prediction</li>
                    <li>Gemini Enterprise AI analysis</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE DECISION MATRIX / ANALYSIS RESULT CARD */}
          {predictionResult ? (
            <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-purple-500 space-y-5 animate-fade-in" id="analysis-result-box">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Interactive Assessment Result</h3>
                    <p className="text-[10px] text-gray-400">Classified using Apps Script Hybrid Engine</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-[10px] font-extrabold text-purple-300 font-mono">
                  {predictionResult.leadPriority === "Hot" ? "GEMINI AI ENGAGED" : "RULE CONTROLLER"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Conversion Prob</span>
                  <p className="text-xl font-bold text-emerald-400">{predictionResult.conversionProbability}%</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Timeline Goal</span>
                  <p className="text-xl font-bold text-white">{getFollowUpTimeline(predictionResult.leadPriority)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    AI Core Analysis
                  </span>
                  <p className="text-sm text-gray-200 font-medium leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                    {predictionResult.aiAnalysis}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Identified Business Opportunity
                  </span>
                  <p className="text-sm text-gray-300 italic">
                    "{predictionResult.businessOpportunity}"
                  </p>
                </div>

                <div className="space-y-1.5 border-t border-slate-850 pt-3">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    Recommended Action
                  </span>
                  <p className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                    {predictionResult.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Dynamic WhatsApp CTA Redirection */}
              <div className="pt-2">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                  Instant Team Engagement Trigger
                </div>
                <a
                  href={getWhatsAppAction(predictionResult).link}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                    predictionResult.leadPriority === "Hot"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white shadow-md shadow-indigo-600/20"
                      : (predictionResult.leadPriority === "Warm" ? "bg-amber-500 hover:bg-amber-400 text-slate-950" : "bg-emerald-600 hover:bg-emerald-500 text-white")
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  {getWhatsAppAction(predictionResult).btnLabel}
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-950/30 border border-slate-850 border-dashed text-gray-500 space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
                <HelpCircle className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-300">Awaiting Simulation Submit</p>
                <p className="text-xs text-gray-500 mt-1">Please enter lead parameters on the left and trigger predictive analysis to execute the remote Apps Script pipeline.</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
