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
}

export default function MultiSourceValidation() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
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
    setShowApproval(false);

    try {
      const response = await api.post<any>(`/api/validation/${providerId}?multiSource=true`);
      setValidationResult(response.data?.validation);
      if (response.data?.validation?.suggestedChanges) {
        setShowApproval(true);
      }
      await loadProviders();
      await loadStats();
    } catch (error) {
      console.error('Validation failed:', error);
      alert('Failed to validate provider. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const applyCorrections = async () => {
    if (!validationResult || !validationResult.suggestedChanges) return;

    try {
      await api.post(`/api/validation/${validationResult.providerId}/apply`, {
        changes: validationResult.suggestedChanges,
        reason: 'Auto-correction from multi-source validation',
      });
      alert('Corrections applied successfully!');
      setShowApproval(false);
      await loadProviders();
    } catch (error) {
      console.error('Failed to apply corrections:', error);
      alert('Failed to apply corrections. Please try again.');
    }
  };

  const getConfidenceColor = (confidence: number | null) => {
    if (confidence === null) return 'bg-gray-100 text-gray-600';
    if (confidence >= 0.85) return 'bg-green-100 text-green-700';
    if (confidence >= 0.70) return 'bg-yellow-100 text-yellow-700';
    if (confidence >= 0.50) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      high: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Multi-Source Provider Validation
        </h1>
        <p className="text-gray-600">
          Validate providers using NPI Registry + Google Maps
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
          <div className="text-sm text-gray-600 mb-1">High Confidence</div>
          <div className="text-3xl font-bold text-green-600">{stats.valid}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Avg Confidence</div>
          <div className="text-3xl font-bold text-purple-600">
            {(stats.averageConfidence * 100).toFixed(0)}%
          </div>
        </div>
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
                {selectedProvider === provider.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      validateProvider(provider.id);
                    }}
                    disabled={isValidating}
                    className="mt-3 w-full px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:bg-gray-300 text-sm"
                  >
                    {isValidating ? 'Validating...' : 'Validate (Multi-Source)'}
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
          <div className="p-4 overflow-y-auto max-h-[600px]">
            {!validationResult ? (
              <div className="text-center py-12 text-gray-500">
                Select a provider and click "Validate" to see results
              </div>
            ) : (
              <div className="space-y-4">
                {/* Overall Status */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                      validationResult.status
                    )}`}
                  >
                    {validationResult.status.toUpperCase()}
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Overall Confidence</div>
                    <div className="text-2xl font-bold text-cyan-600">
                      {(validationResult.overallConfidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Sources */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Validation Sources
                  </h3>
                  <div className="space-y-2">
                    {validationResult.sources.map((source, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{source.name}</span>
                          <span className="text-sm text-cyan-600">
                            {(source.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        {source.discrepancies.length > 0 && (
                          <div className="text-xs text-gray-600 space-y-1">
                            {source.discrepancies.map((disc, i) => (
                              <div key={i}>• {disc}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {validationResult.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Recommendations
                    </h3>
                    <div className="space-y-2">
                      {validationResult.recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700"
                        >
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Consensus Data */}
                {validationResult.consensusData && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Consensus Data
                    </h3>
                    <div className="bg-gray-50 rounded p-3 text-sm space-y-2">
                      {validationResult.consensusData.name && (
                        <div>
                          <span className="text-gray-600">Name: </span>
                          <span className="text-gray-900">
                            {validationResult.consensusData.name.value}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({validationResult.consensusData.name.sources.join(', ')})
                          </span>
                        </div>
                      )}
                      {validationResult.consensusData.address && (
                        <div>
                          <span className="text-gray-600">Address: </span>
                          <span className="text-gray-900">
                            {validationResult.consensusData.address.value}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({validationResult.consensusData.address.sources.join(', ')})
                          </span>
                        </div>
                      )}
                      {validationResult.consensusData.phone && (
                        <div>
                          <span className="text-gray-600">Phone: </span>
                          <span className="text-gray-900">
                            {validationResult.consensusData.phone.value}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({validationResult.consensusData.phone.sources.join(', ')})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Auto-Correction */}
                {showApproval && validationResult.suggestedChanges && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Suggested Corrections
                    </h3>
                    <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                      <div className="text-sm text-green-700 mb-2">
                        Auto-correction available! The following changes are suggested:
                      </div>
                      <div className="text-xs text-gray-700 space-y-1">
                        {Object.entries(validationResult.suggestedChanges).map(
                          ([field, value]) => (
                            <div key={field}>
                              <span className="font-medium">{field}:</span> {String(value)}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={applyCorrections}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Apply Corrections
                      </button>
                      <button
                        onClick={() => setShowApproval(false)}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                      >
                        Reject
                      </button>
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
