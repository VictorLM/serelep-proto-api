import { IsOptional, IsString } from 'class-validator';

export class QueryDTO {
  @IsOptional()
  @IsString({ message: 'Pesquisa inválida' })
  readonly search: string;

  @IsOptional()
  @IsString({ message: 'Pesquisa inválida' })
  readonly orderBy: 'ASC' | 'DESC';
}
