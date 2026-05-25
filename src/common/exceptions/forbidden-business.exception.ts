import { BaseBusinessException } from './base-business.exception';

export class ForbiddenBusinessException extends BaseBusinessException {
  constructor(
    errorCode: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(403, errorCode, message, details ?? null);
  }
}
