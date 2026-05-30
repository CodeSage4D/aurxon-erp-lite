import { Test, TestingModule } from '@nestjs/testing';
import { OperationsService } from './operations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OperationsService (Operational Hardening & Pilot Integrity)', () => {
  let service: OperationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    student: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      update: jest.fn(),
    },
    staff: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    parent: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    class: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    subject: {
      findMany: jest.fn(),
    },
    attendance: {
      findMany: jest.fn(),
    },
    studentFeeAllocation: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    exam: {
      findMany: jest.fn(),
    },
    academicYear: {
      count: jest.fn(),
    },
    systemAlert: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    securityEventLog: {
      count: jest.fn(),
    },
    uatTicket: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    timelineEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OperationsService>(OperationsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runBackup', () => {
    it('should generate logical PG dump text and simulate secure S3 upload', async () => {
      mockPrismaService.class.findMany.mockResolvedValue([
        { id: 'c1', name: '10A', section: 'A', stream: 'Gen', board: 'CBSE', institutionId: 'inst-1', createdAt: new Date(), updatedAt: new Date() },
      ]);
      mockPrismaService.parent.findMany.mockResolvedValue([]);
      mockPrismaService.student.findMany.mockResolvedValue([]);
      mockPrismaService.staff.findMany.mockResolvedValue([]);
      mockPrismaService.subject.findMany.mockResolvedValue([]);
      mockPrismaService.attendance.findMany.mockResolvedValue([]);
      mockPrismaService.studentFeeAllocation.findMany.mockResolvedValue([]);
      mockPrismaService.exam.findMany.mockResolvedValue([]);

      const result = await service.runBackup('inst-1');

      expect(result.success).toBe(true);
      expect(result.storage).toBe('S3-COMPATIBLE');
      expect(result.sizeBytes).toBeGreaterThan(0);
      expect(mockPrismaService.systemAlert.create).toHaveBeenCalled();
    });
  });

  describe('runIntegritySweep', () => {
    it('should perform duplicate pre-detection and log alert warnings', async () => {
      mockPrismaService.student.groupBy.mockResolvedValue([
        { scholarNumber: 'SCH-001', _count: { scholarNumber: 2 } },
      ]);
      mockPrismaService.staff.groupBy.mockResolvedValue([]);
      mockPrismaService.student.findMany.mockResolvedValue([]);
      mockPrismaService.studentFeeAllocation.findMany.mockResolvedValue([]);

      const result = await service.runIntegritySweep('inst-1');

      expect(result.alertsCount).toBe(1);
      expect(result.alerts[0]).toContain('Duplicate Scholar Numbers detected');
      expect(mockPrismaService.systemAlert.create).toHaveBeenCalled();
    });
  });

  describe('validateImportPreview', () => {
    it('should preview schema checks and flag duplicate email entries', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-u1' });

      const testRows = [
        { email: 'john@example.com', rollNumber: '101' },
        { email: 'invalid-email', rollNumber: '' },
      ];

      const result = await service.validateImportPreview(testRows);

      expect(result.total).toBe(2);
      expect(result.invalid).toBe(2); // both are invalid (first has email conflict, second has invalid email & missing rollNumber)
      expect(result.preview[0].status).toBe('INVALID');
      expect(result.preview[1].status).toBe('INVALID');
    });
  });
});
