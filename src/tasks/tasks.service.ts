import { Injectable } from '@nestjs/common';
import { TaskStatus } from './models/task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskLabelDto } from './dto/create-task-label.dto';
import { TaskLabel } from './task-label.entity';
import { FindTaskParams } from './params/find-task.params';
import { PaginationParams } from 'src/common/pagination.params';

const statusOrder = [TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(TaskLabel)
    private readonly taskLabelsRepository: Repository<TaskLabel>,
  ) {}

  async findAll(
    filters: FindTaskParams,
    pagination: PaginationParams,
  ): Promise<[Task[], number]> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.labels', 'labels');

    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.search?.trim()) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.labels?.length) {
      const subQuery = query
        .subQuery()
        .select('labels.taskId')
        .from('task_label', 'labels')
        .where('labels.name IN (:...labelNames)', {
          labelNames: filters.labels,
        })
        .getQuery();

      query.andWhere(`task.id IN ${subQuery}`);
    }

    query.orderBy(`task.${filters.sortBy}`, filters.sortOrder);

    query.skip(pagination.offset).take(pagination.limit);

    return query.getManyAndCount();
  }

  async findById(id: string): Promise<Task | null> {
    return await this.taskRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    if (createTaskDto.labels) {
      createTaskDto.labels = this.getUniqueLabels(createTaskDto.labels);
    }
    return await this.taskRepository.save(createTaskDto);
  }

  async updateTask(task: Task, updateTaskDto: UpdateTaskDto): Promise<Task> {
    if (
      updateTaskDto.status &&
      !this.isValidStatusOrder(task.status, updateTaskDto.status)
    ) {
      throw new WrongTaskStatusException();
    }

    if (updateTaskDto.labels) {
      updateTaskDto.labels = this.getUniqueLabels(updateTaskDto.labels);
    }

    const updatedTask = {
      ...task,
      ...updateTaskDto,
    };

    return await this.taskRepository.save(updatedTask);
  }

  async deleteTask(task: Task): Promise<void> {
    await this.taskRepository.delete(task.id);
  }

  async addLabels(task: Task, labelDtos: CreateTaskLabelDto[]): Promise<Task> {
    const existingUniqueNames = new Set(task.labels.map((label) => label.name));
    const labels = this.getUniqueLabels(labelDtos)
      .filter((dto) => !existingUniqueNames.has(dto.name))
      .map((label) => this.taskLabelsRepository.create(label));
    if (!labels.length) {
      return task;
    }

    task.labels = [...task.labels, ...labels];
    return await this.taskRepository.save(task);
  }

  async removeLabels(task: Task, labelsToRemove: string[]): Promise<Task> {
    task.labels = task.labels.filter(
      (label) => !labelsToRemove.includes(label.name),
    );
    return await this.taskRepository.save(task);
  }

  private isValidStatusOrder(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    return statusOrder.indexOf(currentStatus) <= statusOrder.indexOf(newStatus);
  }

  private getUniqueLabels(
    labelDtos: CreateTaskLabelDto[],
  ): CreateTaskLabelDto[] {
    const uniqueNames = [...new Set(labelDtos.map((label) => label.name))];

    return uniqueNames.map((labelName) => ({
      name: labelName,
    }));
  }
}
