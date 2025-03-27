import { Injectable } from '@nestjs/common';
import { TaskStatus } from './models/task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';

const statusOrder = [TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.find();
  }

  async findById(id: string): Promise<Task | null> {
    return await this.taskRepository.findOneBy({ id });
  }

  async createTask(payload: CreateTaskDto): Promise<Task> {
    return await this.taskRepository.save(payload);
  }

  async updateTask(task: Task, updateTaskDto: UpdateTaskDto): Promise<Task> {
    if (
      updateTaskDto.status &&
      !this.isValidStatusOrder(task.status, updateTaskDto.status)
    ) {
      throw new WrongTaskStatusException();
    }

    const updatedTask = {
      ...task,
      ...updateTaskDto,
    };

    return await this.taskRepository.save(updatedTask);
  }

  async deleteTask(task: Task): Promise<void> {
    await this.taskRepository.delete(task);
  }

  isValidStatusOrder(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    return statusOrder.indexOf(currentStatus) <= statusOrder.indexOf(newStatus);
  }
}
