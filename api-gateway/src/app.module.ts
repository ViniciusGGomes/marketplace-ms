import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProxyModule } from './proxy/proxy.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { LoggingMiddleware } from './middleware/logging/logging.middleware';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { HealthModule } from './health/health.module';
import { FallbackModule } from './common/fallback/fallback.module';
import { CircuitBreakerModule } from './common/circuit-breaker/circuit-breaker.module';
import { TimeoutModule } from './common/timeout/timeout.module';
import { RetryModule } from './common/retry/retry.module';
import { UsersModule } from './users/users.module';
import { ProductsController } from './products/products.controller';
import { ProductsModule } from './products/products.module';
import { CheckoutModule } from './checkout/checkout.module';
import { PaymentsModule } from './payments/payments.module';
import { MetricsModule } from './metrics/metrics.module';
import { HttpMetricsMiddleware } from './metrics/http-metrics.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: configService.get<number>('RATE_LIMIT_SHORT', 10),
        },
        {
          name: 'medium',
          ttl: 60000, // 1 minute
          limit: configService.get<number>('RATE_LIMIT_MEDIUM', 100),
        },
        {
          name: 'LONG',
          ttl: 900000, // 15 minutes
          limit: configService.get<number>('RATE_LIMIT_LONG', 1000),
        },
      ],
      inject: [ConfigService],
    }),
    ProxyModule,
    MiddlewareModule,
    AuthModule,
    HealthModule,
    FallbackModule,
    CircuitBreakerModule,
    TimeoutModule,
    RetryModule,
    UsersModule,
    ProductsModule,
    CheckoutModule,
    PaymentsModule,
    MetricsModule,
  ],
  controllers: [ProductsController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMetricsMiddleware).forRoutes('*');
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
