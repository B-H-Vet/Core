import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoiceCalculationService {
  calculateLineFinalPrice(
    unitPrice: number,
    quantity: number,
    discountPercent: number,
  ): number {
    const base = unitPrice * quantity;
    return Number((base * (1 - discountPercent / 100)).toFixed(2));
  }

  calculatePaidAmount(servicePrices: number[]): number {
    return servicePrices.reduce((acc, price) => acc + price, 0);
  }

  calculateInvoiceTotals(
    paidAmount: number,
    lines: { finalPrice: number; basePrice: number }[],
  ): {
    subtotalUnpaid: number;
    discountTotal: number;
    totalAmount: number;
    remainingAmount: number;
  } {
    const subtotalUnpaid = lines.reduce((acc, line) => acc + line.basePrice, 0);
    const finalUnpaid = lines.reduce((acc, line) => acc + line.finalPrice, 0);
    const discountTotal = Number((subtotalUnpaid - finalUnpaid).toFixed(2));
    const totalAmount = Number((paidAmount + finalUnpaid).toFixed(2));
    const remainingAmount = Number((totalAmount - paidAmount).toFixed(2));

    return {
      subtotalUnpaid: Number(subtotalUnpaid.toFixed(2)),
      discountTotal,
      totalAmount,
      remainingAmount,
    };
  }
}
