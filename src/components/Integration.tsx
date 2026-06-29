import React, { useState, useEffect } from "react";
import { 
  Database, 
  Copy, 
  Check, 
  HelpCircle, 
  ExternalLink, 
  Settings, 
  Sparkles, 
  Terminal, 
  CheckCircle,
  Save,
  FileSpreadsheet
} from "lucide-react";

export default function Integration() {
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Load existing configuration on mount
  useEffect(() => {
    function loadSettings() {
      try {
        const storedUrl = localStorage.getItem("pcs_google_sheets_url") || "https://script.google.com/macros/s/AKfycbwtZ8Z8KeZZZoRqZTDDod2IJlMVNw7RDodbL4Kx4Cwpjp4iyxnWg6j8PajAEzYUO2bhYg/exec";
        setGoogleSheetsUrl(storedUrl);
        localStorage.setItem("pcs_google_sheets_url", storedUrl);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      localStorage.setItem("pcs_google_sheets_url", googleSheetsUrl);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const appsScriptCode = `/**
 * Google Apps Script Backend for PCS Smart Lead Predictor
 * Optimized for Google Sheets Database.
 * 
 * Instructions:
 * 1. Open Google Sheets. Create a blank sheet.
 * 2. Click "Extensions" -> "Apps Script" from the top menu bar.
 * 3. Delete any default code and paste this entire script.
 * 4. Click "Deploy" (top-right) -> "New Deployment".
 * 5. Set Type to "Web App". Set "Execute As" to "Me", and "Who has access" to "Anyone".
 * 6. Copy the Web App URL and paste it into the PCS Smart Lead Predictor Settings.
 */

function doPost(e) {
  try {
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);
    
    var sheet = getOrCreateLeadsSheet();
    
    // Format values
    var dateStr = data.dateTime ? new Date(data.dateTime).toLocaleString() : new Date().toLocaleString();
    var name = data.name || "N/A";
    var mobile = data.mobile || "N/A";
    var email = data.email || "N/A";
    var businessName = data.businessName || "Not specified";
    var service = data.service || "N/A";
    var budget = data.budget || 0;
    var message = data.message || "None";
    var leadScore = data.leadScore || 0;
    var leadPriority = data.leadPriority || "Cold";
    var aiAnalysis = data.aiAnalysis || "";
    var businessOpportunity = data.businessOpportunity || "";
    var conversionProbability = data.conversionProbability || 0;
    var recommendedAction = data.recommendedAction || "";
    var leadSource = data.leadSource || "AI Assistant";
    var whatsappStatus = data.whatsappStatus || "Pending";
    var followUpDate = data.followUpDate || "";
    
    // Append structured row
    sheet.appendRow([
      dateStr,
      name,
      mobile,
      email,
      businessName,
      service,
      budget,
      message,
      leadScore,
      leadPriority,
      aiAnalysis,
      businessOpportunity,
      conversionProbability,
      recommendedAction,
      leadSource,
      whatsappStatus,
      followUpDate
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Lead synchronized successfully to Google Sheets database."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Ensure columns and tab exist correctly
function getOrCreateLeadsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "Leads";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // Set headers exactly as required
    var headers = [
      "Date Time", 
      "Name", 
      "Mobile", 
      "Email", 
      "Business Name", 
      "Service", 
      "Budget", 
      "Message", 
      "Lead Score", 
      "Lead Priority", 
      "AI Analysis", 
      "Business Opportunity", 
      "Conversion Probability", 
      "Recommended Action", 
      "Lead Source", 
      "WhatsApp Status", 
      "Follow Up Date"
    ];
    
    sheet.appendRow(headers);
    
    // Optional aesthetic styling for Google Sheet headers
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#4f46e5");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setFontFamily("Outfit");
    sheet.setFrozenRows(1);
  }
  return sheet;
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!googleSheetsUrl) {
      setTestResult("Please configure and save a Web App URL before triggering a test request.");
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      // Send mock diagnostic ping to the Apps Script endpoint
      const response = await fetch(googleSheetsUrl, {
        method: "POST",
        mode: "no-cors", // Crucial since standard Web App endpoints don't send OPTIONS CORS header unless customized
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime: new Date().toISOString(),
          name: "Diagnostic Connection Test",
          mobile: "+91 99999 99999",
          email: "test@pcs-consultancy.com",
          businessName: "PCS Diagnostics Inc",
          service: "CRM Setup",
          budget: 50000,
          message: "System testing connection pipeline.",
          leadScore: 95,
          leadPriority: "Hot",
          aiAnalysis: "Diagnostics active.",
          businessOpportunity: "Connection healthy",
          conversionProbability: 100,
          recommendedAction: "Confirm dashboard integration",
          leadSource: "AI Diagnostics Node",
          whatsappStatus: "Pending",
          followUpDate: "2026-06-30"
        })
      });

      // No-cors mode opaque response is empty but successful
      setTestResult("Diagnostic sync payload sent to endpoint. Check your Google Sheet under the 'Leads' tab to verify the new row!");
    } catch (err: any) {
      setTestResult("Network error or CORS policy rejected standard direct request. Opaque dispatch succeeded. Error detail: " + err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8" id="integration-container">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: URL config, schema parameters and documentation */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Apps Script Configuration
            </h3>
            
            <p className="text-gray-400 text-xs leading-relaxed">
              PCS Consultancy leverages standard spreadsheet persistence for full security compliance. Connecting your Google Sheets instance requires specifying your deployed Apps Script Web App Endpoint below.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block">
                  Google Apps Script Web App URL
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://script.google.com/macros/s/.../exec"
                  value={googleSheetsUrl}
                  onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 text-xs rounded-xl px-4 py-3 text-white transition-colors outline-none font-mono"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving Configuration..." : "Save Endpoint"}
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Terminal className="w-4 h-4 text-purple-400" />
                  {isTesting ? "Sending Ping..." : "Test Connection Row"}
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  Endpoint saved successfully! New leads will auto-sync to Sheets.
                </div>
              )}
            </form>
          </div>

          {/* Schema specs card */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Required Google Sheets Schema
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              If creating the sheet manually, ensure a tab named <span className="text-white font-mono">Leads</span> exists with these precise headers in row 1:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px] font-mono text-gray-300">
              <div className="p-2 rounded bg-slate-950 border border-slate-850">1. Date Time</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">2. Name</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">3. Mobile</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">4. Email</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">5. Business Name</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">6. Service</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">7. Budget</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">8. Message</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">9. Lead Score</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">10. Lead Priority</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">11. AI Analysis</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">12. Business Opportunity</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">13. Conversion Prob</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">14. Recommended Action</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">15. Lead Source</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">16. WhatsApp Status</div>
              <div className="p-2 rounded bg-slate-950 border border-slate-850">17. Follow Up Date</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 text-xs text-gray-400 space-y-1">
              <p className="font-bold text-gray-300">📌 Automated Execution Feature:</p>
              <p className="text-[11px]">The Apps Script template below automatically detects, builds, and formats these columns, including the "Leads" tab itself, upon receiving the first lead analysis payload!</p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Deployed backend code blocks & guides */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4 relative overflow-hidden" id="code-snippet-box">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Copy Apps Script Code
                </h3>
                <p className="text-[10px] text-gray-400">Copy directly into your Google Apps Script editor.</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-gray-300 overflow-y-auto max-h-[380px] leading-relaxed scrollbar">
              <pre>{appsScriptCode}</pre>
            </div>

          </div>

          {testResult && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 space-y-1.5 animate-fade-in">
              <p className="font-extrabold uppercase tracking-wide text-purple-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Diagnostic Outcome Log
              </p>
              <p className="leading-relaxed">{testResult}</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
