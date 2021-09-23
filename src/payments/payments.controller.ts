import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { PaymentDTO, UpdatePaymentDTO } from './dto/payment.dto';
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

  // @Post('/')
  // createPayment(
  //   @Body() paymentDTO: PaymentDTO,
  //   @Body() jobID: MongoIdDTO,
  // ): Promise<PaymentDocument> {
  //   return this.paymentsService.createPayment(paymentDTO, jobID.id);
  // }

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
