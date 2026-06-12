import { Module } from '@nestjs/common';
import { FeesExtendedController } from './fees-extended.controller';
import { PrismaModule } from '../../../../SHARED/Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeesExtendedController],
})
export class FeesExtendedModule {}
