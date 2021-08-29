import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { CreateCustomerDTO, UpdateCustomerDTO } from './dto/customer.dto';
import { Customer, CustomerDocument } from './model/customer.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customersModel: Model<CustomerDocument>,
  ) {}

  async getCustomers(): Promise<CustomerDocument[]> {
    return await this.customersModel.find({ disabled: null });
  }

  async getCustomerById(id: Types.ObjectId): Promise<CustomerDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID "${id}" inválido`);
    }
    const found = await this.customersModel.findOne({ _id: id, disabled: null });

    if (!found) {
      throw new NotFoundException(`Cliente com ID "${id}" não encontrado`);
    }
    return found;
  }

  async createCustomer(createCustomerDTO: CreateCustomerDTO): Promise<void> {
    const { name, doc, email, contact } = createCustomerDTO;

    const newCustomer = new this.customersModel({ name, doc, email, contact });

    try {
      await newCustomer.save();

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao cadastrar novo Cliente. Por favor, tente novamente mais tarde');
    }
  }

  async updateCustomer(
    mongoIdDTO: MongoIdDTO,
    updateCustomerDTO: UpdateCustomerDTO,
  ): Promise<void> {
    const { name, doc, email, contact, disabled } = updateCustomerDTO;
    const foundCustomer = await this.getCustomerById(mongoIdDTO.id);

    foundCustomer.name = name;
    foundCustomer.doc = doc;
    foundCustomer.email = email;
    foundCustomer.contact = contact;
    foundCustomer.disabled = disabled ? new Date() : null;

    try {
      await foundCustomer.save();

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
