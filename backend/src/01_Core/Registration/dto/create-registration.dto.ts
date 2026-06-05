import { IsEmail, IsNotEmpty, IsString, IsOptional, IsInt, IsArray } from 'class-validator';

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
}
