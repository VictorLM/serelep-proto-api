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
import { BillsService } from '../bills/bills.service';
import { BillDocument } from '../bills/model/bill.schema';
import { CustomersService } from '../customers/customers.service';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { DashboardJobsData, JobsByStatus, JobsByType } from '../globals/interfaces/dashboard-data.interface';
import { PaymentsService } from '../payments/payments.service';
import { CreateJobNoteDTO } from './dto/create-job-notes.dto';
import { CreateJobDTO, NewJobDTO, UpdateJobDTO } from './dto/job.dto';
import { JobsQueryDTO } from './dto/jobs-query.dto';
import { JobStatus } from './enum/job-status.enum';
import { JobNote } from './interface/job-note.interface';
import { Job, JobDocument } from './model/job.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private paymentsService: PaymentsService,
    private customersService: CustomersService,
    @Inject(forwardRef(() => BillsService))
    private billsService: BillsService,
  ) {}

  async getJobs(jobsQueryDTO: JobsQueryDTO): Promise<JobDocument[]> {
    const { status, types, search, orderBy } = jobsQueryDTO || {};
    const query = this.jobModel.find().populate('customer payments');

    if (status) {
      query.where('status', JobStatus[status]);
    }

    if (types) {
      query.where({ types: { $in: types }});
    }

    if (search) {
      query.where({ name: { $regex: '.*' + search + '.*' } });
    }

    if (orderBy && orderBy === 'DESC') {
      query.sort({ createdAt: -1 });
    } else {
      query.sort({ createdAt: 1 });
    }

    return await query.exec();
  }

  async getJobById(id: Types.ObjectId): Promise<JobDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID "${id}" inválido`);
    }
    const found = await this.jobModel.findById(id).populate('customer payments');

    if (!found) {
      throw new NotFoundException(`Job com ID "${id}" não encontrado`);
    }

    return found;
  }

  async getJobByIdWithBills(
    id: Types.ObjectId
  ): Promise<{ job: JobDocument, bills: BillDocument[] }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID "${id}" inválido`);
    }
    const foundJob = await this.jobModel.findById(id).populate('customer payments');

    if (!foundJob) {
      throw new NotFoundException(`Job com ID "${id}" não encontrado`);
    }

    const bills = await this.billsService.getBillsByJob(foundJob);

    return { job: foundJob, bills };
  }

  async getJobsByPeriodCounts(month: number, year: number): Promise<DashboardJobsData> {
    const date = new Date(`${year}-${String(month).length < 2 ? '0' + month : month}-01`);
    const minDate = new Date(`${year}-${String(month).length < 2 ? '0' + month : month}-01`);
    const maxDatePlusOneDay = new Date(date.setMonth(minDate.getMonth() + 2, 0));

    const jobsByPeriodTypesCount = await this.jobModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: minDate,
            $lt: maxDatePlusOneDay,
          },
        },
      },
      {
        $unwind: "$types",
      },
      {
        $group: {
          _id: "$types",
          count: { $sum: 1 },
        }
      },
    ]);

    const jobsByPeriodStatusCount = await this.jobModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: minDate,
            $lt: maxDatePlusOneDay,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        }
      },
    ]);

    const byType: JobsByType = {
      'VISUAL_IDENTITY': 0,
      'BRAND_DESIGN': 0,
      'PACKAGING_DESIGN': 0,
      'NAMING': 0,
      'OTHERS': 0,
    };

    jobsByPeriodTypesCount.forEach((count) => {
      byType[count._id] = Number(count.count);
    });

    const byStatus: JobsByStatus = {
      'OPEN': 0,
      'DONE': 0,
    };

    jobsByPeriodStatusCount.forEach((count) => {
      byStatus[count._id] = Number(count.count);
    });

    const dashboardJobsData: DashboardJobsData = {
      month,
      year,
      jobs: {
        byType,
        byStatus,
      }
    };

    return dashboardJobsData;
  }

  async newJob(newJobDTO: NewJobDTO): Promise<JobDocument> {
    const { name, customer, types, description, payments } = newJobDTO;

    await this.customersService.getCustomerById(customer);

    const newJob = await this.createJob({ name, customer, types, description });
    const newPayments = await this.paymentsService.createPayments(payments, newJob._id);
    newJob.payments = newPayments;

    try {
      return await newJob.save();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao cadastrar novo Job. Por favor, tente novamente mais tarde');
    }
  }

  async createJob(createJobDTO: CreateJobDTO): Promise<JobDocument> {
    const { name, customer, types, description } = createJobDTO;
    const newJob = new this.jobModel({ name, customer, types, description });

    try {
      return await newJob.save();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao cadastrar novo Job. Por favor, tente novamente mais tarde');
    }
  }

  async createJobNote(
    mongoIdDTO: MongoIdDTO,
    createJobNoteDTO: CreateJobNoteDTO,
  ): Promise<JobNote> {
    const foundJob = await this.getJobById(mongoIdDTO.id);
    const note: JobNote = {
      note: createJobNoteDTO.note,
      createdAt: new Date(Date.now()),
    };

    foundJob.notes.push(note);

    try {
      await foundJob.save();
      return note;

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao criar Anotação. Por favor, tente novamente mais tarde');
    }
  }

  async updateJob(
    mongoIdDTO: MongoIdDTO,
    updateJobDTO: UpdateJobDTO,
  ): Promise<JobDocument> {
    const { name, customer, types, description, status } = updateJobDTO;
    const foundJob = await this.getJobById(mongoIdDTO.id);

    if(foundJob.customer._id !== customer) {
      const foundCustomer = await this.customersService.getCustomerById(customer);
      foundJob.customer = foundCustomer;
    }

    foundJob.name = name;
    foundJob.types = types;
    foundJob.description = description;
    foundJob.status = status ? status : foundJob.status;

    try {
      return await foundJob.save();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao atualizar Job. Por favor, tente novamente mais tarde');
    }
  }

  async deleteJob(mongoIdDTO: MongoIdDTO): Promise<void> {
    const foundJob = await this.getJobById(mongoIdDTO.id);
    await this.paymentsService.deletePaymentsByJob(foundJob);

    try {
      await foundJob.delete();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao excluir Job. Por favor, tente novamente mais tarde');
    }
  }

}
