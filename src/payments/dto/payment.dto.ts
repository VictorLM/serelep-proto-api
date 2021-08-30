import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PaymentDTO {
  @IsNotEmpty({ message: 'Valor é obrigatório' })
  @IsPositive({ message: 'Valor deve ser um número positivo' })
  readonly value: number;

  @IsNotEmpty({ message: 'Vencimento é obrigatório' })
  @IsDateString({}, { message: 'Vencimento deve ser uma data válida' })
  readonly dueDate: string;

  @IsOptional()
  @IsString({ message: 'Anotações inválidas' })
  readonly notes: string;
}

export class PaymentsDTO {
  @IsNotEmpty({ message: 'Pagamento é obrigatório' })
  @IsArray({ message: 'Pagamento inválido' })
  @ArrayNotEmpty({ message: 'Job deve conter ao menos um Pagamento' })
  @ValidateNested({ each: true })
  @Type(() => PaymentDTO)
  readonly payments: PaymentDTO[];
}
