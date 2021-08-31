import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsModule } from '../jobs/jobs.module';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { Bill, BillSchema } from './model/bill.schema';

@Module({
  imports: [
    forwardRef(() => JobsModule),
    MongooseModule.forFeature([
      { name: Bill.name, schema: BillSchema },
    ]),
  ],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}
