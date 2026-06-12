import { Module } from '@nestjs/common';
import { ProvisioningService } from './provisioning.service';
import { PrismaModule } from '../../SHARED/Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProvisioningService],
  exports: [ProvisioningService],
})
export class ProvisioningModule {}
