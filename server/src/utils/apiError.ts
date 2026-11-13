export class ApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details?: any) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message: string = 'Unauthorized access') {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden resource') {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message: string, details?: any) {
    return new ApiError(409, message, details);
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message);
  }
}
