import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreatePaymentDto } from '../dto/create-payment.dto';

import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../repositories/payment.repository.interface';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async create(dto: CreatePaymentDto) {
    /**
     * Simulación de pago aprobado.
     * Si luego integran pasarela real, aquí se valida la respuesta
     * del proveedor antes de guardar APPROVED.
     */
    if (dto.amount <= 0) {
      throw new BadRequestException(
        'El valor del pago debe ser mayor a cero',
      );
    }

    return this.paymentRepository.create({
      user_id: dto.user_id,
      amount: String(dto.amount),
      method: dto.method,
      status: 'APPROVED',
      transaction_reference:
        dto.transaction_reference ?? `BH-${Date.now()}`,
    });
  }

  async findById(id: number) {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundException('El pago ingresado no fue encontrado');
    }

    return payment;
  }

  async validateApprovedPayment(data: {
    paymentId: number;
    expectedAmount: number;
    userId: number;
  }) {
    const payment = await this.paymentRepository.findApprovedById(
      data.paymentId,
    );

    if (!payment) {
      throw new BadRequestException(
        'El pago no existe o no está aprobado',
      );
    }

    if (payment.user_id !== data.userId) {
      throw new BadRequestException(
        'El pago no pertenece al usuario de la cita',
      );
    }

    if (Number(payment.amount) !== Number(data.expectedAmount)) {
      throw new BadRequestException(
        'El valor pagado no coincide con el valor total de la cita',
      );
    }

    return payment;
  }
}