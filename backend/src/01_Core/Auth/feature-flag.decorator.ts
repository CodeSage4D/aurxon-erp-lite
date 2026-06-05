import { SetMetadata } from '@nestjs/common';

export const FeatureFlag = (featureCode: string) => SetMetadata('featureCode', featureCode);
