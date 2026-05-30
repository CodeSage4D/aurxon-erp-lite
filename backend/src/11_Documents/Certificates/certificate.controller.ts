// Certificate issuance controller — IEEE 1016 compliant document management
// Issues and tracks school certificates with unique document numbers and verification hashes

import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../01_Core/Auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../../01_Core/Auth/roles.guard';
import { PrismaService } from '../../01_Core/prisma/prisma.service';
import * as crypto from 'crypto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class CertificateController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async findAll(
    @Request() req: any,
    @Query('targetId') targetId?: string,
    @Query('docType') docType?: string,
  ) {
    return this.prisma.issuedDocument.findMany({
      where: {
        ...(targetId ? { targetId } : {}),
        ...(docType ? { docType } : {}),
      },
      orderBy: { generatedAt: 'desc' },
    });
  }

  @Get('verify/:documentNumber')
  async verify(@Param('documentNumber') documentNumber: string) {
    const doc = await this.prisma.issuedDocument.findUnique({
      where: { documentNumber },
    });
    return {
      valid: !!doc,
      document: doc ? {
        documentNumber: doc.documentNumber,
        docType: doc.docType,
        targetType: doc.targetType,
        generatedAt: doc.generatedAt,
      } : null,
    };
  }

  @Post('issue')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN')
  async issue(
    @Request() req: any,
    @Body() body: {
      docType: string;
      targetType: string;
      targetId: string;
      pdfUrl?: string;
    },
  ) {
    // Verify target belongs to institution
    if (body.targetType === 'STUDENT') {
      const student = await this.prisma.student.findFirst({
        where: { id: body.targetId, institutionId: req.user.institutionId },
      });
      if (!student) return { error: 'Student not found in this institution' };
    } else if (body.targetType === 'STAFF') {
      const staff = await this.prisma.staff.findFirst({
        where: { id: body.targetId, institutionId: req.user.institutionId },
      });
      if (!staff) return { error: 'Staff member not found in this institution' };
    }

    // Generate unique document number: DOCTYPE-YYYY-XXXXXX
    const year = new Date().getFullYear();
    const sequence = await this.prisma.issuedDocument.count({
      where: { docType: body.docType },
    });
    const documentNumber = `${body.docType}-${year}-${String(sequence + 1).padStart(6, '0')}`;

    // Generate verification hash (SHA-256 of doc details)
    const verificationHash = crypto
      .createHash('sha256')
      .update(`${documentNumber}|${body.targetId}|${body.targetType}|${body.docType}`)
      .digest('hex');

    const doc = await this.prisma.issuedDocument.create({
      data: {
        docType: body.docType,
        targetType: body.targetType,
        targetId: body.targetId,
        documentNumber,
        verificationHash,
        pdfUrl: body.pdfUrl,
        generatedById: req.user.id,
      },
    });

    return doc;
  }
}
