import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FindByIdParams {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;
}
