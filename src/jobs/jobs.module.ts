import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job, JobSchema } from './model/job.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsModule } from '../payments/payments.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    PaymentsModule,
    CustomersModule,
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
    ]),
  ],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
