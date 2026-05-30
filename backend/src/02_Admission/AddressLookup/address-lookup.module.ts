import { Module } from '@nestjs/common';
import { AddressLookupController } from './address-lookup.controller';

@Module({
  controllers: [AddressLookupController],
})
export class AddressLookupModule {}
