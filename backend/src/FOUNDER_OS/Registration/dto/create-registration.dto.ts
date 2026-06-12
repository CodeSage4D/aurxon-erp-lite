import { IsEmail, IsNotEmpty, IsString, IsOptional, IsInt, IsArray, IsBoolean } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  orgName: string;

  @IsString()
  @IsNotEmpty()
  orgType: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsInt()
  @IsOptional()
  expectedUsers?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requestedModules?: string[];

  @IsString()
  @IsOptional()
  industryPackCode?: string;

  @IsString()
  @IsOptional()
  orgSize?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requestedFeatures?: string[];

  @IsString()
  @IsOptional()
  adminName?: string;

  @IsEmail()
  @IsOptional()
  adminEmail?: string;

  @IsString()
  @IsOptional()
  adminPhone?: string;

  @IsString()
  @IsOptional()
  adminPassword?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  adminGender?: string;

  @IsString()
  @IsOptional()
  adminRole?: string;

  @IsBoolean()
  @IsOptional()
  requestManualApproval?: boolean;

  @IsString()
  @IsOptional()
  gstNumber?: string;
}

