import { npiRegistryService } from './npiRegistry.service';
import { googleMapsService } from './googleMaps.service';
import { confidenceScoringService } from './confidenceScoring.service';
import prisma from '../prisma/client';

export interface ValidationSource {
  name: string;
  status: 'success' | 'failed' | 'skipped';
  confidence: number;
  data: any;
  discrepancies: string[];
}

export interface MultiSourceValidationResult {
  providerId: string;
  overallConfidence: number;
  status: 'high' | 'medium' | 'low' | 'critical';
  sources: ValidationSource[];
  consensusData: {
    name?: { value: string; confidence: number; sources: string[] };
    address?: { value: string; confidence: number; sources: string[] };
    phone?: { value: string; confidence: number; sources: string[] };
    specialty?: { value: string; confidence: number; sources: string[] };
  };
  recommendations: string[];
  autoCorrect: boolean;
  suggestedChanges: any;
}

export class MultiSourceValidationService {
  async validateProviderMultiSource(provider: {
    id: string;
    npiNumber: string;
    firstName: string;
    lastName: string;
    primaryPhone?: string;
    practiceAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    specialties?: string[];
  }): Promise<MultiSourceValidationResult> {
    const sources: ValidationSource[] = [];
    const recommendations: string[] = [];

    const npiResult = await this.validateWithNPI(provider);
    sources.push(npiResult);

    const googleResult = await this.validateWithGoogleMaps(provider);
    sources.push(googleResult);

    const consensus = this.buildConsensus(sources, provider);
    const overallConfidence = this.calculateOverallConfidence(sources, consensus);
    const status = confidenceScoringService.getValidationStatus(overallConfidence);

    if (overallConfidence < 0.85) {
      recommendations.push('Provider data needs review');
    }
    if (npiResult.status === 'failed') {
      recommendations.push('NPI Registry validation failed - verify NPI number');
    }
    if (googleResult.status === 'failed') {
      recommendations.push('Address not found on Google Maps - verify practice location');
    }

    const autoCorrect = overallConfidence >= 0.90 && npiResult.status === 'success';
    const suggestedChanges = autoCorrect ? this.generateSuggestedChanges(provider, consensus) : null;

    await this.updateTrustScores(sources);

    return {
      providerId: provider.id,
      overallConfidence,
      status: status.status,
      sources,
      consensusData: consensus,
      recommendations,
      autoCorrect,
      suggestedChanges,
    };
  }

  private async validateWithNPI(provider: any): Promise<ValidationSource> {
    try {
      const result = await npiRegistryService.compareProviderData(provider);
      
      const weightedScore = confidenceScoringService.calculateWeightedScore(result.matchedFields);

      return {
        name: 'NPI Registry',
        status: result.isValid ? 'success' : 'failed',
        confidence: weightedScore.overallConfidence,
        data: result.npiData,
        discrepancies: result.discrepancies,
      };
    } catch (error: any) {
      return {
        name: 'NPI Registry',
        status: 'failed',
        confidence: 0,
        data: null,
        discrepancies: [`API error: ${error.message}`],
      };
    }
  }

  private async validateWithGoogleMaps(provider: any): Promise<ValidationSource> {
    try {
      const businessName = `${provider.firstName} ${provider.lastName}`;
      const addressString = `${provider.city}, ${provider.state}`;
      
      let result = await googleMapsService.findProviderBusiness(businessName, addressString);
      
      if (!result.isValid && provider.practiceAddress) {
        result = await googleMapsService.validateAddress({
          street: provider.practiceAddress,
          city: provider.city,
          state: provider.state,
          zipCode: provider.zipCode,
        });
      }

      return {
        name: 'Google Maps',
        status: result.isValid ? 'success' : 'failed',
        confidence: result.confidence,
        data: {
          formattedAddress: result.formattedAddress,
          coordinates: result.coordinates,
          phoneNumber: result.phoneNumber,
          businessName: result.businessName,
        },
        discrepancies: result.discrepancies,
      };
    } catch (error: any) {
      return {
        name: 'Google Maps',
        status: 'skipped',
        confidence: 0,
        data: null,
        discrepancies: [`Skipped: ${error.message}`],
      };
    }
  }

  private buildConsensus(sources: ValidationSource[], provider: any): any {
    const consensus: any = {};

    const npiSource = sources.find(s => s.name === 'NPI Registry');
    if (npiSource?.data) {
      consensus.name = {
        value: `${npiSource.data.firstName} ${npiSource.data.lastName}`,
        confidence: npiSource.confidence,
        sources: ['NPI Registry'],
      };
    }

    const googleSource = sources.find(s => s.name === 'Google Maps');
    if (googleSource?.data?.formattedAddress && googleSource.confidence > 0.8) {
      consensus.address = {
        value: googleSource.data.formattedAddress,
        confidence: googleSource.confidence,
        sources: ['Google Maps'],
      };
    } else if (npiSource?.data?.address) {
      consensus.address = {
        value: `${npiSource.data.address.city}, ${npiSource.data.address.state} ${npiSource.data.address.zipCode}`,
        confidence: npiSource.confidence * 0.7,
        sources: ['NPI Registry'],
      };
    }

    if (googleSource?.data?.phoneNumber) {
      consensus.phone = {
        value: googleSource.data.phoneNumber,
        confidence: googleSource.confidence,
        sources: ['Google Maps'],
      };
    } else if (npiSource?.data?.address?.phone) {
      consensus.phone = {
        value: npiSource.data.address.phone,
        confidence: npiSource.confidence * 0.5,
        sources: ['NPI Registry'],
      };
    }

    if (npiSource?.data?.specialty) {
      consensus.specialty = {
        value: npiSource.data.specialty.description,
        confidence: npiSource.confidence,
        sources: ['NPI Registry'],
      };
    }

    return consensus;
  }

  private calculateOverallConfidence(sources: ValidationSource[], consensus: any): number {
    const weights = {
      'NPI Registry': 0.70,
      'Google Maps': 0.30,
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const source of sources) {
      if (source.status === 'success' || source.status === 'failed') {
        const weight = weights[source.name as keyof typeof weights] || 0.1;
        weightedSum += source.confidence * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private generateSuggestedChanges(currentData: any, consensus: any): any {
    const changes: any = {};

    if (consensus.name && consensus.name.value !== `${currentData.firstName} ${currentData.lastName}`) {
      const [firstName, ...lastNameParts] = consensus.name.value.split(' ');
      changes.firstName = firstName;
      changes.lastName = lastNameParts.join(' ');
    }

    if (consensus.phone && consensus.phone.value !== currentData.primaryPhone) {
      changes.primaryPhone = consensus.phone.value;
    }

    if (consensus.address) {
      const addressMatch = consensus.address.value.match(/^(.*),\s*([A-Z]{2})\s*(\d{5})/);
      if (addressMatch) {
        const [, city, state, zipCode] = addressMatch;
        if (city !== currentData.city) changes.city = city;
        if (state !== currentData.state) changes.state = state;
        if (zipCode !== currentData.zipCode) changes.zipCode = zipCode;
      }
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  private async updateTrustScores(sources: ValidationSource[]): Promise<void> {
    for (const source of sources) {
      if (source.status === 'skipped') continue;

      const isSuccess = source.status === 'success' && source.confidence > 0.7;

      const fields = ['name', 'address', 'phone', 'specialty'];
      
      for (const field of fields) {
        try {
          const trustScore = await prisma.trustScore.findUnique({
            where: {
              sourceType_dataField: {
                sourceType: source.name.toLowerCase().replace(/\s+/g, '_'),
                dataField: field,
              },
            },
          });

          if (trustScore) {
            const newSuccessCount = isSuccess ? trustScore.successCount + 1 : trustScore.successCount;
            const newFailureCount = isSuccess ? trustScore.failureCount : trustScore.failureCount + 1;
            const newTotalValidations = trustScore.totalValidations + 1;
            
            const learningRate = trustScore.learningRate;
            const currentScore = trustScore.score;
            const outcomeScore = isSuccess ? 1.0 : 0.0;
            const newScore = currentScore * (1 - learningRate) + outcomeScore * learningRate;

            await prisma.trustScore.update({
              where: { id: trustScore.id },
              data: {
                score: newScore,
                successCount: newSuccessCount,
                failureCount: newFailureCount,
                totalValidations: newTotalValidations,
                lastUpdated: new Date(),
              },
            });
          } else {
            await prisma.trustScore.create({
              data: {
                sourceType: source.name.toLowerCase().replace(/\s+/g, '_'),
                dataField: field,
                score: isSuccess ? 0.8 : 0.3,
                successCount: isSuccess ? 1 : 0,
                failureCount: isSuccess ? 0 : 1,
                totalValidations: 1,
                learningRate: 0.1,
              },
            });
          }
        } catch (error) {
          console.error(`[TrustScore] Failed to update ${source.name} - ${field}:`, error);
        }
      }
    }
  }
}

export const multiSourceValidationService = new MultiSourceValidationService();
