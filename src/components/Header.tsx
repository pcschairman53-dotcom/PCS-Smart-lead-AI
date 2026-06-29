import React from "react";
import { Brain, Database, ShieldAlert, Sparkles } from "lucide-react";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  geminiActive: boolean;
  sheetsActive: boolean;
}

export default function Header({ currentTab, setCurrentTab, geminiActive, sheetsActive }: HeaderProps) {
  const navItems = [
    { id: "landing", label: "Overview" },
    { id: "predictor", label: "AI Lead Predictor" },
    { id: "dashboard", label: "Executive Analytics" },
    { id: "integration", label: "Google Sheets Sync" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-gray-800 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" id="app-header">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-indigo-500/30 shrink-0">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              PCS Smart Lead Predictor AI
            </span>
            <span className="text-[9px] sm:text-[10px] bg-indigo-500/15 text-indigo-400 font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-indigo-500/30 whitespace-nowrap">
              AI v2.5
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-purple-400 tracking-wider font-semibold uppercase">
            Powered by PCS AI Engine
          </p>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1 bg-slate-950/45 p-1 rounded-full border border-gray-800/60">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              currentTab === item.id
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* PCS AI Engine Active Status */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 border border-gray-800 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs">
          {geminiActive ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse shrink-0" />
              <span className="font-mono text-purple-300 font-semibold whitespace-nowrap">
                PCS AI Engine <span className="hidden xs:inline sm:inline">Active</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-mono text-amber-400 font-semibold whitespace-nowrap">
                Rule-Based <span className="hidden xs:inline sm:inline">AI</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            </>
          )}
        </div>

        {/* Google Sheets Active Status */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 border border-gray-800 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs">
          <Database className={`w-3.5 h-3.5 shrink-0 ${sheetsActive ? "text-emerald-400" : "text-gray-500"}`} />
          <span className={`font-mono font-semibold whitespace-nowrap ${sheetsActive ? "text-emerald-300" : "text-gray-400"}`}>
            {sheetsActive ? (
              <>Sheets: <span className="hidden xs:inline sm:inline">CONNECTED</span><span className="inline xs:hidden sm:hidden">LIVE</span></>
            ) : (
              <>Sheets: <span className="hidden xs:inline sm:inline">LOCAL</span><span className="inline xs:hidden sm:hidden">OFF</span></>
            )}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sheetsActive ? "bg-emerald-500 animate-pulse" : "bg-gray-500"}`} />
        </div>
      </div>
    </header>
  );
}
