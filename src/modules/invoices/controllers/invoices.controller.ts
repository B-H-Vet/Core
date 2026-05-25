import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { CurrentUserPayload } from '../../../common/types/current-user.type';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AddAdditionalServiceDto } from '../dto/add-additional-service.dto';
import { ApplyDiscountDto } from '../dto/apply-discount.dto';
import { CancelInvoiceDto } from '../dto/cancel-invoice.dto';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { InvoicesService } from '../services/invoices.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles('RECEPCIONISTA', 'ADMINISTRADOR')
  create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoicesService.create(dto, user);
  }

  @Get()
  @Roles('CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMINISTRADOR')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    if (!user) {
      throw new UnauthorizedException('User is required');
    }
    return this.invoicesService.findAll(
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      },
      user,
    );
  }

  @Get(':id')
  @Roles('CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMINISTRADOR')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoicesService.findById(id, user);
  }

  @Post(':id/additional-services')
  @Roles('RECEPCIONISTA', 'ADMINISTRADOR')
  addAdditionalService(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddAdditionalServiceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoicesService.addAdditionalService(id, dto, user);
  }

  @Patch(':id/additional-services/:serviceId/discount')
  @Roles('RECEPCIONISTA', 'ADMINISTRADOR')
  applyDiscountToAdditionalService(
    @Param('id', ParseIntPipe) id: number,
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Body() dto: ApplyDiscountDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoicesService.applyDiscountToAdditionalService(
      id,
      serviceId,
      dto,
      user,
    );
  }

  @Post(':id/request-payment')
  @Roles('CLIENTE')
  requestPayment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoicesService.requestPayment(id, user);
  }

  @Get(':id/pdf')
  @Roles('CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMINISTRADOR')
  async downloadPdf(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.invoicesService.downloadInvoicePdf(id, user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="factura-${id.toString()}.pdf"`,
    });
    return res.send(pdfBuffer);
  }

  @Get('pay/:token')
  @Public()
  payInvoice(@Param('token') token: string) {
    return this.invoicesService.payInvoice(token);
  }

  @Post(':id/cancel')
  @Roles('RECEPCIONISTA', 'ADMINISTRADOR')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelInvoiceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoicesService.cancel(id, dto, user);
  }
}
