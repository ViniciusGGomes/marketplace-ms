import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { EventsModule } from '../events/events.module';
import { RabbitMQHealthIndicator } from './rabbitmq.health.indicator';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TerminusModule, EventsModule, HttpModule],
  controllers: [HealthController],
  providers: [RabbitMQHealthIndicator],
})
export class HealthModule {}
