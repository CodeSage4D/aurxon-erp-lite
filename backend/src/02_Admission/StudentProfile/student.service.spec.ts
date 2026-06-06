import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { PrismaService } from '../../01_Core/prisma/prisma.service';
import { encrypt } from '../../common/helpers/encryption.helper';
import { SubscriptionLimitService } from '../../01_Core/Operations/subscription-limit.service';
import { AuditLogService } from '../../01_Core/AuditLogs/audit-log.service';

// Ensure the encryption key is defined for the tests
process.env.BACKEND_ENCRYPTION_KEY = '12345678901234567890123456789012';

describe('StudentService (PII Encryption & Masking)', () => {
  let service: StudentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    student: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    class: {
      findFirst: jest.fn(),
    },
    timelineEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockSubscriptionLimitService = {
    checkLimits: jest.fn().mockResolvedValue(true),
  };

  const mockAuditLogService = {
    logAction: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SubscriptionLimitService,
          useValue: mockSubscriptionLimitService,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    prisma = module.get<PrismaService>(PrismaService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    const plainAadhaar = '111122223333';
    const plainAcc = '9988776655';
    const plainIfsc = 'SBIN0005555';
    const plainSamagra = '123456789';
    const plainFamily = '987654321';
    const plainPen = 'PEN1234567';
    const plainHouseNo = 'A-101';
    const plainStreet = 'Green Avenue';
    const plainFather = 'Father Doe';
    const plainMother = 'Mother Doe';

    const encryptedStudentRecord = {
      id: 'student-1',
      firstName: 'Jane',
      lastName: 'Doe',
      scholarNumber: 'SCH-2026-0001',
      rollNumber: '101A01',
      classId: 'class-1',
      parentId: 'parent-1',
      aadhaarNumber: encrypt(plainAadhaar),
      accNumber: encrypt(plainAcc),
      ifscCode: encrypt(plainIfsc),
      samagraId: encrypt(plainSamagra),
      familyId: encrypt(plainFamily),
      penNumber: encrypt(plainPen),
      houseNo: encrypt(plainHouseNo),
      street: encrypt(plainStreet),
      fatherName: encrypt(plainFather),
      motherName: encrypt(plainMother),
    };

    it('should return fully decrypted clear values when queried by SUPER_ADMIN', async () => {
      mockPrismaService.student.findFirst.mockResolvedValue(encryptedStudentRecord);

      const result = await service.findOne('inst-1', 'student-1', 'SUPER_ADMIN');

      expect(result.aadhaarNumber).toBe(plainAadhaar);
      expect(result.accNumber).toBe(plainAcc);
      expect(result.ifscCode).toBe(plainIfsc);
      expect(result.samagraId).toBe(plainSamagra);
      expect(result.familyId).toBe(plainFamily);
      expect(result.penNumber).toBe(plainPen);
      expect(result.houseNo).toBe(plainHouseNo);
      expect(result.street).toBe(plainStreet);
      expect(result.fatherName).toBe(plainFather);
      expect(result.motherName).toBe(plainMother);
    });

    it('should return fully decrypted clear values when queried by INSTITUTE_ADMIN', async () => {
      mockPrismaService.student.findFirst.mockResolvedValue(encryptedStudentRecord);

      const result = await service.findOne('inst-1', 'student-1', 'INSTITUTE_ADMIN');

      expect(result.aadhaarNumber).toBe(plainAadhaar);
      expect(result.samagraId).toBe(plainSamagra);
    });

    it('should return fully decrypted clear values when queried by HR_MANAGER', async () => {
      mockPrismaService.student.findFirst.mockResolvedValue(encryptedStudentRecord);

      const result = await service.findOne('inst-1', 'student-1', 'HR_MANAGER');

      expect(result.aadhaarNumber).toBe(plainAadhaar);
      expect(result.samagraId).toBe(plainSamagra);
    });

    it('should return masked values when queried by TEACHER or standard roles', async () => {
      mockPrismaService.student.findFirst.mockResolvedValue(encryptedStudentRecord);
      mockPrismaService.class.findFirst.mockResolvedValue({ id: 'class-1' });

      const result = await service.findOne('inst-1', 'student-1', 'TEACHER', 'teacher-profile-1');

      // The last 4 digits should be visible, others masked as X
      expect(result.aadhaarNumber).toBe('XXXXXXXX3333');
      expect(result.accNumber).toBe('XXXXXX6655');
      expect(result.ifscCode).toBe('XXXXXXX5555');
      expect(result.samagraId).toBe('XXXXX6789');
      expect(result.familyId).toBe('XXXXX4321');
      expect(result.penNumber).toBe('XXXXXX4567');
      expect(result.houseNo).toBe('Masked');
      expect(result.street).toBe('Masked');
      expect(result.fatherName).toBe('XXXXXrDoe');
      expect(result.motherName).toBe('XXXXXrDoe');
    });
  });
});
