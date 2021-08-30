import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobDocument } from '../jobs/model/job.schema';
import { PaymentDTO } from './dto/payment.dto';
import { Payment, PaymentDocument } from './model/payment.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async getPayments(): Promise<PaymentDocument[]> {
    return await this.paymentModel.find().populate('job').sort('-createdAt');
  }

  async getPaymentById(id: Types.ObjectId): Promise<PaymentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID "${id}" inválido`);
    }
    const found = await this.paymentModel.findById(id).populate('job');

    if (!found) {
      throw new NotFoundException(`Pagamento com ID "${id}" não encontrado`);
    }
    return found;
  }

  async deletePaymentsByJob(job: JobDocument): Promise<void> {
    try {
      await this.paymentModel.deleteMany({ job });

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao excluir Pagamentos relacionados ao Job. Por favor, tente novamente mais tarde');
    }
  }

  async createPayment(
    paymentDTO: PaymentDTO,
    jobID: Types.ObjectId,
  ): Promise<PaymentDocument> {
    const { value, dueDate, notes } = paymentDTO;
    const newPaymemt = new this.paymentModel({ job: jobID, value, dueDate, notes });

    try {
      return await newPaymemt.save();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao cadastrar novo Pagamento. Por favor, tente novamente mais tarde');
    }
  }

  async createPayments(
    paymentsDTO: PaymentDTO[],
    jobID: Types.ObjectId,
  ): Promise<PaymentDocument[]> {
    const newPayments: PaymentDocument[] = await Promise.all(
      paymentsDTO.map(async (paymentDTO) => (
        await this.createPayment(paymentDTO, jobID)
      )),
    );

    return newPayments;
  }

}
