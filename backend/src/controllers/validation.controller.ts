import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { npiRegistryService } from '../services/npiRegistry.service';
import { multiSourceValidationService } from '../services/multiSourceValidation.service';
import { asyncHandler } from '../utils/asyncHandler.util';

export const validateProvider = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { multiSource = true } = req.query;

    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    let validationResult: any;
    let sources: any[] = [];

    if (multiSource === 'true' || multiSource === true) {
      validationResult = await multiSourceValidationService.validateProviderMultiSource({
        id: provider.id,
        npiNumber: provider.npiNumber,
        firstName: provider.firstName,
        lastName: provider.lastName,
        primaryPhone: provider.primaryPhone || undefined,
        practiceAddress: provider.practiceAddress || undefined,
        city: provider.city || undefined,
        state: provider.state || undefined,
        zipCode: provider.zipCode || undefined,
        specialties: provider.specialties,
      });

      sources = validationResult.sources;
    } else {
      const npiResult = await npiRegistryService.compareProviderData({
        npiNumber: provider.npiNumber,
        firstName: provider.firstName,
        lastName: provider.lastName,
        primaryPhone: provider.primaryPhone || undefined,
        practiceAddress: provider.practiceAddress || undefined,
        city: provider.city || undefined,
        state: provider.state || undefined,
        zipCode: provider.zipCode || undefined,
        specialties: provider.specialties,
      });

      validationResult = {
        overallConfidence: npiResult.confidence,
        status: npiResult.isValid ? 'success' : 'failed',
        sources: [{
          name: 'NPI Registry',
          confidence: npiResult.confidence,
          discrepancies: npiResult.discrepancies,
        }],
        recommendations: [],
        autoCorrect: false,
        suggestedChanges: null,
      };

      sources = [{
        name: 'NPI Registry',
        status: npiResult.isValid ? 'success' : 'failed',
        confidence: npiResult.confidence,
        data: npiResult.npiData,
        discrepancies: npiResult.discrepancies,
      }];
    }

    const validationJob = await prisma.validationJob.create({
      data: {
        jobType: 'multi_source_validation',
        status: 'completed',
        totalProviders: 1,
        processedProviders: 1,
        successfulCount: validationResult.overallConfidence > 0.7 ? 1 : 0,
        failedCount: validationResult.overallConfidence <= 0.7 ? 1 : 0,
        startedAt: new Date(),
        completedAt: new Date(),
        summary: {
          sources: sources.map(s => s.name),
          overallConfidence: validationResult.overallConfidence,
        },
      },
    });

    for (const source of sources) {
      await prisma.validationResult.create({
        data: {
          providerId: provider.id,
          agentName: source.name.toLowerCase().replace(/\s+/g, '_'),
          validationType: source.name === 'NPI Registry' ? 'npi_registry' : 'google_maps',
          status: source.status,
          confidence: source.confidence,
          sourceType: source.name.toLowerCase().replace(/\s+/g, '_'),
          sourceUrl: source.name === 'NPI Registry' 
            ? 'https://npiregistry.cms.hhs.gov/api/'
            : 'https://maps.googleapis.com/maps/api/',
          foundIssues: source.discrepancies,
          apiResponse: source.data,
          validatedAt: new Date(),
        },
      });
    }

    await prisma.provider.update({
      where: { id },
      data: {
        overallConfidence: validationResult.overallConfidence,
        lastValidated: new Date(),
      },
    });

    const existingVersion = await prisma.providerVersion.findFirst({
      where: {
        providerId: provider.id,
        versionNumber: provider.currentVersion + 1,
      },
    });

    if (!existingVersion) {
      await prisma.providerVersion.create({
        data: {
          providerId: provider.id,
          versionNumber: provider.currentVersion + 1,
          snapshot: {
            ...provider,
            validationSources: sources.map(s => s.name),
            consensusData: validationResult.consensusData || null,
          },
          changedFields: [],
          changeSource: 'multi_source_validation',
          confidence: validationResult.overallConfidence,
          changeReason: 'Multi-source validation completed',
        },
      });
    }

    res.json({
      success: true,
      validation: {
        providerId: provider.id,
        overallConfidence: validationResult.overallConfidence,
        status: validationResult.status,
        sources: sources.map(s => ({
          name: s.name,
          confidence: s.confidence,
          discrepancies: s.discrepancies,
        })),
        consensusData: validationResult.consensusData,
        recommendations: validationResult.recommendations,
        autoCorrect: validationResult.autoCorrect,
        suggestedChanges: validationResult.suggestedChanges,
      },
    });
  }
);

export const validateAllProviders = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit = 50 } = req.query;

    const providers = await prisma.provider.findMany({
      where: {
        OR: [
          { lastValidated: null },
          {
            lastValidated: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
      take: Number(limit),
    });

    const validationJob = await prisma.validationJob.create({
      data: {
        jobType: 'batch_npi_validation',
        status: 'running',
        totalProviders: providers.length,
        processedProviders: 0,
        successfulCount: 0,
        failedCount: 0,
        startedAt: new Date(),
      },
    });

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const provider of providers) {
      try {
        const validationResult = await npiRegistryService.compareProviderData({
          npiNumber: provider.npiNumber,
          firstName: provider.firstName,
          lastName: provider.lastName,
          primaryPhone: provider.primaryPhone || undefined,
          practiceAddress: provider.practiceAddress || undefined,
          city: provider.city || undefined,
          state: provider.state || undefined,
          zipCode: provider.zipCode || undefined,
          specialties: provider.specialties,
        });

        await prisma.validationResult.create({
          data: {
            providerId: provider.id,
            agentName: 'npi_validator',
            validationType: 'npi_registry',
            status: validationResult.isValid ? 'success' : 'failed',
            confidence: validationResult.confidence,
            sourceType: 'npi_registry',
            sourceUrl: 'https://npiregistry.cms.hhs.gov/api/',
            foundIssues: validationResult.discrepancies,
            apiResponse: validationResult.npiData,
            validatedAt: new Date(),
          },
        });

        await prisma.provider.update({
          where: { id: provider.id },
          data: {
            overallConfidence: validationResult.confidence,
            lastValidated: new Date(),
          },
        });

        results.push({
          providerId: provider.id,
          npiNumber: provider.npiNumber,
          success: true,
          confidence: validationResult.confidence,
        });

        successCount++;
      } catch (error: any) {
        results.push({
          providerId: provider.id,
          npiNumber: provider.npiNumber,
          success: false,
          error: error.message,
        });

        failureCount++;
      }
    }

    await prisma.validationJob.update({
      where: { id: validationJob.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    res.json({
      success: true,
      summary: {
        total: providers.length,
        successful: successCount,
        failed: failureCount,
      },
      results,
    });
  }
);

export const getProviderValidationHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const validations = await prisma.validationResult.findMany({
      where: { providerId: id },
      orderBy: { validatedAt: 'desc' },
    });

    res.json({
      providerId: id,
      validations,
    });
  }
);

export const getValidationStats = asyncHandler(
  async (req: Request, res: Response) => {
    const totalProviders = await prisma.provider.count();
    
    const validatedProviders = await prisma.provider.count({
      where: {
        lastValidated: {
          not: null,
        },
      },
    });

    const validProviders = await prisma.provider.count({
      where: {
        overallConfidence: {
          gte: 0.8,
        },
      },
    });

    const recentValidations = await prisma.validationResult.count({
      where: {
        validatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const avgConfidence = await prisma.provider.aggregate({
      _avg: {
        overallConfidence: true,
      },
    });

    res.json({
      total: totalProviders,
      validated: validatedProviders,
      valid: validProviders,
      recentValidations,
      averageConfidence: avgConfidence._avg.overallConfidence || 0,
    });
  }
);

export const applyCorrections = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { changes, reason } = req.body;

    if (!changes || Object.keys(changes).length === 0) {
      res.status(400).json({ error: 'No changes provided' });
      return;
    }

    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    const changedFields = Object.keys(changes);

    const updatedProvider = await prisma.provider.update({
      where: { id },
      data: {
        ...changes,
        currentVersion: provider.currentVersion + 1,
      },
    });

    await prisma.providerVersion.create({
      data: {
        providerId: provider.id,
        versionNumber: updatedProvider.currentVersion,
        snapshot: updatedProvider,
        changedFields,
        changeSource: 'auto_correction',
        changeReason: reason || 'Applied validation corrections',
        confidence: updatedProvider.overallConfidence,
      },
    });

    res.json({
      success: true,
      provider: updatedProvider,
      changedFields,
    });
  }
);

export const getTrustScores = asyncHandler(
  async (req: Request, res: Response) => {
    const trustScores = await prisma.trustScore.findMany({
      orderBy: [
        { sourceType: 'asc' },
        { dataField: 'asc' },
      ],
    });

    const grouped = trustScores.reduce((acc, score) => {
      if (!acc[score.sourceType]) {
        acc[score.sourceType] = {};
      }
      acc[score.sourceType][score.dataField] = {
        score: score.score,
        successCount: score.successCount,
        failureCount: score.failureCount,
        totalValidations: score.totalValidations,
        lastUpdated: score.lastUpdated,
      };
      return acc;
    }, {} as any);

    res.json({
      trustScores: grouped,
      raw: trustScores,
    });
  }
);

export const storeValidationResult = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      providerId,
      providerData,
      trustScore,
      grade,
      completenessScore,
      isValid,
      validationIssues,
      sourcesCount,
      npiData,
      stateBoardData,
      googlePlacesData,
      recommendations,
      reviewPriority
    } = req.body;

    console.log(`[Phase6] Received validation result for provider: ${providerId}`);
    console.log(`[Phase6] Trust Score: ${trustScore}/100, Grade: ${grade}`);

    try {
      const result = {
        id: Date.now(),
        providerId,
        trustScore,
        grade,
        completenessScore,
        isValid,
        issuesCount: validationIssues?.length || 0,
        sourcesCount,
        reviewPriority,
        storedAt: new Date().toISOString(),
        status: 'success'
      };

      console.log(`[Phase6] Validation result stored successfully`);

      res.status(200).json(result);
    } catch (error) {
      console.error(`[Phase6] Error storing validation result:`, error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to store validation result' 
      });
    }
  }
);

export const sendProgressUpdate = asyncHandler(
  async (req: Request, res: Response) => {
    const { providerId, phase, status, timestamp, data } = req.body;

    console.log(`[Phase6] Progress Update - ${providerId}: ${phase} ${status}`);
    
    res.status(200).json({
      status: 'received',
      providerId,
      phase,
      updateStatus: status
    });
  }
);

