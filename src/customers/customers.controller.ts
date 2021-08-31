import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { QueryDTO } from '../globals/dto/query.dto';
import { CustomersService } from './customers.service';
import { CreateCustomerDTO, UpdateCustomerDTO } from './dto/customer.dto';
import { CustomerDocument } from './model/customer.schema';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get('/')
  getCustomers(@Query() queryDTO: QueryDTO): Promise<CustomerDocument[]> {
    return this.customersService.getCustomers(queryDTO);
  }

  @Get('/:id')
  getCustomerById(@Param() mongoIdDTO: MongoIdDTO): Promise<CustomerDocument> {
    return this.customersService.getCustomerById(mongoIdDTO.id);
  }

  @Post('/')
  createCustomer(@Body() createCustomerDTO: CreateCustomerDTO): Promise<CustomerDocument> {
    return this.customersService.createCustomer(createCustomerDTO);
  }

  @Patch('/:id')
  updateCustomer(
    @Param() mongoIdDTO: MongoIdDTO,
    @Body() updateCustomerDTO: UpdateCustomerDTO
  ): Promise<CustomerDocument> {
    return this.customersService.updateCustomer(mongoIdDTO, updateCustomerDTO);
  }

  @Delete('/:id')
  disableCustomer(@Param() mongoIdDTO: MongoIdDTO): Promise<void> {
    return this.customersService.disableCustomer(mongoIdDTO);
  }

}
