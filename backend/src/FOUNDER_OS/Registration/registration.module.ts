import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { ProvisioningModule } from '../Licensing/provisioning.module';
import { PrismaModule } from '../../SHARED/Prisma/prisma.module';
import { NotificationModule } from '../../SHARED/Notifications/notification.module';

@Module({
  imports: [PrismaModule, ProvisioningModule, NotificationModule],
  providers: [RegistrationService],
  controllers: [RegistrationController],
  exports: [RegistrationService],
})
export class RegistrationModule {}
