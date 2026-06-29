import React from "react";
import { Phone, Mail, MapPin, Globe, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md py-12 px-6" id="app-footer">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Branding Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              PCS Consultancy
            </span>
            <span className="text-[10px] bg-purple-500/15 text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-500/25">
              MSME Registered
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            Providing high-performance web platforms, enterprise CRM workflow automations, financial growth consulting, and cutting-edge predictive scoring engines.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>ISO Compliant Lead Processing Engines</span>
          </div>
        </div>

        {/* Directory details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Contact Details</h4>
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <a href="tel:+919330457995" className="hover:text-white transition-colors">
                +91 93304 57995
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <a href="mailto:pcschairman53@gmail.com" className="hover:text-white transition-colors">
                pcschairman53@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span className="leading-tight">
                40A/K.C.C Mitra Street, Belgharia, Kolkata-700056
              </span>
            </li>
          </ul>
        </div>

        {/* Action Link Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Useful Resources</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li>
              <a 
                href="https://pcs-consultancy.netlify.app" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-white hover:underline flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                Official Business Website
              </a>
            </li>
            <li>
              <a 
                href="https://maps.google.com/?q=40A/K.C.C+Mitra+Street,+Belgharia,+Kolkata-700056" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-white hover:underline"
              >
                HQ Location Google Maps
              </a>
            </li>
            <li className="text-[10px] text-gray-500 pt-2 font-mono">
              Designed & Engineered for PCS Consultancy Ltd.
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500 font-medium">
        <p>© {currentYear} PCS Consultancy. All Rights Reserved.</p>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <span>Enterprise Edition v2.5</span>
          <span>•</span>
          <span>Kolkata, West Bengal, India</span>
        </div>
      </div>
    </footer>
  );
}
