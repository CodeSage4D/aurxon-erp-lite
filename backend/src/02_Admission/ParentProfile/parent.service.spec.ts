import { Test, TestingModule } from '@nestjs/testing';
import { ParentService } from './parent.service';
import { PrismaService } from '../../01_Core/prisma/prisma.service';
import { encrypt } from '../../common/helpers/encryption.helper';

// Ensure the encryption key is defined for the tests
process.env.BACKEND_ENCRYPTION_KEY = '12345678901234567890123456789012';

describe('ParentService (PII Encryption & Masking)', () => {
  let service: ParentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    parent: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    student: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ParentService>(ParentService);
    prisma = module.get<PrismaService>(PrismaService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    const plainAadhaar = '999988887777';
    const plainPhone = '9876543210';
    const plainAddress = '123, Parent Street, New Delhi';

    const encryptedParentRecord = {
      id: 'parent-1',
      firstName: 'Alice',
      lastName: 'Smith',
      phone: encrypt(plainPhone),
      address: encrypt(plainAddress),
      aadhaarNumber: encrypt(plainAadhaar),
      user: {
        id: 'user-parent-1',
        email: 'alice.smith@example.com',
        isActive: true,
        role: 'PARENT',
      },
    };

    it('should return fully decrypted clear values when queried by SUPER_ADMIN', async () => {
      mockPrismaService.parent.findFirst.mockResolvedValue(encryptedParentRecord);

      const result = await service.findOne('inst-1', 'parent-1', 'SUPER_ADMIN');

      expect(result.aadhaarNumber).toBe(plainAadhaar);
      expect(result.phone).toBe(plainPhone);
      expect(result.address).toBe(plainAddress);
    });

    it('should return fully decrypted clear values when queried by INSTITUTE_ADMIN', async () => {
      mockPrismaService.parent.findFirst.mockResolvedValue(encryptedParentRecord);

      const result = await service.findOne('inst-1', 'parent-1', 'INSTITUTE_ADMIN');

      expect(result.aadhaarNumber).toBe(plainAadhaar);
      expect(result.phone).toBe(plainPhone);
    });

    it('should return fully decrypted clear values when queried by HR_MANAGER', async () => {
      mockPrismaService.parent.findFirst.mockResolvedValue(encryptedParentRecord);

      const result = await service.findOne('inst-1', 'parent-1', 'HR_MANAGER');

      expect(result.aadhaarNumber).toBe(plainAadhaar);
      expect(result.phone).toBe(plainPhone);
    });

    it('should return masked values when queried by PARENT or standard roles', async () => {
      mockPrismaService.parent.findFirst.mockResolvedValue(encryptedParentRecord);

      const result = await service.findOne('inst-1', 'parent-1', 'PARENT');

      expect(result.aadhaarNumber).toBe('XXXXXXXX7777');
      expect(result.phone).toBe('XXXXXX3210');
      expect(result.address).toBe('Masked for Privacy');
    });
  });
});
