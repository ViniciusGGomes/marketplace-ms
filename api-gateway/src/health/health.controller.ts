import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { serviceConfig } from 'src/config/gateway.config';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.http.pingCheck(
          'users-service',
          `${serviceConfig.users.url}/health`,
        ),
      () =>
        this.http.pingCheck(
          'products-service',
          `${serviceConfig.products.url}/health`,
        ),
      () =>
        this.http.pingCheck(
          'checkout-service',
          `${serviceConfig.checkout.url}/health`,
        ),
      () =>
        this.http.pingCheck(
          'payments-service',
          `${serviceConfig.payments.url}/health`,
        ),
    ]);
  }
}
