import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { QueryDTO } from '../globals/dto/query.dto';
import { CreateCustomerDTO, UpdateCustomerDTO } from './dto/customer.dto';
import { Customer, CustomerDocument } from './model/customer.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async getCustomers(queryDTO: QueryDTO): Promise<CustomerDocument[]> {
    const { search, orderBy } = queryDTO || {};

    const query = this.customerModel.find({ disabled: null });

    if (search) {
      query.where({ name: { $regex: '.*' + search + '.*', $options: 'i' } });
    }

    if (orderBy && orderBy === 'DESC') {
      query.sort({ name: -1 });
    } else {
      query.sort({ name: 1 });
    }

    return await query.exec();
  }

  async getCustomerById(id: Types.ObjectId): Promise<CustomerDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID "${id}" inválido`);
    }
    const found = await this.customerModel.findOne({ _id: id, disabled: null });

    if (!found) {
      throw new NotFoundException(`Cliente com ID "${id}" não encontrado`);
    }
    return found;
  }

  async createCustomer(createCustomerDTO: CreateCustomerDTO): Promise<CustomerDocument> {
    const { name, doc, email, contact, notes } = createCustomerDTO;

    const newCustomer = new this.customerModel({ name, doc, email, contact, notes });

    try {
      return await newCustomer.save();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao cadastrar novo Cliente. Por favor, tente novamente mais tarde');
    }
  }

  async updateCustomer(
    mongoIdDTO: MongoIdDTO,
    updateCustomerDTO: UpdateCustomerDTO,
  ): Promise<CustomerDocument> {
    const { name, doc, email, contact, notes, disabled } = updateCustomerDTO;
    const foundCustomer = await this.getCustomerById(mongoIdDTO.id);

    foundCustomer.name = name;
    foundCustomer.doc = doc;
    foundCustomer.email = email;
    foundCustomer.contact = contact;
    foundCustomer.notes = notes;
    foundCustomer.disabled = disabled ? new Date() : null;

    try {
      return await foundCustomer.save();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao atualizar Cliente. Por favor, tente novamente mais tarde');
    }
  }

  async disableCustomer(mongoIdDTO: MongoIdDTO): Promise<void> {
    const foundCustomer = await this.getCustomerById(mongoIdDTO.id);

    foundCustomer.disabled = new Date();

    try {
      await foundCustomer.save();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao desativar Cliente. Por favor, tente novamente mais tarde');
    }
  }

}
