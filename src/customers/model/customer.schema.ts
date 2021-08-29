import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ collection: 'customers', timestamps: true })
export class Customer {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: null })
  doc: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  contact: string;

  @Prop({
    required: false,
    nullable: true,
    default: null,
  })
  disabled: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
