import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: any): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded or file buffer is empty');
    }

    // Limit to 5MB
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('File size exceeds the limit of 5MB');
    }

    const buffer = file.buffer;
    if (buffer.length < 4) {
      throw new BadRequestException('Invalid file buffer');
    }

    // Read magic bytes signature
    const hex = buffer.toString('hex', 0, 4).toUpperCase();
    const isPdf = hex === '25504446'; // %PDF
    const isPng = hex === '89504E47'; // PNG
    const isJpg = hex.startsWith('FFD8FF'); // JPEG

    if (!isPdf && !isPng && !isJpg) {
      throw new BadRequestException('Invalid file signature. Only JPEG, PNG, and PDF files are allowed.');
    }

    let ext = '';
    if (isPdf) ext = '.pdf';
    else if (isPng) ext = '.png';
    else if (isJpg) ext = '.jpg';

    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    try {
      fs.writeFileSync(filePath, buffer);
    } catch (err) {
      console.error('Failed to write file to disk:', err);
      throw new BadRequestException('Could not save file to disk');
    }

    return filename;
  }

  async getFile(filename: string, user: any): Promise<string> {
    const filePath = path.join(this.uploadDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    // Find the associated Document to perform security checks
    const doc = await this.prisma.document.findFirst({
      where: {
        fileUrl: {
          contains: filename,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            parentId: true,
            institutionId: true,
          },
        },
      },
    });

    // If a document entry exists in DB, perform granular isolation checks
    if (doc) {
      // Tenant Isolation
      if (doc.student.institutionId !== user.institutionId) {
        throw new ForbiddenException('Access denied. Institution mismatch.');
      }

      // Role-based boundaries
      if (user.role === 'PARENT') {
        const parentProfile = await this.prisma.parent.findUnique({
          where: { userId: user.sub },
          select: { id: true },
        });
        if (!parentProfile || doc.student.parentId !== parentProfile.id) {
          throw new ForbiddenException('Access denied. This document does not belong to your child.');
        }
      } else if (user.role === 'STUDENT') {
        const studentProfile = await this.prisma.student.findUnique({
          where: { userId: user.sub },
          select: { id: true },
        });
        if (!studentProfile || doc.student.id !== studentProfile.id) {
          throw new ForbiddenException('Access denied. This document does not belong to you.');
        }
      }
    }

    return filePath;
  }
}
