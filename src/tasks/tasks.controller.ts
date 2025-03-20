import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ITask } from './models/task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindByIdParams } from './params/find-by-id.param';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // endpoints
  @Get()
  findAll(): ITask[] {
    return this.tasksService.findAll();
  }

  @Get('/:id')
  findById(@Param() params: FindByIdParams): ITask {
    return this.findByIdOrFail(params.id);
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(createTaskDto);
  }

  @Patch('/:id')
  updateTask(
    @Param() params: FindByIdParams,
    @Body() updateTaskDto: UpdateTaskDto,
  ): ITask {
    const task = this.findByIdOrFail(params.id);
    try {
      return this.tasksService.updateTask(task, updateTaskDto);
    } catch (error) {
      if (error instanceof WrongTaskStatusException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTask(@Param() params: FindByIdParams): void {
    const task = this.findByIdOrFail(params.id);
    this.tasksService.deleteTask(task);
  }

  // helpers
  findByIdOrFail(id: string): ITask {
    const task = this.tasksService.findById(id);
    if (task) {
      return task;
    }

    throw new NotFoundException();
  }
}
