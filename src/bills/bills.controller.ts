import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { BillsService } from './bills.service';
import { BillDTO, UpdateBillDTO } from './dto/bill.dto';
import { BillQueryDTO } from './dto/bills-query.dto';
import { BillDocument } from './model/bill.schema';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillsController {
  constructor(private billsService: BillsService) {}

  @Get('/')
  getBills(@Query() billQueryDTO: BillQueryDTO): Promise<BillDocument[]> {
    return this.billsService.getBills(billQueryDTO);
  }

  @Get('/:id')
  getBillById(@Param() mongoIdDTO: MongoIdDTO): Promise<BillDocument> {
    return this.billsService.getBillById(mongoIdDTO.id);
  }

  @Post('/')
  createBill(@Body() billDTO: BillDTO): Promise<BillDocument> {
    return this.billsService.createBill(billDTO);
  }

  @Patch('/:id')
  updateBill(
    @Param() mongoIdDTO: MongoIdDTO,
    @Body() updateBillDTO: UpdateBillDTO,
  ): Promise<BillDocument> {
    return this.billsService.updateBill(mongoIdDTO, updateBillDTO);
  }

  @Delete('/:id')
  deleteBill(@Param() mongoIdDTO: MongoIdDTO): Promise<void> {
    return this.billsService.deleteBill(mongoIdDTO);
  }

}
