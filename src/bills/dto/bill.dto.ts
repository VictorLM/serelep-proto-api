import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { BillSubTypes } from '../enum/bill-sub-types.enum';
import { BillTypes } from '../enum/bill-types.enum';

export class BillDTO {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome inválido' })
  readonly name: string;

  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsEnum(BillTypes, { message: 'Tipo inválido' })
  readonly type: BillTypes;

  @IsNotEmpty({ message: 'Sub Tipo é obrigatório' })
  @IsEnum(BillSubTypes, { message: 'Sub Tipo inválido' })
  readonly subType: BillSubTypes;

  @IsNotEmpty({ message: 'Valor é obrigatório' })
  @IsPositive({ message: 'Valor deve ser um número positivo' })
  readonly value: number;

  @IsNotEmpty({ message: 'Vencimento é obrigatório' })
  @IsDateString({}, { message: 'Vencimento deve ser uma data válida' })
  readonly dueDate: string;

  @IsOptional()
  @IsMongoId({ message: 'Job Inválido' })
  readonly job: Types.ObjectId;

  @IsOptional()
  @IsString({ message: 'Anotação inválida' })
  readonly notes: string;
}

export class UpdateBillDTO extends BillDTO {
  @IsOptional()
  @IsDateString({}, { message: 'Pago deve ser uma data válida' })
  readonly payed: string;
}
