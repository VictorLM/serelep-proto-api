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
import { CustomersService } from '../customers/customers.service';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { PaymentsService } from '../payments/payments.service';
import { CreateJobNoteDTO } from './dto/create-job-notes.dto';
import { CreateJobDTO, NewJobDTO, UpdateJobDTO } from './dto/job.dto';
import { JobNote } from './interface/job-note.interface';
import { Job, JobDocument } from './model/job.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private paymentsService: PaymentsService,
    private customersService: CustomersService,
    @Inject(forwardRef(() => BillsService))
    private billsService: BillsService, // TODO
  ) {}

  async getJobs(): Promise<JobDocument[]> {
    return await this.jobModel.find().populate('customer payments').sort('-createdAt');
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

  async newJob(newJobDTO: NewJobDTO): Promise<JobDocument> {
    const { name, customer, type, description, payments } = newJobDTO;

    await this.customersService.getCustomerById(customer);

    const newJob = await this.createJob({ name, customer, type, description });
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
    const { name, customer, type, description } = createJobDTO;
    const newJob = new this.jobModel({ name, customer, type, description });

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
    const { name, customer, type, description, status } = updateJobDTO;
    const foundJob = await this.getJobById(mongoIdDTO.id);

    if(foundJob.customer._id !== customer) {
      const foundCustomer = await this.customersService.getCustomerById(customer);
      foundJob.customer = foundCustomer;
    }

    foundJob.name = name;
    foundJob.type = type;
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
