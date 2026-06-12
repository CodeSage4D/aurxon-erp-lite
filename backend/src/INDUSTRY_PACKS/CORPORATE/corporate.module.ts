import { Module } from '@nestjs/common';
import { CorporateController } from './corporate.controller';
import { CorporateService } from './corporate.service';
import { PrismaModule } from '../../SHARED/Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CorporateController],
  providers: [CorporateService],
})
export class CorporateModule {}
