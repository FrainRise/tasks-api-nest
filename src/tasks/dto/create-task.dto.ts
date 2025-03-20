import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TaskStatus } from '../models/task.model';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
