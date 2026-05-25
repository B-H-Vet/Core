import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(
    message: string,
    public readonly validationErrors: unknown[],
  ) {
    super(message);
  }
}
