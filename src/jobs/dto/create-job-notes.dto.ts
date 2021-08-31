import { IsString, IsNotEmpty } from 'class-validator';

export class CreateJobNoteDTO {
  @IsNotEmpty({ message: 'Anotação é obrigatória' })
  @IsString({ message: 'Anotação inválida' })
  readonly note: string;
}
