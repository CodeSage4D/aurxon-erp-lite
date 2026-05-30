import { Module } from '@nestjs/common';
import { InstitutionController } from './institution.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InstitutionController],
})
export class InstitutionModule {}
