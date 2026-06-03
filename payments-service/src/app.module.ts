import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { EventsModule } from './events/events.module';
import { HealthController } from './health/health.controller';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    EventsModule,
    PaymentsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
