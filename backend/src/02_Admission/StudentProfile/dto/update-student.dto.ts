import { IsString, IsOptional, IsEmail, IsDateString, Matches } from 'class-validator';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  rollNumber?: string;

  @IsString()
  @IsOptional()
  classId?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{12}$/, { message: 'Aadhaar number must be exactly 12 numeric digits' })
  aadhaarNumber?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{9}$/, { message: 'Samagra ID must be exactly 9 numeric digits' })
  samagraId?: string;

  @IsString()
  @IsOptional()
  familyId?: string;

  @IsString()
  @IsOptional()
  penNumber?: string;

  @IsString()
  @IsOptional()
  birthCertificateNumber?: string;

  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @IsString()
  @IsOptional()
  religion?: string;

  @IsString()
  @IsOptional()
  casteCategory?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  motherTongue?: string;

  @IsString()
  @IsOptional()
  fatherName?: string;

  @IsString()
  @IsOptional()
  motherName?: string;

  @IsString()
  @IsOptional()
  fatherOccupation?: string;

  @IsString()
  @IsOptional()
  motherOccupation?: string;

  @IsString()
  @IsOptional()
  annualIncome?: string;

  @IsString()
  @IsOptional()
  houseNo?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{6}$/, { message: 'PIN code must be exactly 6 numeric digits' })
  pinCode?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  accHolderName?: string;

  @IsString()
  @IsOptional()
  accNumber?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid bank IFSC code format (e.g. SBIN0004520)' })
  ifscCode?: string;

  @IsString()
  @IsOptional()
  bankBranch?: string;

  @IsString()
  @IsOptional()
  upiId?: string;

  @IsString()
  @IsOptional()
  prevSchoolName?: string;

  @IsString()
  @IsOptional()
  tcNumber?: string;

  @IsString()
  @IsOptional()
  migrationCertNo?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;
}
