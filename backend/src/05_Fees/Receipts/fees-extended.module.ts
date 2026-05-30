import { Module } from '@nestjs/common';
import { FeesExtendedController } from './fees-extended.controller';
import { PrismaModule } from '../../01_Core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeesExtendedController],
})
export class FeesExtendedModule {}
