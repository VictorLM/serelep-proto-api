import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class DashboardQueryDTO {
  @IsOptional()
  @IsNumber({}, { message: 'Mes inválido' })
  @Min(1, { message: 'Mes inválido' })
  @Max(12, { message: 'Mes inválido' })
  @Type(() => Number)
  readonly month: number;

  @IsOptional()
  @IsNumber({}, { message: 'Ano inválido' })
  @Min(2021, { message: 'Ano inválido' })
  @Max(3000, { message: 'Ano inválido' })
  @Type(() => Number)
  readonly year: number;
}
