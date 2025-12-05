export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly shouldExposeToClient: boolean;
  public readonly clientMessage?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    shouldExposeToClient: boolean = false,
    clientMessage?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.shouldExposeToClient = shouldExposeToClient;
    this.clientMessage = clientMessage;
    
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}


export class ProcessingError extends ApiError {
  constructor(message: string, statusCode: number = 500) {
    super(
      message,
      statusCode,
      true,
      false,
      'processing failed! please try again later.'
    );
    Object.setPrototypeOf(this, ProcessingError.prototype);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, true, true, message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true, true, message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404, true, true, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
