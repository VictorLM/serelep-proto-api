import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { JobDocument } from '../../jobs/model/job.schema';
import { BillSubTypes } from '../enum/bill-sub-types.enum';
import { BillTypes } from '../enum/bill-types.enum';

export type BillDocument = Bill & mongoose.Document;

@Schema({ collection: 'bills', timestamps: true })
export class Bill {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: BillTypes })
  type: BillTypes;

  @Prop({ required: true, enum: BillSubTypes })
  subType: BillSubTypes;

  @Prop({ required: true })
  value: number;

  @Prop({ required: false })
  dueDate: Date;

  @Prop({
    required: false,
    default: null,
  })
  payed: Date;

  @Prop({
    required: false,
    default: null,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  })
  job: JobDocument;

  @Prop({ required: false, default: null })
  notes: string;
}

export const BillSchema = SchemaFactory.createForClass(Bill);
