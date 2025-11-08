import type { Provider, ValidationRun, DashboardStats, QueueItem } from '../types';

export const mockProviders: Provider[] = [
  {
    id: 'PRV001',
    name: 'Dr. Sarah Mitchell',
    specialty: 'Cardiology',
    npi: '1234567890',
    phone: '(555) 123-4567',
    email: 'sarah.mitchell@healthcare.com',
    address: {
      street: '450 Medical Plaza Dr',
      city: 'Boston',
      state: 'MA',
      zip: '02115'
    },
    license: {
      number: 'MD-245789',
      state: 'MA',
      expiryDate: '2026-08-15',
      status: 'active'
    },
    networks: ['Blue Cross', 'Aetna', 'UnitedHealthcare'],
    lastValidated: '2025-10-28T14:30:00Z',
    confidenceScore: 0.96,
    status: 'validated',
    validationDetails: [
      { field: 'Phone', source: 'Google Business', value: '(555) 123-4567', confidence: 0.98, lastChecked: '2025-10-28T14:30:00Z', status: 'confirmed' },
      { field: 'Address', source: 'NPI Registry', value: '450 Medical Plaza Dr', confidence: 0.95, lastChecked: '2025-10-28T14:30:00Z', status: 'confirmed' },
      { field: 'License', source: 'State Board', value: 'MD-245789', confidence: 1.0, lastChecked: '2025-10-28T14:30:00Z', status: 'confirmed' }
    ]
  },
  {
    id: 'PRV002',
    name: 'Dr. James Chen',
    specialty: 'Orthopedic Surgery',
    npi: '9876543210',
    phone: '(555) 234-5678',
    email: 'james.chen@orthocenter.com',
    address: {
      street: '1200 Summit Medical Center',
      city: 'Seattle',
      state: 'WA',
      zip: '98101'
    },
    license: {
      number: 'WA-876543',
      state: 'WA',
      expiryDate: '2025-12-31',
      status: 'active'
    },
    networks: ['Aetna', 'Cigna', 'Kaiser Permanente'],
    lastValidated: '2025-10-27T09:15:00Z',
    confidenceScore: 0.88,
    status: 'validated',
    validationDetails: [
      { field: 'Phone', source: 'Provider Website', value: '(555) 234-5678', confidence: 0.92, lastChecked: '2025-10-27T09:15:00Z', status: 'confirmed' },
      { field: 'Email', source: 'NPI Registry', value: 'james.chen@orthocenter.com', confidence: 0.85, lastChecked: '2025-10-27T09:15:00Z', status: 'confirmed' },
      { field: 'Networks', source: 'Insurance Database', value: 'Multiple', confidence: 0.87, lastChecked: '2025-10-27T09:15:00Z', status: 'confirmed' }
    ]
  },
  {
    id: 'PRV003',
    name: 'Dr. Maria Rodriguez',
    specialty: 'Pediatrics',
    npi: '5647382910',
    phone: '(555) 345-6789',
    email: 'maria.rodriguez@childcare.org',
    address: {
      street: '789 Children\'s Way',
      city: 'Austin',
      state: 'TX',
      zip: '78701'
    },
    license: {
      number: 'TX-567234',
      state: 'TX',
      expiryDate: '2027-03-20',
      status: 'active'
    },
    networks: ['Blue Cross', 'Humana', 'Medicaid'],
    lastValidated: '2025-10-25T16:45:00Z',
    confidenceScore: 0.72,
    status: 'pending',
    validationDetails: [
      { field: 'Phone', source: 'Google Business', value: '(555) 345-6789', confidence: 0.65, lastChecked: '2025-10-25T16:45:00Z', status: 'conflicting' },
      { field: 'Address', source: 'NPI Registry', value: '789 Children\'s Way', confidence: 0.78, lastChecked: '2025-10-25T16:45:00Z', status: 'confirmed' },
      { field: 'Email', source: 'Provider Website', value: 'maria.rodriguez@childcare.org', confidence: 0.73, lastChecked: '2025-10-25T16:45:00Z', status: 'confirmed' }
    ]
  },
  {
    id: 'PRV004',
    name: 'Dr. Robert Williams',
    specialty: 'Internal Medicine',
    npi: '3456789012',
    phone: '(555) 456-7890',
    email: 'r.williams@primarycare.net',
    address: {
      street: '2500 Healthcare Blvd',
      city: 'Chicago',
      state: 'IL',
      zip: '60601'
    },
    license: {
      number: 'IL-789456',
      state: 'IL',
      expiryDate: '2026-06-10',
      status: 'active'
    },
    networks: ['UnitedHealthcare', 'Blue Cross', 'Aetna'],
    lastValidated: '2025-10-20T11:20:00Z',
    confidenceScore: 0.54,
    status: 'flagged',
    validationDetails: [
      { field: 'Phone', source: 'Multiple Sources', value: 'Conflicting', confidence: 0.42, lastChecked: '2025-10-20T11:20:00Z', status: 'conflicting' },
      { field: 'Address', source: 'NPI Registry', value: '2500 Healthcare Blvd', confidence: 0.68, lastChecked: '2025-10-20T11:20:00Z', status: 'confirmed' },
      { field: 'Networks', source: 'Insurance Database', value: 'Incomplete', confidence: 0.52, lastChecked: '2025-10-20T11:20:00Z', status: 'missing' }
    ]
  },
  {
    id: 'PRV005',
    name: 'Dr. Emily Thompson',
    specialty: 'Dermatology',
    npi: '7890123456',
    phone: '(555) 567-8901',
    email: 'emily.thompson@skinhealth.com',
    address: {
      street: '3300 Dermatology Center',
      city: 'Miami',
      state: 'FL',
      zip: '33101'
    },
    license: {
      number: 'FL-234567',
      state: 'FL',
      expiryDate: '2025-11-30',
      status: 'active'
    },
    networks: ['Cigna', 'Humana'],
    lastValidated: '2025-10-29T08:00:00Z',
    confidenceScore: 0.94,
    status: 'validated',
    validationDetails: [
      { field: 'Phone', source: 'Provider Website', value: '(555) 567-8901', confidence: 0.96, lastChecked: '2025-10-29T08:00:00Z', status: 'confirmed' },
      { field: 'License', source: 'State Board', value: 'FL-234567', confidence: 0.99, lastChecked: '2025-10-29T08:00:00Z', status: 'confirmed' },
      { field: 'Email', source: 'NPI Registry', value: 'emily.thompson@skinhealth.com', confidence: 0.88, lastChecked: '2025-10-29T08:00:00Z', status: 'confirmed' }
    ]
  },
  {
    id: 'PRV006',
    name: 'Dr. Michael Patel',
    specialty: 'Neurology',
    npi: '2345678901',
    phone: '(555) 678-9012',
    email: 'michael.patel@neurocare.org',
    address: {
      street: '5000 Brain Institute',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102'
    },
    license: {
      number: 'CA-890123',
      state: 'CA',
      expiryDate: '2028-01-15',
      status: 'active'
    },
    networks: ['Kaiser Permanente', 'Blue Shield', 'Aetna'],
    lastValidated: '2025-10-15T13:30:00Z',
    confidenceScore: 0.45,
    status: 'outdated',
    validationDetails: [
      { field: 'Phone', source: 'Old Records', value: '(555) 678-9012', confidence: 0.38, lastChecked: '2025-10-15T13:30:00Z', status: 'conflicting' },
      { field: 'Address', source: 'NPI Registry', value: '5000 Brain Institute', confidence: 0.52, lastChecked: '2025-10-15T13:30:00Z', status: 'conflicting' },
      { field: 'Email', source: 'Unknown', value: 'N/A', confidence: 0.45, lastChecked: '2025-10-15T13:30:00Z', status: 'missing' }
    ]
  }
];

export const mockValidationRun: ValidationRun = {
  id: 'RUN-20251029-001',
  startTime: '2025-10-29T08:00:00Z',
  endTime: '2025-10-29T08:27:34Z',
  totalProviders: 200,
  validated: 168,
  flagged: 24,
  failed: 8,
  status: 'completed',
  agents: [
    {
      name: 'Validator Agent',
      type: 'validator',
      tasksCompleted: 200,
      tasksTotal: 200,
      status: 'idle',
      currentTask: undefined
    },
    {
      name: 'Enrichment Agent',
      type: 'enrichment',
      tasksCompleted: 156,
      tasksTotal: 200,
      status: 'active',
      currentTask: 'Enriching provider PRV-145 data from public sources'
    },
    {
      name: 'QA Agent',
      type: 'qa',
      tasksCompleted: 184,
      tasksTotal: 200,
      status: 'active',
      currentTask: 'Cross-referencing provider PRV-178 credentials'
    }
  ]
};

export const mockDashboardStats: DashboardStats = {
  totalProviders: 2847,
  validatedToday: 168,
  pendingReview: 24,
  averageConfidence: 0.87,
  accuracyRate: 0.94,
  processingSpeed: 7.3
};

export const mockQueueItems: QueueItem[] = [
  {
    id: 'Q001',
    providerId: 'PRV004',
    providerName: 'Dr. Robert Williams',
    priority: 'high',
    issueType: 'Phone Number Conflict',
    issueDescription: 'Multiple sources report different phone numbers. NPI Registry shows (555) 456-7890, but Google Business lists (555) 456-7899.',
    createdAt: '2025-10-29T07:15:00Z',
    assignedTo: 'Sarah Johnson'
  },
  {
    id: 'Q002',
    providerId: 'PRV003',
    providerName: 'Dr. Maria Rodriguez',
    priority: 'medium',
    issueType: 'Network Affiliation Incomplete',
    issueDescription: 'Provider has incomplete network information. Only 2 of 5 known networks are listed in the directory.',
    createdAt: '2025-10-29T06:45:00Z',
    assignedTo: undefined
  },
  {
    id: 'Q003',
    providerId: 'PRV006',
    providerName: 'Dr. Michael Patel',
    priority: 'high',
    issueType: 'Address Outdated',
    issueDescription: 'Provider address has not been validated in 14 days. Possible relocation detected via public records.',
    createdAt: '2025-10-29T05:30:00Z',
    assignedTo: 'John Smith'
  },
  {
    id: 'Q004',
    providerId: 'PRV012',
    providerName: 'Dr. Jennifer Lee',
    priority: 'low',
    issueType: 'Email Verification Needed',
    issueDescription: 'Email address bounced during automated verification. Manual confirmation required.',
    createdAt: '2025-10-28T18:20:00Z',
    assignedTo: undefined
  },
  {
    id: 'Q005',
    providerId: 'PRV018',
    providerName: 'Dr. David Kumar',
    priority: 'medium',
    issueType: 'License Expiring Soon',
    issueDescription: 'Medical license expires in 45 days. Renewal status needs verification.',
    createdAt: '2025-10-28T15:10:00Z',
    assignedTo: 'Sarah Johnson'
  }
];

