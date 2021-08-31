import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { UpdatePaymentDTO } from './dto/payment.dto';
import { PaymentsQueryDTO } from './dto/payments-query.dto';
import { PaymentDocument } from './model/payment.schema';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('/')
  getPayments(
    @Query(new ValidationPipe({ transform: true })) paymentsQueryDTO: PaymentsQueryDTO,
  ): Promise<PaymentDocument[]> {
    return this.paymentsService.getPayments(paymentsQueryDTO);
  }

  @Get('/:id')
  getPaymentById(@Param() mongoIdDTO: MongoIdDTO): Promise<PaymentDocument> {
    return this.paymentsService.getPaymentById(mongoIdDTO.id);
  }

  @Patch('/:id')
  updatePayment(
    @Param() mongoIdDTO: MongoIdDTO,
    @Body() updatePaymentDTO: UpdatePaymentDTO,
  ): Promise<PaymentDocument> {
    return this.paymentsService.updatePayment(mongoIdDTO, updatePaymentDTO);
  }

  @Delete('/:id')
  deletePayment(@Param() mongoIdDTO: MongoIdDTO): Promise<void> {
    return this.paymentsService.deletePayment(mongoIdDTO);
  }

}
