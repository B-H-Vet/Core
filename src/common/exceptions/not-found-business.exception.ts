import { BaseBusinessException } from './base-business.exception';

export class NotFoundBusinessException extends BaseBusinessException {
  constructor(
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(404, errorCode, message, details ?? null);
  }
}
