import { BaseBusinessException } from './base-business.exception';

export class InternalServerBusinessException extends BaseBusinessException {
  constructor(
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(500, errorCode, message, details ?? null);
  }
}
