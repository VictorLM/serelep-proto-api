import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { CustomersService } from './customers.service';
import { CreateCustomerDTO, UpdateCustomerDTO } from './dto/customer.dto';
import { CustomerDocument } from './model/customer.schema';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get('/')
  getCustomers(): Promise<CustomerDocument[]> {
    return this.customersService.getCustomers();
  }

  @Get('/:id')
  getCustomerById(@Param() mongoIdDTO: MongoIdDTO): Promise<CustomerDocument> {
    return this.customersService.getCustomerById(mongoIdDTO.id);
  }

  @Post('/')
  createCustomer(@Body() createCustomerDTO: CreateCustomerDTO): Promise<void> {
    return this.customersService.createCustomer(createCustomerDTO);
  }

  @Patch('/:id')
  updateCustomer(
    @Param() mongoIdDTO: MongoIdDTO,
    @Body() updateCustomerDTO: UpdateCustomerDTO
  ): Promise<void> {
    return this.customersService.updateCustomer(mongoIdDTO, updateCustomerDTO);
  }

  @Delete('/:id')
  disableCustomer(@Param() mongoIdDTO: MongoIdDTO): Promise<void> {
    return this.customersService.disableCustomer(mongoIdDTO);
  }

}
