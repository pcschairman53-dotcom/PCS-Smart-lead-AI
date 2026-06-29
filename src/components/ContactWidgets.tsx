import React, { useState } from "react";
import { Phone, Mail, MessageCircle, MapPin, Sparkles, X, HeartHandshake } from "lucide-react";

export default function ContactWidgets() {
  const [isOpen, setIsOpen] = useState(false);

  const phoneUrl = "tel:+919330457995";
  const emailUrl = "mailto:pcschairman53@gmail.com?subject=Inquiry%20from%20Smart%20Lead%20Predictor&body=Hello%20PCS%20Consultancy%2C%0A%0AI%20am%20interested%20in%20your%20services.%20Please%20get%20in%20touch.";
  const whatsappUrl = "https://wa.me/919330457995?text=Hello%20PCS%20Consultancy%2C%20I%20am%20interested%20in%20your%20services.";
  const mapsUrl = "https://maps.google.com/?q=40A/K.C.C+Mitra+Street,+Belgharia,+Kolkata-700056";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" id="floating-contact-panel">
      {/* Expanded Actions Stack */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 animate-fade-in">
          {/* 1. Click to Call */}
          <a
            href={phoneUrl}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-gray-200 hover:text-white transition-all shadow-lg hover:scale-105"
            title="Call +91 93304 57995"
          >
            <span>Call Hotline</span>
            <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400">
              <Phone className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* 2. Direct Email */}
          <a
            href={emailUrl}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-gray-200 hover:text-white transition-all shadow-lg hover:scale-105"
            title="Email pcschairman53@gmail.com"
          >
            <span>Email Office</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Mail className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* 3. WhatsApp Direct Chat */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-gray-200 hover:text-white transition-all shadow-lg hover:scale-105"
            title="Interact via WhatsApp"
          >
            <span className="text-emerald-400 font-extrabold">WhatsApp Team</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* 4. Google Maps GPS Navigation */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-gray-200 hover:text-white transition-all shadow-lg hover:scale-105"
            title="Kolkata Office Location"
          >
            <span>Google Maps</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </a>
        </div>
      )}

      {/* Main trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 transition-all duration-300 hover:scale-110 relative"
        id="widgets-trigger-button"
        title="Direct Action Panel"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            <HeartHandshake className="w-5 h-5 text-white" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-ping" />
          </>
        )}
      </button>
    </div>
  );
}
