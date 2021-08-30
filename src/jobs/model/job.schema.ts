import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { CustomerDocument } from '../../customers/model/customer.schema';
import { PaymentDocument } from '../../payments/model/payment.schema';
import { JobStatus } from '../enum/job-status.enum';

export type JobDocument = Job & mongoose.Document;

@Schema({ collection: 'jobs', timestamps: true })
export class Job {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string[];

  @Prop({
    enum: JobStatus,
    required: false,
    default: JobStatus.OPEN,
  })
  status: JobStatus;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  })
  customer: CustomerDocument;

  @Prop({
    required: false, // Primeiro o Job será criado, depois os Payments com o Job ID
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }],
  })
  payments: PaymentDocument[];

  @Prop({ required: false, default: null })
  notes: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
