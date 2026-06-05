import { SetMetadata } from '@nestjs/common';

export const ModuleActive = (moduleCode: string) => SetMetadata('moduleCode', moduleCode);
