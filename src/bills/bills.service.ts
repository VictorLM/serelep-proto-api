import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { get } from 'lodash';
import { Model, Types } from 'mongoose';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { JobsService } from '../jobs/jobs.service';
import { JobDocument } from '../jobs/model/job.schema';
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
    const { type, subType, payed, overdue, search, orderBy } = billQueryDTO || {};
    const query = this.billModel.find().populate('job');

    if (type) {
      query.where('type', BillTypes[type]);
    }

    if (subType) {
      query.where('subType', BillSubTypes[subType]);
    }

    if (overdue) {
      query.where({
        dueDate: { $lt: new Date(Date.now()) }
      });
      query.where({ payed: null });
    } else if(payed) {
      query.where({ payed: { $ne: null } });
    }

    if (search) {
      query.where({ name: { $regex: '.*' + search + '.*', $options: 'i' } });
    }

    if (orderBy && orderBy === 'ASC') {
      query.sort({ dueDate: 1 });
    } else {
      query.sort({ dueDate: -1 });
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

  async getBillsByJob(job: JobDocument): Promise<BillDocument[]> {
    return await this.billModel.find({ job });
  }

  async getExpectedBillsAmount(month: number, year: number): Promise<number> {
    const date = new Date(`${year}-${String(month).length < 2 ? '0' + month : month}-01`);
    const minDueDate = new Date(`${year}-${String(month).length < 2 ? '0' + month : month}-01`);
    const maxDueDatePlusOneDay = new Date(date.setMonth(minDueDate.getMonth() + 2, 0));

    const expectedFixedBills = await this.billModel.aggregate([
      {
        $match: {
          type: BillTypes.FIXED,
        },
      },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    const expectedVariableBills = await this.billModel.aggregate([
      {
        $match: {
          type: BillTypes.VARIABLE,
          // payed: null, // SOLICTAÇÃO DO JOW ...
          dueDate: {
            $gte: minDueDate, // SOLICTAÇÃO DO JOW ...
            $lt: maxDueDatePlusOneDay,
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    const amount: number = Number(get(expectedFixedBills, '[0].total', 0)) + Number(get(expectedVariableBills, '[0].total', 0));

    return amount;
  }

  async createBill(billDTO: BillDTO): Promise<BillDocument> {
    const { name, type, subType, value, dueDate, job, notes } = billDTO;

    if(type === BillTypes.VARIABLE && job) {
      await this.jobsService.getJobById(job);
    }

    const newBill = new this.billModel({
      name,
      type: BillTypes[type],
      subType: BillSubTypes[subType],
      value,
      dueDate: type === BillTypes.VARIABLE ? new Date(dueDate) : null,
      job: type === BillTypes.VARIABLE ? job : null,
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

    if(type === BillTypes.VARIABLE && job && get(foundBill, 'job._id', null) !== job) {
      const foundJob = await this.jobsService.getJobById(job);
      foundBill.job = foundJob;
    } else {
      foundBill.job = null;
    }

    foundBill.name = name;
    foundBill.type = BillTypes[type];
    foundBill.subType = BillSubTypes[subType];
    foundBill.value = value;
    foundBill.dueDate = type === BillTypes.VARIABLE ? new Date(dueDate) : null,
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
    // TODO - SE DELETAR FIXED BILL VAI FERRAR COM OS VALORES MESES PASSADOS
    // TODO - Alterar para inserir um novo em caso de alteração, para manter o hitórico
    // Ai pego o valor do mais novo para as novas projeções
    const foundBill = await this.getBillById(mongoIdDTO.id);

    try {
      await foundBill.delete();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao excluir Despesa. Por favor, tente novamente mais tarde');
    }
  }

}
