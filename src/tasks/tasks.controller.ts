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
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindByIdParams } from './params/find-by-id.params';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Task } from './task.entity';
import { CreateTaskLabelDto } from './dto/create-task-label.dto';
import { FindTaskParams } from './params/find-task.params';
import { PaginationParams } from 'src/common/pagination.params';
import { PaginationResponse } from 'src/common/pagination.response';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // endpoints
  @Get()
  async findAll(
    @Query() filters: FindTaskParams,
    @Query() pagination: PaginationParams,
  ): Promise<PaginationResponse<Task>> {
    const [items, total] = await this.tasksService.findAll(filters, pagination);
    return {
      data: items,
      meta: {
        total,
        ...pagination,
      },
    };
  }

  @Get(':id')
  async findById(@Param() params: FindByIdParams): Promise<Task> {
    return await this.findByIdOrFail(params.id);
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return await this.tasksService.createTask(createTaskDto);
  }

  @Patch(':id')
  async updateTask(
    @Param() params: FindByIdParams,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findByIdOrFail(params.id);
    try {
      return await this.tasksService.updateTask(task, updateTaskDto);
    } catch (error) {
      if (error instanceof WrongTaskStatusException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param() params: FindByIdParams): Promise<void> {
    const task = await this.findByIdOrFail(params.id);
    await this.tasksService.deleteTask(task);
  }

  @Post(':id/labels')
  async addLabels(
    @Param() { id }: FindByIdParams,
    @Body() labels: CreateTaskLabelDto[],
  ): Promise<Task> {
    const task = await this.findByIdOrFail(id);
    return await this.tasksService.addLabels(task, labels);
  }

  @Delete(':id/labels')
  async removeLabels(
    @Param() { id }: FindByIdParams,
    @Body() labelNames: string[],
  ): Promise<void> {
    const task = await this.findByIdOrFail(id);
    await this.tasksService.removeLabels(task, labelNames);
  }

  // helpers
  private async findByIdOrFail(id: string): Promise<Task> {
    const task = await this.tasksService.findById(id);
    if (task) {
      return task;
    }

    throw new NotFoundException();
  }
}
