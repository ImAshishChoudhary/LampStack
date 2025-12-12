import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const NPI_API_BASE = 'https://npiregistry.cms.hhs.gov/api';

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

interface AgentNode {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  agent: string;
  parentId?: string;
  children: string[];
  data?: any;
}

interface ClientSession {
  ws: WebSocket;
  sessionId: string;
  isProcessing: boolean;
}

export class RealAgentOrchestrator {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, ClientSession> = new Map();
  private nodes: Map<string, AgentNode> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupHandlers();
    console.log('[WebSocket] Real Agent Orchestrator initialized');
  }

  private setupHandlers(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const sessionId = `session_${Date.now()}`;
      this.clients.set(ws, { ws, sessionId, isProcessing: false });
      console.log(`[WebSocket] Client connected: ${sessionId}`);

      this.sendToClient(ws, { type: 'init', sessionId, logs: [], nodes: [] });

      ws.on('message', (data) => this.handleMessage(ws, data.toString()));
      ws.on('close', () => {
        console.log(`[WebSocket] Client disconnected`);
        this.clients.delete(ws);
      });
    });
  }

  private async handleMessage(ws: WebSocket, data: string): Promise<void> {
    try {
      console.log('[WebSocket] Raw message received:', data.substring(0, 200));
      const message = JSON.parse(data);
      console.log('[WebSocket] Parsed message type:', message.type);
      
      const session = this.clients.get(ws);
      if (!session) {
        console.error('[WebSocket] No session found for this client!');
        return;
      }

      if (message.type === 'start_processing') {
        console.log('[WebSocket] *** START_PROCESSING RECEIVED ***');
        console.log('[WebSocket] Session isProcessing:', session.isProcessing);
        console.log('[WebSocket] Data:', JSON.stringify(message.data).substring(0, 300));
        
        if (!session.isProcessing) {
          session.isProcessing = true;
          this.nodes.clear();
          
          console.log('[WebSocket] Starting real agent pipeline...');
          await this.runRealAgentPipeline(message.data);
          
          session.isProcessing = false;
          console.log('[WebSocket] Pipeline complete');
        } else {
          console.log('[WebSocket] Already processing, ignoring duplicate request');
        }
      } else {
        console.log('[WebSocket] Unknown message type:', message.type);
      }
    } catch (error: any) {
      console.error('[WebSocket] Error handling message:', error.message);
      console.error('[WebSocket] Stack:', error.stack);
    }
  }

  private async runRealAgentPipeline(input: { name: string; content: string; query: string }): Promise<void> {
    const { name, content, query } = input;
    
    console.log('\n' + '='.repeat(70));
    console.log('[ORCHESTRATOR] Starting REAL Agent Pipeline');
    console.log(`[ORCHESTRATOR] File: ${name}`);
    console.log(`[ORCHESTRATOR] Query: ${query}`);
    console.log(`[ORCHESTRATOR] Content length: ${content?.length || 0} bytes`);
    console.log('='.repeat(70) + '\n');

    this.createNode('root', 'Orchestrator Agent', 'Coordinating multi-agent workflow', 'orchestrator');

    try {
      this.log('orchestrator', `Received task: "${query}"`);
      this.log('orchestrator', `Analyzing file: ${name}`);
      
      await this.delay(500);
      
      this.createNode('analysis', 'Task Analysis', 'Using LampStack Agent to understand the task requirements', 'orchestrator', 'root');
      
      const taskAnalysis = await this.analyzeTaskWithGemini(query, name, content);
      this.log('orchestrator', `Task analysis: ${taskAnalysis.summary}`);
      this.updateNode('analysis', 'complete');

      this.createNode('extraction', 'Data Extraction', 'Parsing document and extracting provider records', 'extraction', 'root');
      
      const extractedData = await this.extractData(content, name);
      this.log('extraction', `Extracted ${extractedData.length} provider records`);
      
      if (extractedData.length > 0) {
        this.log('extraction', `Sample record: ${JSON.stringify(extractedData[0])}`);
      }
      this.updateNode('extraction', 'complete');

      this.createNode('validation', 'Multi-Source Validation', `Validating ${extractedData.length} providers against external sources`, 'orchestrator', 'root');

      const validatedProviders = [];
      
      for (let i = 0; i < extractedData.length; i++) {
        const provider = extractedData[i];
        const providerNodeId = `provider_${i}`;
        
        this.createNode(
          providerNodeId, 
          `Provider ${i + 1}: ${provider.name || 'Unknown'}`,
          `Processing provider data`,
          'orchestrator',
          'validation'
        );

        let npiFormatValid = false;
        if (provider.npi) {
          npiFormatValid = this.validateNPIFormat(provider.npi);
          if (!npiFormatValid) {
            this.log('npi', `NPI ${provider.npi}: INVALID FORMAT - Fails Luhn checksum`);
            provider.npiFormatValid = false;
            provider.npiValidation = { 
              valid: false, 
              npi: provider.npi, 
              reason: 'Invalid NPI format - fails Luhn checksum validation',
              formatCheck: 'FAILED'
            };
          } else {
            provider.npiFormatValid = true;
            const npiResult = await this.validateNPIReal(provider.npi, providerNodeId);
            provider.npiValidation = npiResult;
          }
        } else {
          provider.npiValidation = { valid: false, reason: 'No NPI provided' };
        }

        if (provider.address || provider.city) {
          const geoResult = await this.geocodeAddressReal(provider, providerNodeId);
          provider.geocoding = geoResult;
        }

        const qualityAssessment = await this.assessProviderWithGemini(provider, providerNodeId);
        provider.qualityScore = qualityAssessment;

        validatedProviders.push(provider);
        this.updateNode(providerNodeId, 'complete');

        this.broadcast({
          type: 'progress',
          data: {
            progress: Math.round(30 + (i / extractedData.length) * 60),
            stage: 'Validation',
            message: `Validated provider ${i + 1}/${extractedData.length}`,
          },
        });

        await this.delay(1000);
      }

      this.updateNode('validation', 'complete');

      console.log('[STATS] Calculating final stats...');
      console.log('[STATS] Provider validations:', validatedProviders.map(p => ({
        name: p.name,
        npiValid: p.npiValidation?.valid,
        geocodingValid: p.geocoding?.valid,
        qualityScore: p.qualityScore?.score
      })));
      
      const npiValidCount = validatedProviders.filter(p => p.npiValidation?.valid === true).length;
      const addressValidCount = validatedProviders.filter(p => p.geocoding?.valid === true).length;
      const avgQuality = validatedProviders.length > 0 
        ? validatedProviders.reduce((sum, p) => sum + (p.qualityScore?.score || 50), 0) / validatedProviders.length
        : 50;
      
      console.log('[STATS] NPI Valid:', npiValidCount);
      console.log('[STATS] Address Valid:', addressValidCount);
      console.log('[STATS] Avg Quality:', avgQuality);

      this.createNode('summary', 'Results Summary', 'Generating final report with LampStack Agent', 'orchestrator', 'root');
      
      const finalSummary = await this.generateSummaryWithGemini(validatedProviders);
      this.log('orchestrator', `Final Summary: ${finalSummary}`);
      
      this.updateNode('summary', 'complete');
      this.updateNode('root', 'complete');

      this.broadcast({
        type: 'progress',
        data: { progress: 100, stage: 'Complete', message: 'Processing finished' },
      });

      const finalStats = {
        totalProviders: validatedProviders.length,
        npiValidated: npiValidCount,
        addressValidated: addressValidCount,
        avgConfidence: Math.round(avgQuality),
        issuesFlagged: validatedProviders.length - npiValidCount,
      };
      
      console.log('[STATS] Sending complete with stats:', finalStats);

      this.broadcast({
        type: 'complete',
        data: {
          providers: validatedProviders,
          summary: finalSummary,
          stats: finalStats,
        },
      });

    } catch (error: any) {
      console.error('[ORCHESTRATOR] Error:', error.message);
      this.log('orchestrator', `Error: ${error.message}`);
      this.updateNode('root', 'error');
    }
  }

  private async analyzeTaskWithGemini(query: string, fileName: string, content: string): Promise<{ summary: string; actions: string[] }> {
    this.thinking('orchestrator', 'Calling LampStack Agent to analyze task requirements...');
    
    try {
      const prompt = `You are an AI assistant analyzing a data validation task.
      
Task: ${query}
File: ${fileName}
Sample data (first 500 chars): ${content?.substring(0, 500) || 'No content'}

Analyze this task and provide:
1. A brief summary of what needs to be done (1-2 sentences)
2. List of validation steps required

Respond in JSON format:
{
  "summary": "brief summary",
  "actions": ["action1", "action2"]
}`;

      console.log('[LAMPSTACK] Calling API...');
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      console.log('[LAMPSTACK] Response received');
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        this.log('lampstack', `Task analysis complete: ${parsed.summary}`);
        return parsed;
      }
      
      return { summary: 'Validate provider data', actions: ['NPI validation', 'Address validation'] };
    } catch (error: any) {
      console.error('[LAMPSTACK] Error:', error.message);
      this.log('lampstack', `API Error: ${error.message}`);
      return { summary: 'Validate provider data', actions: ['NPI validation'] };
    }
  }

  private async extractData(content: string, fileName: string): Promise<any[]> {
    if (!content) {
      this.log('extraction', 'No content provided, using database records');
      return [];
    }

    this.thinking('extraction', 'Parsing CSV structure...');
    
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    this.log('extraction', `Found columns: ${headers.join(', ')}`);

    const records: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const record: any = {};
      
      headers.forEach((header, idx) => {
        record[header] = values[idx]?.trim().replace(/['"]/g, '') || '';
      });

      record.name = record.name || `${record.firstname || ''} ${record.lastname || ''}`.trim();
      record.npi = record.npi || record.npi_number || record.npinumber || '';
      record.address = record.address || record.street_address || record.practiceaddress || '';
      record.city = record.city || '';
      record.state = record.state || '';
      record.phone = record.phone || record.phonenumber || record.primaryphone || '';
      record.email = record.email || '';
      
      records.push(record);
    }

    return records;
  }

  private async validateNPIReal(npi: string, parentNodeId: string): Promise<any> {
    const nodeId = `${parentNodeId}_npi`;
    this.createNode(nodeId, 'NPI Registry Lookup', `Querying CMS NPI Registry for ${npi}`, 'npi', parentNodeId);
    
    this.thinking('npi', `Making REAL API call to: ${NPI_API_BASE}/?version=2.1&number=${npi}`);

    try {
      console.log(`[NPI API] Calling: ${NPI_API_BASE}/?version=2.1&number=${npi}`);
      
      const response = await axios.get(`${NPI_API_BASE}/?version=2.1&number=${npi}`, {
        timeout: 15000,
      });

      const data = response.data;
      console.log(`[NPI API] Response: ${data.result_count} results`);

      if (data.result_count === 0) {
        this.log('npi', `NPI ${npi}: NOT FOUND in registry`);
        this.updateNode(nodeId, 'error');
        return { valid: false, npi, reason: 'Not found in CMS NPI Registry' };
      }

      const result = data.results[0];
      const basic = result.basic || {};
      const name = `${basic.first_name || ''} ${basic.last_name || ''}`.trim() || basic.organization_name;
      const specialty = result.taxonomies?.[0]?.desc || 'Unknown';
      
      this.log('npi', `NPI ${npi}: VERIFIED - ${name} (${specialty})`);
      this.log('npi', `Registry data: Status=${basic.status}, Last Updated=${basic.last_updated}`);
      
      this.updateNode(nodeId, 'complete');
      
      return {
        valid: true,
        npi,
        name,
        specialty,
        status: basic.status,
        lastUpdated: basic.last_updated,
        addresses: result.addresses,
        source: 'CMS NPI Registry API',
      };
    } catch (error: any) {
      console.error(`[NPI API] Error: ${error.message}`);
      this.log('npi', `NPI API Error: ${error.message}`);
      this.updateNode(nodeId, 'error');
      return { valid: false, npi, error: error.message };
    }
  }

  private async geocodeAddressReal(provider: any, parentNodeId: string): Promise<any> {
    const nodeId = `${parentNodeId}_geo`;
    const fullAddress = [provider.address, provider.city, provider.state].filter(Boolean).join(', ');
    
    if (!fullAddress) return null;
    
    this.createNode(nodeId, 'Address Geocoding', `Geocoding: ${fullAddress.substring(0, 40)}...`, 'geocoding', parentNodeId);
    
    if (!GOOGLE_MAPS_KEY) {
      this.log('geocoding', 'Google Maps API key not configured');
      this.updateNode(nodeId, 'error');
      return { error: 'API key not configured' };
    }

    this.thinking('geocoding', `Making REAL API call to Google Maps Geocoding API...`);

    try {
      console.log(`[GOOGLE MAPS] Geocoding: ${fullAddress}`);
      
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { address: fullAddress, key: GOOGLE_MAPS_KEY },
        timeout: 10000,
      });

      if (response.data.status !== 'OK' || !response.data.results?.length) {
        this.log('geocoding', `Address not found: ${fullAddress}`);
        this.updateNode(nodeId, 'error');
        return { valid: false, address: fullAddress, reason: 'Address not found' };
      }

      const result = response.data.results[0];
      this.log('geocoding', `Address verified: ${result.formatted_address}`);
      this.log('geocoding', `Coordinates: ${result.geometry.location.lat}, ${result.geometry.location.lng}`);
      
      this.updateNode(nodeId, 'complete');
      
      return {
        valid: true,
        formattedAddress: result.formatted_address,
        location: result.geometry.location,
        placeId: result.place_id,
        source: 'Google Maps Geocoding API',
      };
    } catch (error: any) {
      console.error(`[GOOGLE MAPS] Error: ${error.message}`);
      this.log('geocoding', `Geocoding API Error: ${error.message}`);
      this.updateNode(nodeId, 'error');
      return { valid: false, error: error.message };
    }
  }

  private async assessProviderWithGemini(provider: any, parentNodeId: string): Promise<any> {
    const nodeId = `${parentNodeId}_quality`;
    this.createNode(nodeId, 'Quality Assessment', 'Using LampStack Agent to assess data quality', 'lampstack', parentNodeId);
    
    const npiValid = provider.npiValidation?.valid === true;
    const addressValid = provider.geocoding?.valid === true;
    const npiFormatValid = this.validateNPIFormat(provider.npi);
    
    let maxScore = 100;
    let mandatoryIssues: string[] = [];
    
    if (!npiFormatValid) {
      maxScore = 15;
      mandatoryIssues.push(`CRITICAL: NPI ${provider.npi} fails Luhn checksum validation - this is not a valid NPI format`);
    } else if (!npiValid) {
      maxScore = 25;
      mandatoryIssues.push(`CRITICAL: NPI ${provider.npi} not found in CMS NPI Registry - cannot verify provider identity`);
    }
    
    if (!addressValid) {
      maxScore = Math.min(maxScore, 40);
      mandatoryIssues.push('Address could not be verified via geocoding');
    }
    
    try {
      const prompt = `Assess the data quality of this healthcare provider record.

CRITICAL SCORING RULES:
- If NPI is NOT FOUND in registry (npiValidation.valid = false): Score MUST be 25 or lower
- If NPI format is invalid: Score MUST be 15 or lower  
- If both NPI and address are invalid: Score MUST be 10 or lower
- Only if NPI IS VALID can score exceed 50

Provider Data:
${JSON.stringify(provider, null, 2)}

NPI Validation Status: ${npiValid ? 'VALID - Found in CMS Registry' : 'INVALID - NOT FOUND in CMS Registry'}
Address Validation Status: ${addressValid ? 'VALID - Geocoded successfully' : 'INVALID - Could not geocode'}
NPI Format Check (Luhn): ${npiFormatValid ? 'VALID' : 'INVALID - Fails checksum'}

Rate the data quality from 0-100 following the CRITICAL SCORING RULES above.
List all issues found including data mismatches.

Respond ONLY in JSON: { "score": number, "issues": ["issue1", "issue2"], "recommendation": "text" }`;

      console.log('[LAMPSTACK] Assessing provider quality...');
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let assessment = JSON.parse(jsonMatch[0]);
        
        if (assessment.score > maxScore) {
          console.log(`[LAMPSTACK] Capping score from ${assessment.score} to ${maxScore} (NPI valid: ${npiValid})`);
          assessment.score = maxScore;
        }
        
        if (mandatoryIssues.length > 0) {
          assessment.issues = [...mandatoryIssues, ...(assessment.issues || [])];
        }
        
        this.log('lampstack', `Quality score: ${assessment.score}/100`);
        if (assessment.issues?.length > 0) {
          this.log('lampstack', `Issues: ${assessment.issues.join(', ')}`);
        }
        this.updateNode(nodeId, assessment.score > 50 ? 'complete' : 'error');
        return assessment;
      }
      
      const fallbackScore = npiValid ? 60 : 20;
      this.updateNode(nodeId, fallbackScore > 50 ? 'complete' : 'error');
      return { score: fallbackScore, issues: mandatoryIssues };
    } catch (error: any) {
      this.log('lampstack', `Assessment error: ${error.message}`);
      this.updateNode(nodeId, 'error');
      const fallbackScore = npiValid ? 40 : 15;
      return { score: fallbackScore, issues: mandatoryIssues, error: error.message };
    }
  }

  private validateNPIFormat(npi: string): boolean {
    if (!npi || !/^\d{10}$/.test(npi)) {
      return false;
    }
    
    const fullNumber = '80840' + npi;
    let sum = 0;
    let alternate = false;
    
    for (let i = fullNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(fullNumber[i], 10);
      
      if (alternate) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      alternate = !alternate;
    }
    
    return sum % 10 === 0;
  }

  private async generateSummaryWithGemini(providers: any[]): Promise<string> {
    this.thinking('orchestrator', 'Generating summary with LampStack Agent...');
    
    try {
      const prompt = `Summarize the validation results for ${providers.length} healthcare providers.
      
Data: ${JSON.stringify(providers.slice(0, 5), null, 2)}

Provide a brief 2-3 sentence summary of the validation results.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      return `Processed ${providers.length} providers. See detailed logs for results.`;
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) { result.push(current); current = ''; }
      else current += char;
    }
    result.push(current);
    return result;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  private createNode(id: string, label: string, description: string, agent: string, parentId?: string): void {
    const node: AgentNode = { id, label, description, status: 'processing', agent, parentId, children: [] };
    this.nodes.set(id, node);
    
    if (parentId && this.nodes.has(parentId)) {
      this.nodes.get(parentId)!.children.push(id);
    }
    
    console.log(`[NODE] + ${label}`);
    this.broadcastNodes();
  }

  private updateNode(id: string, status: AgentNode['status']): void {
    const node = this.nodes.get(id);
    if (node) {
      node.status = status;
      console.log(`[NODE] ${node.label}: ${status}`);
      this.broadcastNodes();
    }
  }

  private log(agent: string, message: string): void {
    console.log(`[${agent.toUpperCase()}] ${message}`);
    this.broadcast({
      type: 'log',
      agent,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private thinking(agent: string, message: string): void {
    console.log(`[${agent.toUpperCase()}] (thinking) ${message}`);
    this.broadcast({
      type: 'reasoning',
      agent,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private broadcastNodes(): void {
    this.broadcast({
      type: 'nodes',
      data: Array.from(this.nodes.values()),
    });
  }

  private broadcast(message: any): void {
    const data = JSON.stringify(message);
    this.clients.forEach((session) => {
      if (session.ws.readyState === WebSocket.OPEN) {
        session.ws.send(data);
      }
    });
  }

  private sendToClient(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

export function createRealTimeWebSocket(server: Server): RealAgentOrchestrator {
  return new RealAgentOrchestrator(server);
}
