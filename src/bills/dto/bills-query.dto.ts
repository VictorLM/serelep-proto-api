import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { QueryDTO } from '../../globals/dto/query.dto';
import { BillSubTypes } from '../enum/bill-sub-types.enum';
import { BillTypes } from '../enum/bill-types.enum';

export class BillQueryDTO extends QueryDTO {
  @IsOptional()
  @IsEnum(BillTypes, { message: 'Tipo inválido' })
  readonly type: BillTypes;

  @IsOptional()
  @IsEnum(BillSubTypes, { message: 'Sub Tipo inválido' })
  readonly subType: BillSubTypes;

  @IsOptional()
  @IsBoolean({ message: 'Status inválido' })
  @Type(() => Boolean)
  @Transform(({value}) => Boolean(value))
  readonly overdue: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Status inválido' })
  @Type(() => Boolean)
  @Transform(({value}) => Boolean(value))
  readonly payed: boolean;
}
