import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Users, 
  Layers, 
  Briefcase, 
  Search, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Calendar, 
  MessageSquare, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Lead } from "../types";

interface AnalyticsProps {
  leads: Lead[];
  onUpdateStatus: (id: string, status: 'Pending' | 'Contacted') => void;
  onDeleteLead: (id: string) => void;
  onResetLeads: () => void;
}

export default function Analytics({ leads, onUpdateStatus, onDeleteLead, onResetLeads }: AnalyticsProps) {
  // Filters & Searching
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"All" | "Hot" | "Warm" | "Cold">("All");
  
  // Modal / Expansion state
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    let hot = 0;
    let warm = 0;
    let cold = 0;
    let totalPipeline = 0;
    let weightedPotential = 0;
    let totalScoreSum = 0;
    let followUpsDue = 0;

    leads.forEach((l) => {
      totalPipeline += l.budget;
      weightedPotential += l.budget * (l.conversionProbability / 100);
      totalScoreSum += l.leadScore;

      if (l.leadPriority === "Hot") {
        hot++;
        if (l.whatsappStatus === "Pending") followUpsDue++;
      } else if (l.leadPriority === "Warm") {
        warm++;
        if (l.whatsappStatus === "Pending") followUpsDue++;
      } else {
        cold++;
      }
    });

    const avgScore = leads.length > 0 ? Math.round(totalScoreSum / leads.length) : 0;

    return {
      total: leads.length,
      hot,
      warm,
      cold,
      totalPipeline,
      weightedPotential,
      avgScore,
      followUpsDue
    };
  }, [leads]);

  // Chart Data: Priority Distribution
  const priorityChartData = [
    { name: "Hot Leads", value: stats.hot, color: "#a78bfa" },
    { name: "Warm Leads", value: stats.warm, color: "#f59e0b" },
    { name: "Cold Leads", value: stats.cold, color: "#3b82f6" },
  ];

  // Chart Data: Service Analysis
  const serviceChartData = useMemo(() => {
    const serviceMap: { [key: string]: { count: number; value: number } } = {};
    leads.forEach((l) => {
      if (!serviceMap[l.service]) {
        serviceMap[l.service] = { count: 0, value: 0 };
      }
      serviceMap[l.service].count += 1;
      serviceMap[l.service].value += l.budget;
    });

    return Object.keys(serviceMap).map((key) => ({
      service: key.split(" ")[0], // short name
      leadsCount: serviceMap[key].count,
      pipelineValue: serviceMap[key].value
    }));
  }, [leads]);

  // Filtered Leads list
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch = 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.businessName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority = priorityFilter === "All" || l.leadPriority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [leads, searchTerm, priorityFilter]);

  const handleToggleExpand = (id: string) => {
    setExpandedLeadId(expandedLeadId === id ? null : id);
  };

  // WhatsApp instant action generator
  const handleTriggerWhatsApp = (lead: Lead) => {
    let text = "";
    if (lead.leadPriority === "Hot") {
      text = `Hello ${lead.name}, thank you for your inquiry about ${lead.service} with PCS Consultancy. I want to book your priority corporate consultation.`;
    } else if (lead.leadPriority === "Warm") {
      text = `Hello ${lead.name}, let's talk about your project plans for ${lead.service} with PCS Consultancy.`;
    } else {
      text = `Hello ${lead.name}, thank you for reaching out. Here is more information on ${lead.service}.`;
    }
    const cleanMobile = lead.mobile.replace(/[^0-9]/g, "");
    const link = `https://wa.me/${cleanMobile || "919330457995"}?text=${encodeURIComponent(text)}`;
    window.open(link, "_blank");
  };

  return (
    <div className="space-y-8" id="analytics-container">
      
      {/* EXECUTIVE MINI-KPI METRIC PULSE */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Real-time Funnel KPIs
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5" id="mini-kpi-row">
          {/* Total Leads */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-purple-500/25 transition-all flex items-center justify-between shadow-sm hover:bg-slate-900/60">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Leads</span>
              <p className="text-xl font-black text-white">{stats.total}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          {/* Hot Leads */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-purple-500/25 transition-all flex items-center justify-between shadow-sm hover:bg-slate-900/60">
            <div className="space-y-1">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Hot Leads</span>
              <p className="text-xl font-black text-purple-300">{stats.hot}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Warm Leads */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-purple-500/25 transition-all flex items-center justify-between shadow-sm hover:bg-slate-900/60">
            <div className="space-y-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Warm Leads</span>
              <p className="text-xl font-black text-amber-300">{stats.warm}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          {/* Cold Leads */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-purple-500/25 transition-all flex items-center justify-between shadow-sm hover:bg-slate-900/60">
            <div className="space-y-1">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Cold Leads</span>
              <p className="text-xl font-black text-blue-300">{stats.cold}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-blue-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>

          {/* Follow-up Due */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-purple-500/25 transition-all flex items-center justify-between shadow-sm hover:bg-slate-900/60 col-span-2 sm:col-span-1">
            <div className="space-y-1">
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Follow-up Due</span>
              <p className="text-xl font-black text-red-400">{stats.followUpsDue}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-850 text-red-400">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      
      {/* 1. EXECUTIVE BENTO STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-bento-grid">
        
        {/* Total Leads */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-3 shadow-md relative overflow-hidden">
          <div className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Prospects</span>
          <p className="text-3xl font-black text-white">{stats.total}</p>
          <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            Active system databases
          </div>
        </div>

        {/* Lead priorities breakout */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-3 shadow-md relative overflow-hidden">
          <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">Hot Deals / Quality</span>
          <p className="text-3xl font-black text-white">
            {stats.hot} <span className="text-sm font-semibold text-gray-500">/ {stats.warm}W</span>
          </p>
          <div className="text-[10px] text-purple-300 font-medium flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-md w-fit border border-purple-500/20">
            <Sparkles className="w-3 h-3 text-purple-400" />
            PCS AI Engine Active: {stats.hot}
          </div>
        </div>

        {/* Pipeline values */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-3 shadow-md relative overflow-hidden">
          <div className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Pipeline Valuation</span>
          <p className="text-2xl font-black text-white">₹{stats.totalPipeline.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-gray-400 font-medium">
            Weighted Potential: <span className="text-emerald-400 font-bold">₹{Math.round(stats.weightedPotential).toLocaleString("en-IN")}</span>
          </p>
        </div>

        {/* Follow Ups Due */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-3 shadow-md relative overflow-hidden">
          <div className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Follow-Ups Pending</span>
          <p className="text-3xl font-black text-amber-400">{stats.followUpsDue}</p>
          <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            1-3 Day urgency SLAs
          </div>
        </div>

      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="charts-container">
        
        {/* Left: Lead Distribution Priority (Pie Chart) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quality Breakdown</h3>
          <p className="text-xs text-gray-400">Relative allocation of prospects in lead funnel database.</p>
          
          <div className="h-44 flex items-center justify-center">
            {stats.total === 0 ? (
              <p className="text-xs text-gray-500">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "#0b0f19", border: "1px solid #1f2937", borderRadius: "10px" }}
                    itemStyle={{ color: "#ffffff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex justify-around text-xs pt-2">
            {priorityChartData.map((item, idx) => (
              <div key={idx} className="text-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400">{item.name}</span>
                <p className="text-sm font-bold text-white mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Solutions Pipeline Values (Area/Bar Chart) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Solutions Pipeline Chart</h3>
              <p className="text-xs text-gray-400">Total pipeline value (INR) structured across targeted solutions.</p>
            </div>
            <button 
              onClick={onResetLeads}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-850 hover:bg-slate-900 text-gray-300 font-bold tracking-wide rounded-xl flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo Leads
            </button>
          </div>

          <div className="h-48">
            {stats.total === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={serviceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="service" stroke="#4b5563" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: "#0b0f19", border: "1px solid #1f2937", borderRadius: "10px" }}
                    labelStyle={{ color: "#a78bfa", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="pipelineValue" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" name="Budget (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 3. LEADS MANAGEMENT TABLE */}
      <div className="glass-panel rounded-2xl p-6 space-y-6" id="lead-management-table">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Prospect Ledger Database
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Filter, search, audit and trigger instantaneous client follow-ups.</p>
          </div>

          {/* Table Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 text-white transition-colors outline-none focus:border-indigo-500"
              />
            </div>

            {/* Segment Selector Buttons */}
            <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1">
              {(["All", "Hot", "Warm", "Cold"] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => setPriorityFilter(priority)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    priorityFilter === priority
                      ? "bg-slate-900 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger list */}
        {filteredLeads.length === 0 ? (
          <div className="p-16 text-center border border-slate-800 border-dashed rounded-xl text-gray-500">
            <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="font-bold text-sm text-gray-300">No results match currently</p>
            <p className="text-xs text-gray-500 mt-1">Try modifying your search text or priority filter level.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/45">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-gray-400 text-[10px] uppercase font-extrabold tracking-wider border-b border-slate-850">
                  <th className="py-4 px-5">Prospect Details</th>
                  <th className="py-4 px-5">Target Solution</th>
                  <th className="py-4 px-5">Budget (INR)</th>
                  <th className="py-4 px-5 text-center">Score / Priority</th>
                  <th className="py-4 px-5">SLA Timeline</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80 text-xs">
                {filteredLeads.map((lead) => {
                  const isExpanded = expandedLeadId === lead.id;
                  
                  return (
                    <React.Fragment key={lead.id}>
                      <tr className="hover:bg-slate-900/40 transition-colors group">
                        {/* Prospect Details */}
                        <td className="py-4 px-5">
                          <div className="space-y-1">
                            <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{lead.name}</p>
                            <p className="text-[10px] text-gray-500 font-medium">
                              {lead.businessName !== "Not specified" ? lead.businessName : "Private Individual"}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono select-all">{lead.email}</p>
                          </div>
                        </td>

                        {/* Targeted solution */}
                        <td className="py-4 px-5 font-semibold text-gray-200">
                          {lead.service}
                        </td>

                        {/* Estimated Budget */}
                        <td className="py-4 px-5 font-mono font-bold text-emerald-400">
                          ₹{lead.budget.toLocaleString("en-IN")}
                        </td>

                        {/* Priority assessment score */}
                        <td className="py-4 px-5">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[9px] uppercase tracking-wider ${
                              lead.leadPriority === "Hot"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : (lead.leadPriority === "Warm" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20")
                            }`}>
                              {lead.leadPriority} ({lead.leadScore})
                            </span>
                            <span className="text-[9px] text-gray-500 font-bold">Prob: {lead.conversionProbability}%</span>
                          </div>
                        </td>

                        {/* SLA Follow Up Timeline */}
                        <td className="py-4 px-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <Calendar className="w-3.5 h-3.5 text-gray-500" />
                              <span className="font-medium font-mono">{lead.followUpDate}</span>
                            </div>
                            <p className="text-[9px] text-gray-500 font-bold uppercase">
                              {lead.leadPriority === "Hot" ? "1-Day SLA Target" : (lead.leadPriority === "Warm" ? "3-Day Standard" : "7-Day Nurture")}
                            </p>
                          </div>
                        </td>

                        {/* WhatsApp Status Toggle */}
                        <td className="py-4 px-5">
                          <button
                            onClick={() => onUpdateStatus(lead.id, lead.whatsappStatus === "Pending" ? "Contacted" : "Pending")}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                              lead.whatsappStatus === "Contacted"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {lead.whatsappStatus === "Contacted" ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                Contacted
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                                Pending
                              </>
                            )}
                          </button>
                        </td>

                        {/* Inline controls */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleExpand(lead.id)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500 text-gray-300 hover:text-white transition-all"
                              title="Audit details and AI output"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            
                            <button
                              onClick={() => handleTriggerWhatsApp(lead)}
                              className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/50 hover:border-emerald-500 text-emerald-400 transition-all"
                              title="Interact on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDeleteLead(lead.id)}
                              className="p-1.5 rounded-lg bg-red-950/40 border border-red-900/40 hover:border-red-500 text-red-400 transition-all"
                              title="Expunge entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDED VIEW AREA FOR AI INTEL */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80">
                          <td colSpan={7} className="py-5 px-6 border-b border-slate-850">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Left Panel: Customer Query Description */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Prospect Request Statement</h4>
                                <p className="text-gray-300 bg-slate-900/50 p-3 rounded-lg border border-slate-850 text-xs italic leading-relaxed">
                                  "{lead.message || "No statement specified"}"
                                </p>
                                <div className="text-[10px] text-gray-500 font-medium">
                                  Contact Phone Number: <span className="text-gray-300 font-mono select-all">{lead.mobile}</span>
                                </div>
                              </div>

                              {/* Center Panel: Tactical opportunity synthesis */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Core Business Opportunity
                                </h4>
                                <p className="text-gray-200 text-xs leading-relaxed font-medium">
                                  {lead.businessOpportunity}
                                </p>
                                <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300">
                                  <span className="font-bold">Next Action Strategy: </span>
                                  {lead.recommendedAction}
                                </div>
                              </div>

                              {/* Right Panel: AI Assessment Details */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Engine Synthesis (Max 20 words)</h4>
                                <p className="text-gray-300 text-xs leading-relaxed">
                                  {lead.aiAnalysis}
                                </p>
                                <div className="pt-2 border-t border-slate-850 text-[10px] text-gray-500 flex justify-between">
                                  <span>Source: {lead.leadSource}</span>
                                  <span>Time: {new Date(lead.dateTime).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
