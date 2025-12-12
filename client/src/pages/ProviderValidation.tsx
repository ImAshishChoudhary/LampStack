import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Provider {
  id: string;
  npiNumber: string;
  firstName: string;
  lastName: string;
  specialties: string[];
  city: string | null;
  state: string | null;
  overallConfidence: number | null;
  lastValidated: string | null;
}

interface ValidationSource {
  name: string;
  confidence: number;
  discrepancies: string[];
}

interface ValidationResult {
  providerId: string;
  overallConfidence: number;
  status: 'high' | 'medium' | 'low' | 'critical';
  sources: ValidationSource[];
  consensusData?: any;
  recommendations: string[];
  autoCorrect: boolean;
  suggestedChanges: any;
  isValid?: boolean;
  confidence?: number;
  matchedFields?: {
    name: boolean;
    address: boolean;
    phone: boolean;
    specialty: boolean;
    license: boolean;
  };
  discrepancies?: string[];
  npiData?: {
    firstName: string;
    lastName: string;
    address?: {
      city: string;
      state: string;
      zipCode: string;
    };
    specialty?: {
      description: string;
    };
  };
}

export default function ProviderValidation() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isBatchValidating, setIsBatchValidating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    validated: 0,
    valid: 0,
    averageConfidence: 0,
  });

  useEffect(() => {
    loadProviders();
    loadStats();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await api.get<any>('/api/providers');
      setProviders(response.data?.providers || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get<any>('/api/validation/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const validateProvider = async (providerId: string) => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await api.post<any>(`/api/validation/${providerId}`);
      setValidationResult(response.data?.validation);
      await loadProviders();
      await loadStats();
    } catch (error) {
      console.error('Validation failed:', error);
      alert('Failed to validate provider. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const validateAllProviders = async () => {
    if (!confirm('This will validate up to 50 providers. Continue?')) {
      return;
    }

    setIsBatchValidating(true);

    try {
      const response = await api.post<any>('/api/validation/batch');
      alert(
        `Batch validation completed!\n\nTotal: ${response.data?.summary?.total}\nSuccessful: ${response.data?.summary?.successful}\nFailed: ${response.data?.summary?.failed}`
      );
      await loadProviders();
      await loadStats();
    } catch (error) {
      console.error('Batch validation failed:', error);
      alert('Batch validation failed. Please try again.');
    } finally {
      setIsBatchValidating(false);
    }
  };

  const getConfidenceColor = (confidence: number | null) => {
    if (confidence === null) return 'bg-gray-100 text-gray-600';
    if (confidence >= 0.8) return 'bg-green-100 text-green-700';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getMatchIcon = (matched: boolean) => {
    return matched ? (
      <span className="text-green-600">✓</span>
    ) : (
      <span className="text-red-600">✗</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Provider Validation
        </h1>
        <p className="text-gray-600">
          Validate provider data against the CMS NPI Registry
        </p>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Providers</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Validated</div>
          <div className="text-3xl font-bold text-cyan-600">{stats.validated}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Valid</div>
          <div className="text-3xl font-bold text-green-600">{stats.valid}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Avg Confidence</div>
          <div className="text-3xl font-bold text-purple-600">
            {(stats.averageConfidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {providers.length} providers loaded
        </div>
        <button
          onClick={validateAllProviders}
          disabled={isBatchValidating}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isBatchValidating ? 'Validating...' : 'Validate All (Batch)'}
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Providers</h2>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedProvider === provider.id ? 'bg-cyan-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      {provider.firstName} {provider.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      NPI: {provider.npiNumber}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(
                      provider.overallConfidence
                    )}`}
                  >
                    {provider.overallConfidence !== null
                      ? `${(provider.overallConfidence * 100).toFixed(0)}%`
                      : 'Not validated'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {provider.specialties.join(', ')}
                </div>
                {provider.city && provider.state && (
                  <div className="text-sm text-gray-500 mt-1">
                    {provider.city}, {provider.state}
                  </div>
                )}
                {selectedProvider === provider.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      validateProvider(provider.id);
                    }}
                    disabled={isValidating}
                    className="mt-3 w-full px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:bg-gray-300 text-sm"
                  >
                    {isValidating ? 'Validating...' : 'Validate with NPI Registry'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Validation Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Validation Results
            </h2>
          </div>
          <div className="p-4">
            {!validationResult ? (
              <div className="text-center py-12 text-gray-500">
                Select a provider and click "Validate" to see results
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      validationResult.isValid
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {validationResult.isValid ? 'Valid' : 'Invalid'}
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Confidence</div>
                    <div className="text-2xl font-bold text-cyan-600">
                      {((validationResult.confidence || validationResult.overallConfidence || 0) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Matched Fields */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Field Validation
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Name</span>
                      {getMatchIcon(validationResult.matchedFields?.name ?? false)}
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Address</span>
                      {getMatchIcon(validationResult.matchedFields?.address ?? false)}
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Phone</span>
                      {getMatchIcon(validationResult.matchedFields?.phone ?? false)}
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Specialty</span>
                      {getMatchIcon(validationResult.matchedFields?.specialty ?? false)}
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">License</span>
                      {getMatchIcon(validationResult.matchedFields?.license ?? false)}
                    </div>
                  </div>
                </div>

                {/* Discrepancies */}
                {(validationResult.discrepancies?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Discrepancies
                    </h3>
                    <div className="space-y-2">
                      {validationResult.discrepancies?.map((disc: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
                        >
                          {disc}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NPI Registry Data */}
                {validationResult.npiData && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      NPI Registry Data
                    </h3>
                    <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                      <div>
                        <span className="text-gray-600">Name: </span>
                        <span className="text-gray-900">
                          {validationResult.npiData.firstName}{' '}
                          {validationResult.npiData.lastName}
                        </span>
                      </div>
                      {validationResult.npiData.address && (
                        <div>
                          <span className="text-gray-600">Address: </span>
                          <span className="text-gray-900">
                            {validationResult.npiData.address.city},{' '}
                            {validationResult.npiData.address.state}{' '}
                            {validationResult.npiData.address.zipCode}
                          </span>
                        </div>
                      )}
                      {validationResult.npiData.specialty && (
                        <div>
                          <span className="text-gray-600">Specialty: </span>
                          <span className="text-gray-900">
                            {validationResult.npiData.specialty.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
