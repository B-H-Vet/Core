import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConsoleLogger,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { BaseBusinessException, ValidationException } from '../exceptions';

interface ValidationErrorItem {
  property: string;
  constraints?: Record<string, string>;
  children?: unknown[];
}

interface ErrorResponseBody {
  statusCode: number;
  errorCode: string;
  message: string;
  details: Record<string, unknown> | null;
  timestamp: string;
}

@Catch()
export class BusinessExceptionFilter implements ExceptionFilter {
  private readonly logger = new ConsoleLogger(BusinessExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorData = this.extractErrorData(exception);

    if (errorData.statusCode === 500) {
      const request = ctx.getRequest<Request>();
      this.logInternalError(exception, request);
    }

    const body: ErrorResponseBody = {
      statusCode: errorData.statusCode,
      errorCode: errorData.errorCode,
      message: errorData.message,
      details: errorData.details,
      timestamp: new Date().toISOString(),
    };

    response.status(errorData.statusCode).json(body);
  }

  private logInternalError(exception: unknown, request: Request): void {
    const method = request.method;
    const url = request.url;

    if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception on ${method} ${url}: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `Unhandled exception on ${method} ${url}: ${String(exception)}`,
      );
    }
  }

  private extractErrorData(exception: unknown): {
    statusCode: number;
    errorCode: string;
    message: string;
    details: Record<string, unknown> | null;
  } {
    if (exception instanceof BaseBusinessException) {
      return {
        statusCode: exception.statusCode,
        errorCode: exception.errorCode,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof NotFoundException) {
      return {
        statusCode: 404,
        errorCode: 'NOT_FOUND',
        message: exception.message || 'Recurso no encontrado',
        details: null,
      };
    }

    if (exception instanceof ValidationException) {
      const fields = this.mapValidationErrors(exception.validationErrors);
      return {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        message: exception.message,
        details: { fields },
      };
    }

    if (exception instanceof BadRequestException) {
      return this.extractBadRequestData(exception);
    }

    if (exception instanceof ForbiddenException) {
      return {
        statusCode: 403,
        errorCode: 'FORBIDDEN',
        message: exception.message || 'Acceso denegado',
        details: null,
      };
    }

    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        errorCode: 'HTTP_ERROR',
        message: exception.message,
        details: null,
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: 500,
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Ocurrió un error inesperado en el servidor',
        details: null,
      };
    }

    return {
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'Ocurrió un error inesperado en el servidor',
      details: null,
    };
  }

  private extractBadRequestData(exception: BadRequestException): {
    statusCode: number;
    errorCode: string;
    message: string;
    details: Record<string, unknown> | null;
  } {
    const res = exception.getResponse();
    let message = 'Solicitud inválida';
    let details: Record<string, unknown> | null = null;

    if (typeof res === 'string') {
      message = res;
    } else if (typeof res === 'object') {
      const resObj = res as Record<string, unknown>;
      if (typeof resObj.message === 'string') {
        message = resObj.message;
      }

      if (Array.isArray(resObj.message)) {
        const fields = this.mapValidationErrors(resObj.message);
        details = { fields };
      } else if (resObj.message !== undefined) {
        details = { message: resObj.message };
      }
    }

    return {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      message,
      details,
    };
  }

  private mapValidationErrors(
    errors: unknown[],
  ): { field: string; message: string; code: string }[] {
    const result: { field: string; message: string; code: string }[] = [];

    for (const error of errors) {
      result.push(...this.mapSingleValidationError(error));
    }

    return result;
  }

  private mapSingleValidationError(
    error: unknown,
  ): { field: string; message: string; code: string }[] {
    if (typeof error === 'string') {
      return [{ field: 'general', message: error, code: 'unknown' }];
    }

    if (typeof error !== 'object' || error === null || !('property' in error)) {
      return [];
    }

    const e = error as ValidationErrorItem;
    const results: { field: string; message: string; code: string }[] = [];

    if (e.constraints) {
      for (const [code, msg] of Object.entries(e.constraints)) {
        results.push({ field: e.property, message: msg, code });
      }
    }

    if (e.children && e.children.length > 0) {
      results.push(...this.mapValidationErrors(e.children));
    }

    return results;
  }
}
