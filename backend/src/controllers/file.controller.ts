import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { ValidationError } from '../types/error.types'

export class FileController {
    private static readonly INGESTION_SERVICE_URL = process.env.INGESTION_SERVICE_URL || 'python-ingestion:3001';

    static async upload(req: AuthRequest, res: Response, next: NextFunction) {

        if(!req.file){ return new ValidationError("No file uploaded") }

        const response = await fetch(`http://${this.INGESTION_SERVICE_URL}`)

    }
}
