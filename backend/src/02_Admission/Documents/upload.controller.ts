import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../01_Core/Auth/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    const filename = await this.uploadService.saveFile(file);
    return {
      message: 'File uploaded successfully',
      filename,
      url: `/uploads/${filename}`,
    };
  }

  @Get(':filename')
  @UseGuards(JwtAuthGuard)
  async getFile(
    @Param('filename') filename: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    const filePath = await this.uploadService.getFile(filename, req.user);
    return res.sendFile(filePath);
  }
}
