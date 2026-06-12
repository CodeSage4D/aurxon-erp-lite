// IEEE 1016 compliant Indian Postal Address Lookup Service
// Uses India Post's 6-digit PIN code system for structured address auto-population

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../KERNEL/Authentication/jwt-auth.guard';
import { INDIAN_PINCODE_DATA } from './pincode.data';

@Controller('admission/address')
@UseGuards(JwtAuthGuard)
export class AddressLookupController {
  @Get('pincode/:pin')
  lookupPincode(@Param('pin') pin: string) {
    if (!/^\d{6}$/.test(pin)) {
      return { found: false, message: 'PIN code must be exactly 6 digits' };
    }

    const result = INDIAN_PINCODE_DATA[pin];
    if (!result) {
      return { found: false, message: 'No address data found for this PIN code. Please enter manually.' };
    }

    return {
      found: true,
      pinCode: pin,
      city: result.city,
      district: result.district,
      state: result.state,
      postOffices: result.postOffices || [],
    };
  }
}
