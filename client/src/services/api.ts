const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

class ApiClient {
  private baseUrl: string;
  private geminiApiKey: string;

  constructor(baseUrl: string = API_BASE_URL, geminiKey: string = GEMINI_API_KEY) {
    this.baseUrl = baseUrl;
    this.geminiApiKey = geminiKey;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async getProviderStats() {
    return this.request<any>('/api/providers/stats');
  }

  async getProviders(params?: { page?: number; limit?: number; validated?: boolean; state?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.validated !== undefined) queryParams.append('validated', params.validated.toString());
    if (params?.state) queryParams.append('state', params.state);

    const query = queryParams.toString();
    return this.request<any>(`/api/providers${query ? `?${query}` : ''}`);
  }

  async getProviderById(id: string) {
    return this.request<any>(`/api/providers/${id}`);
  }

  async submitFeedback(providerId: string, feedback: {
    fieldName: string;
    originalValue?: string;
    correctedValue?: string;
    feedbackType: 'accept' | 'reject' | 'correct';
    affectedSource?: string;
    reviewerEmail: string;
    reviewerName?: string;
    notes?: string;
  }) {
    return this.request<any>(`/api/providers/${providerId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  async getTrustScores() {
    return this.request<any>('/api/providers/trust/scores');
  }

  async getValidationJobs() {
    return this.request<any>('/api/providers/validation-jobs');
  }

  async uploadProviderFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/api/upload/providers`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  async getUploadHistory() {
    return this.request<any>('/api/upload/history');
  }

  async validateProvider(id: string, multiSource: boolean = true) {
    return this.request<any>(`/api/validation/${id}?multiSource=${multiSource}`, {
      method: 'POST',
    });
  }

  async applyCorrections(id: string) {
    return this.request<any>(`/api/validation/${id}/apply`, {
      method: 'POST',
    });
  }

  async getValidationTrustScores() {
    return this.request<any>('/api/validation/trust-scores');
  }

  async storeValidationResult(result: any) {
    return this.request<any>('/api/validation/results', {
      method: 'POST',
      body: JSON.stringify(result),
    });
  }

  async sendProgressUpdate(update: any) {
    return this.request<any>('/api/validation/progress', {
      method: 'POST',
      body: JSON.stringify(update),
    });
  }

  async storeEmbeddings(providerId: string, embeddings: number[]) {
    return this.request<any>('/api/embeddings/store', {
      method: 'POST',
      body: JSON.stringify({ providerId, embeddings }),
    });
  }

  async searchSimilarProviders(providerId: string) {
    return this.request<any>('/api/embeddings/search', {
      method: 'POST',
      body: JSON.stringify({ providerId }),
    });
  }

  async getAIInsights(providerData: any, validationIssues: any[]): Promise<string[]> {
    if (!this.geminiApiKey) {
      return ['Gemini API key not configured. Set VITE_GEMINI_API_KEY.'];
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a healthcare provider data validation expert. Analyze this provider and validation issues, provide 3-4 concise actionable insights.
                    
Provider: ${providerData.name} (NPI: ${providerData.npi || 'N/A'})
Issues: ${validationIssues.length} conflicts found

Respond in JSON: {"insights": ["insight1", "insight2", ...]}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.insights || [content];
      }
      return [content];
    } catch (error) {
      console.error('Gemini API error:', error);
      return ['Unable to generate insights'];
    }
  }

  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiClient = new ApiClient();
export const api = apiClient; // Export both for compatibility
export default apiClient;
