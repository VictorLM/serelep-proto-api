import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { JobDocument } from '../jobs/model/job.schema';
import { PaymentDTO, UpdatePaymentDTO } from './dto/payment.dto';
import { PaymentsQueryDTO } from './dto/payments-query.dto';
import { Payment, PaymentDocument } from './model/payment.schema';
import { get } from 'lodash';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async getPayments(paymentsQueryDTO: PaymentsQueryDTO): Promise<PaymentDocument[]> {
    const { overdue, payed, search, orderBy } = paymentsQueryDTO || {};
    const query = this.paymentModel.find().populate('job');

    if (overdue) {
      query.where({
        dueDate: { $lt: new Date(Date.now()) }
      });
      query.where({ payed: null });
    } else if(payed) {
      query.where({ payed: { $ne: null } });
    }

    if (search) {
      query.where({ notes: { $regex: '.*' + search + '.*', $options: 'i' } });
    }

    if (orderBy && orderBy === 'DESC') {
      query.sort({ dueDate: -1 });
    } else {
      query.sort({ dueDate: 1 });
    }

    return await query.exec();
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

  async getExpectedPaymentsAmount(month: number, year: number): Promise<number> {
    const date = new Date(`${year}-${String(month).length < 2 ? '0' + month : month}-01`);
    const minDueDate = new Date(`${year}-${String(month).length < 2 ? '0' + month : month}-01`);
    const maxDueDatePlusOneDay = new Date(date.setMonth(minDueDate.getMonth() + 1, 0));  // Em produção no Linux o +2 estava dando pau
    const expectedPayments = await this.paymentModel.aggregate([
      {
        $match: {
           dueDate: {
            $gte: minDueDate,
            $lt: maxDueDatePlusOneDay,
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    const amount: number = get(expectedPayments, '[0].total', 0);

    return amount;
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

  // async createSoloPayment(
  //   paymentDTO: PaymentDTO,
  //   jobID: Types.ObjectId,
  // ): Promise<void> {
  //   const { value, dueDate, notes } = paymentDTO;

  //   const foundJob = await this.jobsService.getJobById(jobID);

  //   const newPaymemt = new this.paymentModel({ job: jobID, value, dueDate, notes });

  //   foundJob.payments = [...foundJob.payments, newPaymemt];
  //   newPaymemt.save();

  //   try {
  //     foundJob.save();

  //   } catch (error) {
  //     console.log(error);
  //     throw new InternalServerErrorException('Erro ao cadastrar novo Pagamento. Por favor, tente novamente mais tarde');
  //   }
  // }

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

  async updatePayment(
    mongoIdDTO: MongoIdDTO,
    updatePaymentDTO: UpdatePaymentDTO,
  ): Promise<PaymentDocument> {
    const { value, dueDate, notes, payed } = updatePaymentDTO;
    const foundPayment = await this.getPaymentById(mongoIdDTO.id);

    foundPayment.value = value;
    foundPayment.dueDate = new Date(dueDate);
    foundPayment.notes = notes;
    foundPayment.payed = payed ? new Date(payed) : null;

    try {
      return await foundPayment.save();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao atualizar Pagamento. Por favor, tente novamente mais tarde');
    }
  }

  async deletePayment(mongoIdDTO: MongoIdDTO): Promise<void> {
    const foundPayment = await this.getPaymentById(mongoIdDTO.id);

    try {
      await foundPayment.delete();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao excluir Pagamento. Por favor, tente novamente mais tarde');
    }
  }

  async deletePaymentsByJob(job: JobDocument): Promise<void> {
    try {
      await this.paymentModel.deleteMany({ job });

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao excluir Pagamentos relacionados ao Job. Por favor, tente novamente mais tarde');
    }
  }

}
