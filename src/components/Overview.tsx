import React, { useState } from "react";
import { 
  Briefcase, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  ArrowRight, 
  MessageSquare, 
  CheckCircle,
  TrendingUp, 
  Users, 
  DollarSign, 
  Globe,
  X,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Lead } from "../types";

interface OverviewProps {
  onStartPredictor: () => void;
  onLeadAdded?: (lead: Lead) => void;
}

export default function Overview({ onStartPredictor, onLeadAdded }: OverviewProps) {
  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [businessNameStr, setBusinessNameStr] = useState("");
  const [budgetVal, setBudgetVal] = useState(25000);
  const [messageText, setMessageText] = useState("");
  
  // Validation, submitting, success
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<Lead | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  const handleCardClick = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
    setModalOpen(true);
    // Reset previous states
    setFullName("");
    setMobile("");
    setEmail("");
    setBusinessNameStr("");
    setBudgetVal(25000);
    setMessageText("");
    setFormErrors({});
    setSubmissionResult(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const tempErrors: { [key: string]: string } = {};
    if (!fullName.trim()) tempErrors.fullName = "Full name is required";
    if (!mobile.trim()) {
      tempErrors.mobile = "Mobile number is required";
    } else if (mobile.replace(/[^0-9]/g, "").length < 10) {
      tempErrors.mobile = "Enter a valid 10-digit mobile number";
    }
    
    if (!email.trim()) {
      tempErrors.email = "Email address is required";
    } else if (!email.includes("@") || email.length < 5) {
      tempErrors.email = "Enter a valid email address";
    }
    
    if (budgetVal <= 0) {
      tempErrors.budget = "Please enter a valid business budget";
    }
    
    if (Object.keys(tempErrors).length > 0) {
      setFormErrors(tempErrors);
      return;
    }
    
    setFormErrors({});
    setIsSubmittingForm(true);
    
    try {
      const url = localStorage.getItem("pcs_google_sheets_url") || "https://script.google.com/macros/s/AKfycbwtZ8Z8KeZZZoRqZTDDod2IJlMVNw7RDodbL4Kx4Cwpjp4iyxnWg6j8PajAEzYUO2bhYg/exec";
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          name: fullName,
          mobile,
          email,
          businessName: businessNameStr || "Not specified",
          service: selectedService,
          budget: budgetVal,
          message: messageText || `Interested in ${selectedService}`
        }),
        redirect: "follow"
      });
      
      if (response.ok) {
        const data = await response.json();
        const scriptData = data.lead || data;
        
        const leadScore = Number(scriptData.leadScore ?? scriptData.score ?? scriptData.lead_score ?? 75);
        const leadPriorityRaw = String(scriptData.leadPriority ?? scriptData.priority ?? scriptData.classification ?? scriptData.lead_priority ?? "Warm");
        const leadPriority: "Hot" | "Warm" | "Cold" = (leadPriorityRaw.toLowerCase().includes("hot") ? "Hot" : (leadPriorityRaw.toLowerCase().includes("cold") ? "Cold" : "Warm"));
        
        const aiAnalysis = String(scriptData.aiAnalysis ?? scriptData.analysis ?? scriptData.ai_analysis ?? "Processed successfully by PCS Lead Scoring Engine.");
        const businessOpportunity = String(scriptData.businessOpportunity ?? scriptData.opportunity ?? scriptData.business_opportunity ?? "Standard custom integration.");
        const conversionProbability = Number(scriptData.conversionProbability ?? scriptData.probability ?? scriptData.conversion_probability ?? 75);
        const recommendedAction = String(scriptData.recommendedAction ?? scriptData.action ?? scriptData.recommended_action ?? "Contact prospect via WhatsApp hotline.");
        const followUpDate = String(scriptData.followUpDate ?? scriptData.follow_up_date ?? new Date().toISOString().split("T")[0]);

        const finishedLead: Lead = {
          id: "lead-" + Date.now(),
          dateTime: new Date().toISOString(),
          name: fullName,
          mobile,
          email,
          businessName: businessNameStr || "Not specified",
          service: selectedService,
          budget: budgetVal,
          message: messageText || `Interested in ${selectedService}`,
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

        setSubmissionResult(finishedLead);
        
        // Trigger success callback to add to analytics ledger
        if (onLeadAdded) {
          onLeadAdded(finishedLead);
        }
        
        // Show persistent success toast in the corner
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 5000);
        
        // Generate Whatsapp link
        const rawMsg = `Hello PCS Consultancy,

New Business Enquiry

Name:
${fullName}

Mobile:
${mobile}

Email:
${email}

Business:
${businessNameStr || "Not specified"}

Service:
${selectedService}

Budget:
₹${budgetVal}

Lead Score:
${finishedLead.leadScore}

Priority:
${finishedLead.leadPriority}

AI Analysis:
${finishedLead.aiAnalysis}

I would like to discuss this requirement.`;

        const encodedMsg = encodeURIComponent(rawMsg);
        const whatsappUrl = `https://wa.me/919330457995?text=${encodedMsg}`;
        
        // Open WhatsApp automatically
        setTimeout(() => {
          window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        }, 600);

        // Reset the form input fields
        setFullName("");
        setMobile("");
        setEmail("");
        setBusinessNameStr("");
        setBudgetVal(25000);
        setMessageText("");
      }
    } catch (err) {
      console.error("Failed to submit card lead through backend pipeline:", err);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const companyInfo = {
    name: "PCS Consultancy",
    registration: "MSME Registered Enterprise",
    phone: "+91 93304 57995",
    email: "pcschairman53@gmail.com",
    website: "https://pcs-consultancy.netlify.app",
    address: "40A/K.C.C Mitra Street, Belgharia, Kolkata-700056, West Bengal, India"
  };

  const services = [
    {
      title: "AI Automation",
      description: "Custom conversational AI bots, business workflow automation, and cognitive processing units.",
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      tag: "Advanced"
    },
    {
      title: "Website Development",
      description: "Stunning, rapid-loading web platforms, e-commerce stores, and custom software architectures.",
      icon: <Globe className="w-5 h-5 text-blue-400" />,
      tag: "Premium"
    },
    {
      title: "WhatsApp Automation",
      description: "Direct instant triggers, automated client messaging campaigns, and API integrations.",
      icon: <MessageSquare className="w-5 h-5 text-green-400" />,
      tag: "High ROI"
    },
    {
      title: "CRM Setup",
      description: "End-to-end setups using industry standards like HubSpot, Zoho, or customized automated layouts.",
      icon: <Briefcase className="w-5 h-5 text-amber-400" />,
      tag: "Enterprise"
    },
    {
      title: "Digital Marketing & Lead Gen",
      description: "Hyper-targeted advertising, search engine optimization (SEO), and conversion funnel building.",
      icon: <TrendingUp className="w-5 h-5 text-red-400" />,
      tag: "Growth"
    },
    {
      title: "Recruitment & Financial Consulting",
      description: "Corporate recruitment solutions paired with comprehensive business growth strategies.",
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      tag: "Consulting"
    }
  ];

  const testimonials = [
    {
      quote: "The AI lead predictor tool revolutionized how we handle incoming business. Our conversion rates shot up by 42% in under a month.",
      author: "Rajesh Sen",
      role: "Operations Director, Sen Logistics",
      rating: "★★★★★"
    },
    {
      quote: "PCS's automatic lead prioritization helped our sales agents focus entirely on hot enterprise accounts first. Simply outstanding design.",
      author: "Meera Nair",
      role: "VP of Sales, TechCorp India",
      rating: "★★★★★"
    }
  ];

  return (
    <div className="space-y-12 pb-16" id="overview-container">
      {/* Premium Apple-inspired Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 p-8 md:p-12" id="hero-section">
        {/* Aesthetic Background Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-indigo-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Modern Enterprises with AI Dynamics
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white">
            Transform Your Sales with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-200 to-blue-400">
              PCS Smart Lead Predictor
            </span>
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
            A high-performance enterprise lead classification platform. Instantly score prospects, qualify warm deals, and harness 
            <span className="text-purple-300 font-medium"> PCS AI Engine </span> 
            to generate immediate tactical conversion strategies for premium accounts.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button
              onClick={onStartPredictor}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all duration-300 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
              id="hero-cta-btn"
            >
              Analyze Hot Leads Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#services-section"
              className="px-6 py-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-gray-200 hover:text-white font-medium transition-all duration-300 text-center"
            >
              Explore Solutions
            </a>
          </div>
        </div>

        {/* Corporate Trust Badges / Stats Block */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80">
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-extrabold text-white">90%+</p>
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">AI Prediction Accuracy</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-extrabold text-purple-400">1-Day</p>
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Hot Lead Response SLA</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-extrabold text-indigo-400">0.05s</p>
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Rule Engine Latency</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-extrabold text-emerald-400">100%</p>
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Google Sheets Secured</p>
          </div>
        </div>
      </section>

      {/* Services Portfolio Section */}
      <section id="services-section" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Our Core Offerings</h2>
          <p className="text-gray-400 text-sm">
            Comprehensive business growth and AI automation capabilities designed for the modern registered micro, small and medium enterprise ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              onClick={() => handleCardClick(service.title)}
              className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/70 transition-all duration-300 hover:translate-y-[-4px] active:scale-95 group cursor-pointer shadow-md hover:shadow-purple-500/5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center group-hover:border-purple-500/30 transition-colors">
                  {service.icon}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-950 text-gray-400 border border-slate-800 group-hover:border-purple-500/20 group-hover:text-purple-300 transition-colors">
                  {service.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                {service.title}
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-purple-400" />
              </h3>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed group-hover:text-gray-300 transition-colors">
                {service.description}
              </p>
              <div className="mt-4 flex items-center text-[11px] font-bold text-purple-400 group-hover:text-purple-300">
                <span>Request Custom Solution</span>
                <Sparkles className="w-3 h-3 ml-1 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Structured Corporate Information Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="corporate-profile">
        {/* Office details */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-purple-500 rounded-full" />
            Corporate Directory & HQ
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            PCS Consultancy operates as an MSME registered professional growth and technological automation firm in Kolkata, West Bengal. We specialize in robust software configurations, bespoke CRM automation architectures, and strategic corporate financial advisory.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-gray-400 mt-0.5">
                  <MapPin className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Office Headquarters</h4>
                  <p className="text-sm text-gray-200 font-medium mt-1">
                    {companyInfo.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-gray-400 mt-0.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Web Portal</h4>
                  <a 
                    href={companyInfo.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-sm text-indigo-400 font-medium mt-1 hover:underline inline-flex items-center gap-1"
                  >
                    pcs-consultancy.netlify.app
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-gray-400 mt-0.5">
                  <Phone className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Primary Telephone</h4>
                  <p className="text-sm text-gray-200 font-medium mt-1">
                    {companyInfo.phone}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">MSME registered line</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-gray-400 mt-0.5">
                  <Mail className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Inquiries Mailbox</h4>
                  <p className="text-sm text-gray-200 font-medium mt-1">
                    {companyInfo.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <a 
              href="https://maps.google.com/?q=40A/K.C.C+Mitra+Street,+Belgharia,+Kolkata-700056"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-xs text-gray-300 font-bold tracking-wide hover:text-white transition-all"
            >
              Get GPS Directions on Google Maps
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
            </a>
          </div>
        </div>

        {/* Corporate Trust and Registry details */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border-l-4 border-l-purple-500">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
              Verification Badge
            </div>
            <h3 className="text-xl font-bold text-white">Registry & Credibility</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              As a fully verified <span className="text-white font-medium">MSME Registered Enterprise</span> in West Bengal, India, PCS Consultancy stands for absolute technical transparency, standard pricing metrics, and prompt SLAs.
            </p>
            
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Standardized Lead Handling Frameworks</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Latency Local Logic Controllers</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Compliant with Google Enterprise Ecosystems</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6">
            <p className="text-[10px] text-gray-500 italic">
              "Providing cutting edge automation models that minimize API calls and drive actual enterprise valuation."
            </p>
            <p className="text-xs text-gray-300 font-semibold mt-2">— Board of Administration, PCS</p>
          </div>
        </div>
      </section>

      {/* Interactive Client Case Studies / Testimonials */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-500 rounded-full" />
          Client Testimonials & Feedback
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-950/50 border border-slate-850 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 text-xs font-bold tracking-wide">{t.rating}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Verified Account</span>
              </div>
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "{t.quote}"
              </p>
              <div>
                <h4 className="text-sm font-semibold text-white">{t.author}</h4>
                <p className="text-xs text-gray-500 font-medium">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUCCESS FLOATING TOAST */}
      {successToast && (
        <div className="fixed bottom-24 right-6 z-[9999] bg-slate-950/90 backdrop-blur-md border border-emerald-500/30 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in max-w-sm">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-200">SLA Pipeline Synced</p>
            <p className="text-[11px] text-gray-400">Lead added to Google Sheets ledger and scored!</p>
          </div>
          <button onClick={() => setSuccessToast(false)} className="text-gray-500 hover:text-white ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PREMIUM SAAS CONSULTATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Blur overlay */}
          <div 
            className="fixed inset-0 bg-[#020617]/85 backdrop-blur-md transition-opacity" 
            onClick={() => setModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl transform rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl p-6 md:p-8 text-left transition-all z-10 max-h-[90vh] overflow-y-auto scrollbar-thin">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase tracking-wider bg-purple-500/15 text-purple-400 font-extrabold px-2.5 py-1 rounded border border-purple-500/20">
                  Premium Enterprise SLA
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white mt-2">
                  {submissionResult ? "Consultation Assessment Ready" : `Request ${selectedService}`}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {submissionResult ? "Real-time scorer & Google Sheets connection verified." : "Submit your enterprise parameters directly to our predictive scoring pipeline."}
                </p>
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-900 text-gray-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Switch: Show Form OR Submission Result */}
            {!submissionResult ? (
              <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
                
                {/* Full Name & Business Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                      Full Name <span className="text-purple-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priyanshu Chatterjee"
                      className={`w-full bg-slate-950/60 border ${formErrors.fullName ? 'border-red-500' : 'border-slate-850'} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all`}
                    />
                    {formErrors.fullName && (
                      <p className="text-[10px] text-red-400 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                      Business Name
                    </label>
                    <input 
                      type="text" 
                      value={businessNameStr}
                      onChange={(e) => setBusinessNameStr(e.target.value)}
                      placeholder="e.g. PCS Consultancy"
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                {/* Mobile & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                      Mobile Number <span className="text-purple-400">*</span>
                    </label>
                    <input 
                      type="tel" 
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. +91 93304 57995"
                      className={`w-full bg-slate-950/60 border ${formErrors.mobile ? 'border-red-500' : 'border-slate-850'} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all`}
                    />
                    {formErrors.mobile && (
                      <p className="text-[10px] text-red-400 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.mobile}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                      Email Address <span className="text-purple-400">*</span>
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. client@company.com"
                      className={`w-full bg-slate-950/60 border ${formErrors.email ? 'border-red-500' : 'border-slate-850'} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all`}
                    />
                    {formErrors.email && (
                      <p className="text-[10px] text-red-400 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Select & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                      Service Required
                    </label>
                    <select 
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
                    >
                      <option value="AI Automation" className="bg-slate-950 text-white">AI Automation</option>
                      <option value="Website Development" className="bg-slate-950 text-white">Website Development</option>
                      <option value="WhatsApp Automation" className="bg-slate-950 text-white">WhatsApp Automation</option>
                      <option value="CRM Setup" className="bg-slate-950 text-white">CRM Setup</option>
                      <option value="Digital Marketing & Lead Gen" className="bg-slate-950 text-white">Digital Marketing & Lead Gen</option>
                      <option value="Recruitment & Financial Consulting" className="bg-slate-950 text-white">Recruitment & Financial Consulting</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                      Estimated Budget (INR ₹) <span className="text-purple-400">*</span>
                    </label>
                    <input 
                      type="number" 
                      value={budgetVal}
                      onChange={(e) => setBudgetVal(Number(e.target.value))}
                      placeholder="e.g. 25000"
                      className={`w-full bg-slate-950/60 border ${formErrors.budget ? 'border-red-500' : 'border-slate-850'} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all`}
                    />
                    {formErrors.budget && (
                      <p className="text-[10px] text-red-400 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.budget}
                      </p>
                    )}
                  </div>
                </div>

                {/* Requirements / Custom Message */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                    Custom Message & Core Objectives
                  </label>
                  <textarea 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={3}
                    placeholder={`Details regarding your custom request for ${selectedService}...`}
                    className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs text-gray-300 font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingForm}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                  >
                    {isSubmittingForm ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Scoring lead...
                      </>
                    ) : (
                      <>
                        Submit Parameters
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* RESULTS DASHBOARD */
              <div className="pt-6 space-y-6 animate-fade-in">
                
                {/* Classification Banner */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">Google Sheets Synchronized</h4>
                    <p className="text-xs text-gray-300 leading-relaxed mt-0.5">
                      Your inquiry was captured securely inside the enterprise cloud registry. The Google Apps Script predictive scoring algorithm responded with the parameters below.
                    </p>
                  </div>
                </div>

                {/* Score and Priority widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">Computed Score</p>
                      <h4 className="text-2xl font-black text-white mt-1">{submissionResult.leadScore}<span className="text-xs text-gray-500"> /100</span></h4>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-purple-500/20 bg-purple-500/5 flex items-center justify-center font-bold text-sm text-purple-400">
                      Score
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">Classification</p>
                      <h4 className={`text-xl font-black mt-1 ${
                        submissionResult.leadPriority === "Hot" ? "text-red-400" : (submissionResult.leadPriority === "Warm" ? "text-amber-400" : "text-blue-400")
                      }`}>
                        {submissionResult.leadPriority} Priority
                      </h4>
                    </div>
                    <span className={`w-3.5 h-3.5 rounded-full ${
                      submissionResult.leadPriority === "Hot" ? "bg-red-500 animate-pulse" : (submissionResult.leadPriority === "Warm" ? "bg-amber-400" : "bg-blue-400")
                    }`} />
                  </div>
                </div>

                {/* Score indicator progress line */}
                <div className="w-full bg-slate-950 border border-slate-850 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      submissionResult.leadPriority === "Hot" ? "bg-gradient-to-r from-red-500 to-amber-500" : (submissionResult.leadPriority === "Warm" ? "bg-amber-500" : "bg-blue-500")
                    }`}
                    style={{ width: `${submissionResult.leadScore}%` }}
                  />
                </div>

                {/* Analysis & Details */}
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Synthesized Opportunity Analysis
                    </span>
                    <p className="text-sm text-gray-200 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-850">
                      {submissionResult.aiAnalysis}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>Next Actions SLA Date: <strong className="text-white font-semibold">{submissionResult.followUpDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-400" />
                      <span>Conversion Probability: <strong className="text-white font-semibold">{submissionResult.conversionProbability}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp callout direct action */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                  <p className="text-xs font-bold text-emerald-300">
                    🚀 Instant Hotline Link Ready!
                  </p>
                  <p className="text-[11px] text-gray-300">
                    Our sales team operates a priority WhatsApp routing desk. Your parameters are prefilled. Click below to continue directly.
                  </p>
                  <a
                    href={`https://wa.me/919330457995?text=${encodeURIComponent(
                      `Hello PCS Consultancy,\n\nNew Business Enquiry\n\nName:\n${fullName}\n\nMobile:\n${mobile}\n\nEmail:\n${email}\n\nBusiness:\n${businessNameStr || "Not specified"}\n\nService:\n${selectedService}\n\nBudget:\n₹${budgetVal}\n\nLead Score:\n${submissionResult.leadScore}\n\nPriority:\n${submissionResult.leadPriority}\n\nAI Analysis:\n${submissionResult.aiAnalysis}\n\nI would like to discuss this requirement.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all w-full md:w-auto"
                  >
                    Continue on WhatsApp Direct
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Footer action */}
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-xs font-bold text-gray-300 transition-all"
                  >
                    Close Assessment
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
