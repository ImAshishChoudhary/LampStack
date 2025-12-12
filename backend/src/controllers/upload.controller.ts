import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { asyncHandler } from '../utils/asyncHandler.util';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (allowedTypes.includes(file.mimetype) || ext === 'csv') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  },
});

interface ProviderCSVRow {
  npi?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  specialty?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiry?: string;
  [key: string]: string | undefined;
}

function parseCSV(buffer: Buffer): Promise<ProviderCSVRow[]> {
  return new Promise((resolve, reject) => {
    const results: ProviderCSVRow[] = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

export const uploadProviderFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const startTime = Date.now();
  console.log(`[UPLOAD] Received file: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB)`);

  try {
    console.log('[UPLOAD] Parsing CSV...');
    const rows = await parseCSV(req.file.buffer);
    console.log(`[UPLOAD] Parsed ${rows.length} rows`);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    const providers = rows.map((row) => {
      const npiNumber = row.npi || row.NPI || `NPI${Math.random().toString().slice(2, 12)}`;
      const firstName = row.firstName || row.first_name || row.name?.split(' ')[0] || 'Unknown';
      const lastName = row.lastName || row.last_name || row.name?.split(' ').slice(1).join(' ') || 'Provider';

      return {
        npiNumber,
        firstName,
        lastName,
        middleName: null,
        credentials: null,
        primaryPhone: row.phone || row.Phone || null,
        secondaryPhone: null,
        email: row.email || row.Email || null,
        faxNumber: null,
        practiceAddress: row.address || row.Address || null,
        city: row.city || row.City || null,
        state: row.state || row.State || null,
        zipCode: row.zipCode || row.zip_code || row.zip || null,
        country: 'USA',
        specialties: row.specialty ? [row.specialty] : [],
        taxonomyCode: null,
        licenseNumbers: (row.licenseNumber || row.license) ? [row.licenseNumber || row.license].filter(Boolean) as string[] : [],
        insuranceNetworks: [],
        hospitalAffiliations: [],
        isActive: true,
        lastValidated: null,
        overallConfidence: 0.0,
      };
    });

    console.log('[UPLOAD] Storing in database...');
    const created = await prisma.provider.createMany({
      data: providers,
      skipDuplicates: true,
    });
    console.log(`[UPLOAD] Stored ${created.count} new providers (${rows.length - created.count} duplicates)`);

    const duration = Date.now() - startTime;
    console.log(`[UPLOAD] Complete in ${duration}ms`);

    return res.json({
      success: true,
      message: 'File uploaded and stored successfully',
      stats: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        totalRows: rows.length,
        newRecords: created.count,
        duplicatesSkipped: rows.length - created.count,
        duration: `${duration}ms`,
      },
      fileContent: req.file.buffer.toString('utf-8'),
    });

  } catch (error: any) {
    console.error('[UPLOAD] Error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to process file', 
      details: error.message 
    });
  }
});

export const getUploadHistory = asyncHandler(async (req: Request, res: Response) => {
  const count = await prisma.provider.count();
  
  return res.json({
    uploads: [],
    totalProviders: count,
  });
});
