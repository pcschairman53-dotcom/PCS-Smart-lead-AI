export interface Lead {
  id: string;
  dateTime: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  service: string;
  budget: number; // in INR
  message: string;
  leadScore: number;
  leadPriority: 'Hot' | 'Warm' | 'Cold';
  aiAnalysis: string;
  businessOpportunity: string;
  conversionProbability: number; // percentage (0-100)
  recommendedAction: string;
  followUpDate: string;
  leadSource: string; // e.g. "AI Assistant"
  whatsappStatus: 'Pending' | 'Contacted';
}

export interface ServiceInfo {
  name: string;
  description: string;
  baseScore: number;
  iconName: string;
}

export interface BusinessStats {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  totalPipelineValue: number; // Estimated budget sum
  conversionPotentialValue: number; // Weighted pipeline based on probability
  followUpsDue: number;
  avgScore: number;
}
