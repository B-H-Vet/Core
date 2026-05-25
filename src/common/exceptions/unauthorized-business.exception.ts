import { BaseBusinessException } from './base-business.exception';

export class UnauthorizedBusinessException extends BaseBusinessException {
  constructor(
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(401, errorCode, message, details ?? null);
  }
}
