import { Request, Response } from 'express';
import { agentService } from '../services/agentService';
import { asyncHandler } from '../utils/asyncHandler.util';
import prisma from '../prisma/client';

export const startValidation = asyncHandler(async (req: Request, res: Response) => {
  const { providerId } = req.params;

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }

  const fullName = `${provider.firstName} ${provider.middleName || ''} ${provider.lastName}`.trim();
  const result = await agentService.validateProvider({
    provider_id: provider.id,
    npi: provider.npiNumber || undefined,
    name: fullName,
    license_number: provider.licenseNumbers?.[0] || undefined,
    license_state: provider.state || undefined,
    specialty: provider.specialties?.[0] || undefined,
    phone: provider.primaryPhone || undefined,
    email: provider.email || undefined,
    address: provider.practiceAddress || undefined,
    city: provider.city || undefined,
    state: provider.state || undefined,
    zip_code: provider.zipCode || undefined,
  });

  res.json(result);
});

export const getJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  try {
    const result = await agentService.getValidationResult(jobId);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Job not found') {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    throw error;
  }
});

export const validateAndSave = asyncHandler(async (req: Request, res: Response) => {
  const { providerId } = req.params;

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }

  const fullName = `${provider.firstName} ${provider.middleName || ''} ${provider.lastName}`.trim();
  const validationResult = await agentService.validateProviderSync({
    provider_id: provider.id,
    npi: provider.npiNumber || undefined,
    name: fullName,
    license_number: provider.licenseNumbers?.[0] || undefined,
    license_state: provider.state || undefined,
    specialty: provider.specialties?.[0] || undefined,
    phone: provider.primaryPhone || undefined,
    email: provider.email || undefined,
    address: provider.practiceAddress || undefined,
    city: provider.city || undefined,
    state: provider.state || undefined,
    zip_code: provider.zipCode || undefined,
  });

  const savedResult = await prisma.validationResult.create({
    data: {
      providerId: provider.id,
      agentName: 'LangGraph_Orchestrator',
      validationType: 'multi_agent_validation',
      status: validationResult.is_valid ? 'success' : 'needs_review',
      confidence: validationResult.trust_score / 100,
      sourceType: 'multi_source',
      foundIssues: validationResult.validation_issues.map(i => `[${i.severity}] ${i.field}: ${i.description}`),
      suggestedFixes: {
        grade: validationResult.grade,
        completeness_score: validationResult.completeness_score,
        recommendations: validationResult.recommendations,
        enriched_data: validationResult.enriched_data,
        processing_time: validationResult.processing_time,
      },
    },
  });

  if (validationResult.enriched_data) {
    const enriched = validationResult.enriched_data;
    const nameParts = enriched.name?.split(' ') || [];
    
    await prisma.provider.update({
      where: { id: providerId },
      data: {
        npiNumber: enriched.npi || provider.npiNumber,
        firstName: nameParts[0] || provider.firstName,
        lastName: nameParts[nameParts.length - 1] || provider.lastName,
        middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : provider.middleName,
        specialties: enriched.specialty ? [enriched.specialty] : provider.specialties,
        primaryPhone: enriched.phone || provider.primaryPhone,
        email: enriched.email || provider.email,
        practiceAddress: enriched.address || provider.practiceAddress,
        city: enriched.city || provider.city,
        state: enriched.state || provider.state,
        zipCode: enriched.zip_code || provider.zipCode,
        licenseNumbers: enriched.license_number ? [enriched.license_number] : provider.licenseNumbers,
        overallConfidence: validationResult.trust_score / 100,
        lastValidated: new Date(),
      },
    });
  }

  res.json({
    validation: savedResult,
    result: validationResult,
  });
});

export const listJobs = asyncHandler(async (req: Request, res: Response) => {
  const jobs = await agentService.listJobs();
  res.json(jobs);
});

export const agentHealthCheck = asyncHandler(async (req: Request, res: Response) => {
  const isHealthy = await agentService.healthCheck();
  
  res.json({
    agent_service: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
  });
});
