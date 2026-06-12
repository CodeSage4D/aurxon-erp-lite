import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../../KERNEL/Authentication/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../KERNEL/Authentication/roles.guard';
import { LibraryService } from './library.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('library')
export class LibraryController {
  constructor(private libraryService: LibraryService) {}

  @Get('books')
  async getBooks(@Request() req, @Query('search') search?: string) {
    return this.libraryService.getBooks(req.user.institutionId, search);
  }

  @Get('books/:id')
  async getBookById(@Request() req, @Param('id') id: string) {
    return this.libraryService.getBookById(req.user.institutionId, id);
  }

  @Post('books')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF')
  async createBook(@Request() req, @Body() body: any) {
    return this.libraryService.createBook(req.user.institutionId, body);
  }

  @Put('books/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF')
  async updateBook(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.libraryService.updateBook(req.user.institutionId, id, body);
  }

  @Delete('books/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF')
  async deleteBook(@Request() req, @Param('id') id: string) {
    return this.libraryService.deleteBook(req.user.institutionId, id);
  }

  @Get('issues')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF', 'TEACHER')
  async getIssues(@Request() req) {
    return this.libraryService.getIssues(req.user.institutionId);
  }

  @Get('issues/student/:studentId')
  async getStudentIssues(@Param('studentId') studentId: string) {
    return this.libraryService.getStudentIssues(studentId);
  }

  @Post('issue')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF')
  async issueBook(@Request() req, @Body() body: { studentId?: string; staffId?: string; bookId: string }) {
    return this.libraryService.issueBook(req.user.institutionId, body);
  }

  @Post('return/:issueId')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF')
  async returnBook(@Request() req, @Param('issueId') issueId: string) {
    return this.libraryService.returnBook(req.user.institutionId, issueId);
  }

  @Post('pay-fine/:issueId')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STAFF', 'ACCOUNTANT')
  async payFine(@Request() req, @Param('issueId') issueId: string) {
    return this.libraryService.payFine(req.user.institutionId, issueId);
  }
}
