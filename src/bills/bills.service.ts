import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { JobsService } from '../jobs/jobs.service';
import { BillDTO, UpdateBillDTO } from './dto/bill.dto';
import { BillQueryDTO } from './dto/bills-query.dto';
import { BillSubTypes } from './enum/bill-sub-types.enum';
import { BillTypes } from './enum/bill-types.enum';
import { Bill, BillDocument } from './model/bill.schema';

@Injectable()
export class BillsService {
  constructor(
    @InjectModel(Bill.name) private billModel: Model<BillDocument>,
    @Inject(forwardRef(() => JobsService))
    private jobsService: JobsService,
  ) {}

  // TODO - Quando alterar valor de uma despesas fixa, vai alterar os valores das métricas dos meses anteriores

  async getBills(billQueryDTO: BillQueryDTO): Promise<BillDocument[]> {
    const { type, subType, payed, search, orderBy } = billQueryDTO || {};
    const query = this.billModel.find().populate('job');

    if (type) {
      query.where('type', BillTypes[type]);
    }

    if (subType) {
      query.where('subType', BillSubTypes[subType]);
    }

    if (payed !== undefined && payed) {
      query.where({ payed: { $ne: null } });
    } else if (payed !== undefined && !payed) {
      query.where({ payed: null });
    }

    if (search) {
      query.where({ name: { $regex: '.*' + search + '.*' } });
    }

    if (orderBy && orderBy === 'DESC') {
      query.sort('-1');
    } else {
      query.sort('1');
    }

    return await query.exec();
  }

  async getBillById(id: Types.ObjectId): Promise<BillDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID "${id}" inválido`);
    }
    const found = await this.billModel.findById(id).populate('job');

    if (!found) {
      throw new NotFoundException(`Despesa com ID "${id}" não encontrado`);
    }
    return found;
  }

  async createBill(billDTO: BillDTO): Promise<BillDocument> {
    const { name, type, subType, value, dueDate, job, notes } = billDTO;

    if(job) {
      await this.jobsService.getJobById(job);
    }

    const newBill = new this.billModel({
      name,
      type,
      subType,
      value,
      dueDate,
      job,
      notes,
    });

    try {
      return await newBill.save();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Erro ao cadastrar nova Despesa. Por favor, tente novamente mais tarde',
      );
    }
  }

  async updateBill(
    mongoIdDTO: MongoIdDTO,
    updateBillDTO: UpdateBillDTO,
  ): Promise<BillDocument> {
    const { name, type, subType, value, dueDate, job, notes, payed } = updateBillDTO;
    const foundBill = await this.getBillById(mongoIdDTO.id);

    if(job && foundBill.job._id !== job) {
      const foundJob = await this.jobsService.getJobById(job);
      foundBill.job = foundJob;
    }

    foundBill.name = name;
    foundBill.type = BillTypes[type];
    foundBill.subType = BillSubTypes[subType];
    foundBill.value = value;
    foundBill.dueDate = new Date(dueDate);
    foundBill.notes = notes;
    foundBill.payed = payed ? new Date(payed) : null;

    try {
      return await foundBill.save();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao atualizar Despesa. Por favor, tente novamente mais tarde');
    }
  }

  async deleteBill(mongoIdDTO: MongoIdDTO): Promise<void> {
    const foundBill = await this.getBillById(mongoIdDTO.id);

    try {
      await foundBill.delete();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao excluir Despesa. Por favor, tente novamente mais tarde');
    }
  }

}
