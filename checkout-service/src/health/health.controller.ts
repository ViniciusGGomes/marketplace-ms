import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  getHealth() {
    return {
      status: 'OK',
      service: 'Checkout Service',
      timestamp: new Date().toISOString(),
    };
  }
}
