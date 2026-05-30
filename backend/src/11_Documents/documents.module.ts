import { Module } from '@nestjs/common';
import { CertificateController } from './Certificates/certificate.controller';
import { PrismaModule } from '../01_Core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CertificateController],
})
export class DocumentsModule {}
