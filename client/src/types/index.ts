export interface Provider {
  id: string;
  name: string;
  specialty: string;
  npi: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  license: {
    number: string;
    state: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'pending';
  };
  networks: string[];
  lastValidated: string;
  confidenceScore: number;
  status: 'validated' | 'pending' | 'flagged' | 'outdated';
  validationDetails: ValidationDetail[];
}

export interface ValidationDetail {
  field: string;
  source: string;
  value: string;
  confidence: number;
  lastChecked: string;
  status: 'confirmed' | 'conflicting' | 'missing';
}

export interface ValidationRun {
  id: string;
  startTime: string;
  endTime: string;
  totalProviders: number;
  validated: number;
  flagged: number;
  failed: number;
  status: 'running' | 'completed' | 'failed';
  agents: AgentActivity[];
}

export interface AgentActivity {
  name: string;
  type: 'validator' | 'enrichment' | 'qa';
  tasksCompleted: number;
  tasksTotal: number;
  status: 'active' | 'idle' | 'error';
  currentTask?: string;
}

export interface DashboardStats {
  totalProviders: number;
  validatedToday: number;
  pendingReview: number;
  averageConfidence: number;
  accuracyRate: number;
  processingSpeed: number;
}

export interface QueueItem {
  id: string;
  providerId: string;
  providerName: string;
  priority: 'high' | 'medium' | 'low';
  issueType: string;
  issueDescription: string;
  createdAt: string;
  assignedTo?: string;
}

