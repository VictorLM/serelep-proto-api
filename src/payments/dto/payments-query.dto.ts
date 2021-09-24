import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { QueryDTO } from '../../globals/dto/query.dto';

export class PaymentsQueryDTO extends QueryDTO {
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
