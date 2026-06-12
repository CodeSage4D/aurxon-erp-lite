import { Module } from '@nestjs/common';
import { CertificateController } from './Certificates/certificate.controller';
import { PrismaModule } from '../Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CertificateController],
})
export class DocumentsModule {}
