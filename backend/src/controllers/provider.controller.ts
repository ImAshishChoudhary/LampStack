import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.util';

const prisma = new PrismaClient();

export const getAllProviders = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 50, 
    validated, 
    minConfidence,
    state,
    specialty 
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};
  
  if (validated !== undefined) {
    where.lastValidated = validated === 'true' ? { not: null } : null;
  }
  
  if (minConfidence) {
    where.overallConfidence = { gte: Number(minConfidence) };
  }
  
  if (state) {
    where.state = state;
  }
  
  if (specialty) {
    where.specialties = { has: specialty };
  }

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        validationResults: {
          take: 3,
          orderBy: { validatedAt: 'desc' }
        }
      }
    }),
    prisma.provider.count({ where })
  ]);

  res.json({
    success: true,
    data: providers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  });
});

export const getProviderStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    total,
    validated,
    highConfidence,
    avgConfidence,
    byState,
    bySpecialtyRaw,
    recentValidations
  ] = await Promise.all([
    prisma.provider.count(),
    prisma.provider.count({ where: { lastValidated: { not: null } } }),
    prisma.provider.count({ where: { overallConfidence: { gte: 0.8 } } }),
    prisma.provider.aggregate({
      _avg: { overallConfidence: true }
    }),
    prisma.provider.groupBy({
      by: ['state'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),
    prisma.$queryRaw`
      SELECT unnest(specialties) as specialty, COUNT(*) as count
      FROM "Provider"
      GROUP BY specialty
      ORDER BY count DESC
      LIMIT 10
    ` as Promise<any[]>,
    prisma.validationResult.count({
      where: {
        validatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  const bySpecialty = bySpecialtyRaw.map((item: any) => ({
    specialty: item.specialty,
    count: Number(item.count)
  }));

  res.json({
    success: true,
    data: {
      total,
      validated,
      needsReview: total - validated,
      highConfidence,
      averageConfidence: avgConfidence._avg.overallConfidence || 0,
      validationProgress: total > 0 ? ((validated / total) * 100).toFixed(1) : 0,
      byState: byState.map(s => ({ state: s.state, count: s._count.id })),
      bySpecialty,
      recentValidations
    }
  });
});

export const getProviderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 10
      },
      validationResults: {
        orderBy: { validatedAt: 'desc' },
        take: 20
      },
      feedbacks: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!provider) {
    res.status(404).json({
      success: false,
      message: 'Provider not found'
    });
    return;
  }

  res.json({
    success: true,
    data: provider
  });
});

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    fieldName, 
    originalValue, 
    correctedValue, 
    feedbackType,
    affectedSource,
    reviewerEmail,
    reviewerName,
    notes 
  } = req.body;

  const feedback = await prisma.humanFeedback.create({
    data: {
      providerId: id,
      fieldName,
      originalValue,
      correctedValue,
      feedbackType,
      affectedSource,
      reviewerEmail,
      reviewerName,
      notes,
      trustImpact: feedbackType === 'accept' ? 0.1 : feedbackType === 'reject' ? -0.1 : 0.05
    }
  });

  if (affectedSource) {
    const existingScore = await prisma.trustScore.findUnique({
      where: {
        sourceType_dataField: {
          sourceType: affectedSource,
          dataField: fieldName
        }
      }
    });

    if (existingScore) {
      const adjustment = feedbackType === 'accept' ? 0.02 : feedbackType === 'reject' ? -0.05 : 0.01;
      const newScore = Math.max(0.1, Math.min(1.0, existingScore.score + adjustment));

      await prisma.trustScore.update({
        where: { id: existingScore.id },
        data: {
          score: newScore,
          successCount: feedbackType === 'accept' ? { increment: 1 } : existingScore.successCount,
          failureCount: feedbackType === 'reject' ? { increment: 1 } : existingScore.failureCount,
          totalValidations: { increment: 1 },
          lastUpdated: new Date()
        }
      });
    }
  }

  if (correctedValue && feedbackType === 'correct') {
    await prisma.provider.update({
      where: { id },
      data: {
        [fieldName]: correctedValue,
        currentVersion: { increment: 1 }
      }
    });
  }

  res.json({
    success: true,
    data: feedback,
    message: 'Feedback submitted successfully'
  });
});

export const getValidationJobs = asyncHandler(async (req: Request, res: Response) => {
  const jobs = await prisma.validationJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  res.json({
    success: true,
    data: jobs
  });
});

export const getTrustScores = asyncHandler(async (req: Request, res: Response) => {
  const scores = await prisma.trustScore.findMany({
    orderBy: [
      { sourceType: 'asc' },
      { score: 'desc' }
    ]
  });

  const groupedScores = scores.reduce((acc: any, score) => {
    if (!acc[score.sourceType]) {
      acc[score.sourceType] = [];
    }
    acc[score.sourceType].push(score);
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      scores,
      bySource: groupedScores,
      summary: {
        totalSources: Object.keys(groupedScores).length,
        avgScore: scores.reduce((sum, s) => sum + s.score, 0) / scores.length || 0,
        highestReliability: scores.sort((a, b) => b.score - a.score)[0],
        lowestReliability: scores.sort((a, b) => a.score - b.score)[0]
      }
    }
  });
});
