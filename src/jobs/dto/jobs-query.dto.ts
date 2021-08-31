import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { QueryDTO } from '../../globals/dto/query.dto';
import { JobStatus } from '../enum/job-status.enum';

export class JobsQueryDTO extends QueryDTO {
  @IsOptional()
  @IsEnum(JobStatus, { message: 'Status inválido' })
  readonly status: JobStatus;

  // TODO - VALIDAR SE VALORES === ENUM
  @IsOptional()
  @IsArray({ message: 'Tipo inválido' })
  @IsString({ each: true, message: 'Tipo inválido' })
  @Type(() => String)
  @Transform(({value}) => value.split(','))
  readonly types: string[];
}
