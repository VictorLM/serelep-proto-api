import {
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

export class CreateCustomerDTO {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome inválido' })
  @MinLength(3, { message: 'Nome deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(50, { message: 'Nome deve ter no máximo $constraint1 caracteres' })
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'CPF/CNPJ inválido' })
  @MinLength(11, { message: 'CPF/CNPJ deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(19, { message: 'CPF/CNPJ deve ter no máximo $constraint1 caracteres' })
  readonly doc: string;

  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  @MinLength(6, { message: 'Email deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(50, { message: 'Email deve ter no máximo $constraint1 caracteres' })
  readonly email: string;

  @IsNotEmpty({ message: 'Responsável é obrigatório' })
  @IsString({ message: 'Responsável inválido' })
  @MinLength(3, { message: 'Responsável deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(50, { message: 'Responsável deve ter no máximo $constraint1 caracteres' })
  readonly contact: string;
}

export class UpdateCustomerDTO extends CreateCustomerDTO {
  @IsOptional()
  @IsBoolean({ message: 'Desativar inválido'})
  readonly disabled: Date;
}
