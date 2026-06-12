import { Module } from '@nestjs/common';
import { PrismaModule } from '../Prisma/prisma.module';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { PlannerController } from './planner.controller';
import { PlannerService } from './planner.service';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    TodoController,
    DiaryController,
    PlannerController,
    TaskController,
  ],
  providers: [
    TodoService,
    DiaryService,
    PlannerService,
    TaskService,
  ],
  exports: [
    TodoService,
    DiaryService,
    PlannerService,
    TaskService,
  ],
})
export class ProductivityModule {}
