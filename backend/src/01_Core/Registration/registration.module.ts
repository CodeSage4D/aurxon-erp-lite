import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { ProvisioningModule } from '../Provisioning/provisioning.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../../08_Communication/InAppAlerts/notification.module';

@Module({
  imports: [PrismaModule, ProvisioningModule, NotificationModule],
  providers: [RegistrationService],
  controllers: [RegistrationController],
  exports: [RegistrationService],
})
export class RegistrationModule {}
