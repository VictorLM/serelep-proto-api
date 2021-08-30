import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { JobDocument } from '../../jobs/model/job.schema';

export type PaymentDocument = Payment & mongoose.Document;

@Schema({ collection: 'payments', timestamps: true })
export class Payment {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  })
  job: JobDocument;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({
    required: false,
    default: null,
  })
  payed: Date;

  @Prop({ required: false, default: null })
  notes: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
