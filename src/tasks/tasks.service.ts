import { Injectable } from '@nestjs/common';
import { ITask, TaskStatus } from './models/task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { randomUUID } from 'crypto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';

const statusOrder = [TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

@Injectable()
export class TasksService {
  private tasks: ITask[] = [];

  findAll(): ITask[] {
    return this.tasks;
  }

  findById(id: string): ITask | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  createTask(payload: CreateTaskDto): ITask {
    const task: ITask = {
      id: randomUUID(),
      ...payload,
    };

    this.tasks.push(task);
    return task;
  }

  updateTask(task: ITask, updateTaskDto: UpdateTaskDto): ITask {
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

    return updatedTask;
  }

  deleteTask(task: ITask): void {
    this.tasks = this.tasks.filter(
      (filteredTask) => filteredTask.id !== task.id,
    );
  }

  isValidStatusOrder(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    return statusOrder.indexOf(currentStatus) <= statusOrder.indexOf(newStatus);
  }
}
