import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskLabelDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
