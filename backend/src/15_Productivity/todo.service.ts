import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../01_Core/prisma/prisma.service';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async getTodos(userId: string) {
    return this.prisma.todoTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTodo(userId: string, data: any) {
    return this.prisma.todoTask.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        category: data.category || 'GENERAL',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        completed: false,
      },
    });
  }

  async updateTodo(userId: string, id: string, data: any) {
    const todo = await this.prisma.todoTask.findFirst({
      where: { id, userId },
    });
    if (!todo) {
      throw new NotFoundException('To-Do item not found');
    }

    return this.prisma.todoTask.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : todo.title,
        description: data.description !== undefined ? data.description : todo.description,
        category: data.category !== undefined ? data.category : todo.category,
        priority: data.priority !== undefined ? data.priority : todo.priority,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : todo.dueDate,
        completed: data.completed !== undefined ? data.completed : todo.completed,
      },
    });
  }

  async deleteTodo(userId: string, id: string) {
    const todo = await this.prisma.todoTask.findFirst({
      where: { id, userId },
    });
    if (!todo) {
      throw new NotFoundException('To-Do item not found');
    }

    return this.prisma.todoTask.delete({
      where: { id },
    });
  }
}
