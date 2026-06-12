import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from './staff.service';
import { PrismaService } from '../../SHARED/Prisma/prisma.service';
import { encrypt } from '../../SHARED/helpers/encryption.helper';

// Ensure the encryption key is defined for the tests
process.env.BACKEND_ENCRYPTION_KEY = '12345678901234567890123456789012';

describe('StaffService (Encryption & Masking)', () => {
  let service: StaffService;
  let prisma: PrismaService;

  const mockPrismaService = {
    staff: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    prisma = module.get<PrismaService>(PrismaService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStaffById', () => {
    const plainAadhaar = '123456789012';
    const plainPan = 'ABCDE1234F';
    const plainAcc = '9876543210';
    const plainIfsc = 'SBIN0001234';
    const plainAddress = '123, Baker Street, London';

    const encryptedStaffRecord = {
      id: 'staff-1',
      firstName: 'John',
      lastName: 'Doe',
      phone: '9999999999',
      designation: 'TEACHER',
      joiningDate: new Date(),
      salary: 50000,
      aadhaarNumber: encrypt(plainAadhaar),
      panNumber: encrypt(plainPan),
      accNumber: encrypt(plainAcc),
      ifscCode: encrypt(plainIfsc),
      permanentAddress: encrypt(plainAddress),
      user: {
        email: 'john.doe@example.com',
        role: 'TEACHER',
        isActive: true,
      },
    };

    it('should return fully decrypted clear values when queried by SUPER_ADMIN', async () => {
      mockPrismaService.staff.findFirst.mockResolvedValue(encryptedStaffRecord);

      const result = await service.getStaffById('inst-1', 'staff-1', 'SUPER_ADMIN');

      expect(result.aadhaarNumber).toBe(plainAadhaar);
      expect(result.panNumber).toBe(plainPan);
      expect(result.accNumber).toBe(plainAcc);
      expect(result.ifscCode).toBe(plainIfsc);
      expect(result.permanentAddress).toBe(plainAddress);
    });

    it('should return fully decrypted clear values when queried by INSTITUTE_ADMIN', async () => {
      mockPrismaService.staff.findFirst.mockResolvedValue(encryptedStaffRecord);

      const result = await service.getStaffById('inst-1', 'staff-1', 'INSTITUTE_ADMIN');

      expect(result.aadhaarNumber).toBe(plainAadhaar);
      expect(result.panNumber).toBe(plainPan);
    });

    it('should return fully decrypted clear values when queried by HR_MANAGER', async () => {
      mockPrismaService.staff.findFirst.mockResolvedValue(encryptedStaffRecord);

      const result = await service.getStaffById('inst-1', 'staff-1', 'HR_MANAGER');

      expect(result.aadhaarNumber).toBe(plainAadhaar);
      expect(result.panNumber).toBe(plainPan);
    });

    it('should return masked values when queried by TEACHER or standard roles', async () => {
      mockPrismaService.staff.findFirst.mockResolvedValue(encryptedStaffRecord);

      const result = await service.getStaffById('inst-1', 'staff-1', 'TEACHER');

      // The last 4 digits should be visible, others masked as X
      expect(result.aadhaarNumber).toBe('XXXXXXXX9012');
      expect(result.panNumber).toBe('XXXXXX234F');
      expect(result.accNumber).toBe('XXXXXX3210');
      expect(result.ifscCode).toBe('XXXXXXX1234');
      expect(result.permanentAddress).toBe('Masked for Privacy');
    });
  });
});
