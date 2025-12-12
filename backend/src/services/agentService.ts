import axios, { AxiosInstance } from 'axios';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';

interface ProviderValidationRequest {
  provider_id: string;
  npi?: string;
  name?: string;
  license_number?: string;
  license_state?: string;
  specialty?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

interface ValidationResponse {
  job_id: string;
  status: string;
  message: string;
}

interface ValidationIssue {
  field: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  sources_conflict?: string[];
}

interface ValidationResult {
  provider_id: string;
  trust_score: number;
  grade: string;
  is_valid: boolean;
  completeness_score: number;
  recommendations: string[];
  validation_issues: ValidationIssue[];
  enriched_data: Record<string, any>;
  processing_time: number;
}

interface JobStatus {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  provider_id: string;
  started_at: string;
}

class AgentServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: AGENT_SERVICE_URL,
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/');
      return response.data.status === 'running';
    } catch (error) {
      console.error('Agent service health check failed:', error);
      return false;
    }
  }

  async validateProvider(data: ProviderValidationRequest): Promise<ValidationResponse> {
    try {
      const response = await this.client.post<ValidationResponse>('/api/validate', data);
      return response.data;
    } catch (error) {
      console.error('Failed to start validation:', error);
      throw new Error('Agent service validation request failed');
    }
  }

  async getValidationResult(jobId: string): Promise<ValidationResult | JobStatus> {
    try {
      const response = await this.client.get(`/api/validate/${jobId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Job not found');
      }
      throw error;
    }
  }

  async waitForValidation(
    jobId: string,
    maxWaitSeconds: number = 120,
    pollIntervalMs: number = 2000
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    
    while (true) {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      
      if (elapsedSeconds > maxWaitSeconds) {
        throw new Error('Validation timeout - job did not complete in time');
      }

      const result = await this.getValidationResult(jobId);

      if ('trust_score' in result) {
        return result as ValidationResult;
      }

      const jobStatus = result as JobStatus;
      
      if (jobStatus.status === 'failed') {
        throw new Error('Validation job failed');
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  async listJobs(): Promise<{ total: number; jobs: JobStatus[] }> {
    try {
      const response = await this.client.get('/api/jobs');
      return response.data;
    } catch (error) {
      console.error('Failed to list jobs:', error);
      throw error;
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      await this.client.delete(`/api/jobs/${jobId}`);
    } catch (error) {
      console.error('Failed to delete job:', error);
      throw error;
    }
  }

  async validateProviderSync(
    data: ProviderValidationRequest,
    maxWaitSeconds: number = 120
  ): Promise<ValidationResult> {
    const { job_id } = await this.validateProvider(data);
    return this.waitForValidation(job_id, maxWaitSeconds);
  }
}

export const agentService = new AgentServiceClient();

export type {
  ProviderValidationRequest,
  ValidationResponse,
  ValidationResult,
  ValidationIssue,
  JobStatus,
};
