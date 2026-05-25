import { BaseBusinessException } from './base-business.exception';

export class ConflictBusinessException extends BaseBusinessException {
  constructor(
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(409, errorCode, message, details ?? null);
  }
}
