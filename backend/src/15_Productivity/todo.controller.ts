import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../01_Core/Auth/jwt-auth.guard';
import { TodoService } from './todo.service';

@UseGuards(JwtAuthGuard)
@Controller('productivity/todos')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Get()
  async getTodos(@Request() req) {
    return this.todoService.getTodos(req.user.id);
  }

  @Post()
  async createTodo(@Request() req, @Body() body: any) {
    return this.todoService.createTodo(req.user.id, body);
  }

  @Put(':id')
  async updateTodo(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.todoService.updateTodo(req.user.id, id, body);
  }

  @Delete(':id')
  async deleteTodo(@Request() req, @Param('id') id: string) {
    return this.todoService.deleteTodo(req.user.id, id);
  }
}
