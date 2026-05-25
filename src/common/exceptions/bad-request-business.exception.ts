import { BaseBusinessException } from './base-business.exception';

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

export class BadRequestBusinessException extends BaseBusinessException {
  constructor(
    errorCode: string,
    message: string,
    fieldErrors?: FieldError[],
    details?: Record<string, unknown>,
  ) {
    const mergedDetails =
      fieldErrors && fieldErrors.length > 0
        ? { ...(details ?? {}), fields: fieldErrors }
        : (details ?? null);
    super(400, errorCode, message, mergedDetails);
  }
}
