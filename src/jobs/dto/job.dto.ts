import {
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsArray,
  ArrayMinSize,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';
import { PaymentsDTO } from '../../payments/dto/payment.dto';
import { JobStatus } from '../enum/job-status.enum';

export class NewJobDTO extends PaymentsDTO {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome inválido' })
  @MinLength(3, { message: 'Nome deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo $constraint1 caracteres' })
  readonly name: string;

  // TODO - VALIDAR SE VALORES === ENUM
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsArray({ message: 'Tipo inválido' })
  @ArrayMinSize(1, { message: 'É necessário selecionar ao menos um Tipo' })
  readonly type: string[];

  @IsNotEmpty({ message: 'Cliente é obrigatório' })
  @IsMongoId({ message: 'Cliente inválido' })
  readonly customer: Types.ObjectId;

  @IsOptional()
  @IsString({ message: 'Anotações inválidas' })
  readonly notes: string;
}

export class CreateJobDTO {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome inválido' })
  @MinLength(3, { message: 'Nome deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo $constraint1 caracteres' })
  readonly name: string;

  // TODO - VALIDAR SE VALORES === ENUM
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsArray({ message: 'Tipo inválido' })
  @ArrayMinSize(1, { message: 'É necessário selecionar ao menos um Tipo' })
  readonly type: string[];

  @IsNotEmpty({ message: 'Cliente é obrigatório' })
  @IsMongoId({ message: 'Cliente inválido' })
  readonly customer: Types.ObjectId;

  @IsOptional()
  @IsString({ message: 'Anotações inválidas' })
  readonly notes: string;
}

export class UpdateJobDTO extends CreateJobDTO {
  @IsNotEmpty({ message: 'Status é obrigatório' })
  @IsEnum(JobStatus, { message: 'Status inválido' })
  readonly status: JobStatus;
}
