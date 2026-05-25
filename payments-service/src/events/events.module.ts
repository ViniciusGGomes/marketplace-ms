import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { PaymentQueueService } from './payment-queue/payment-queue.service';
import { ConfigModule } from '@nestjs/config';
import { PaymentConsumerService } from './payment-consumer/payment-consumer.service';
import { DlqService } from './dlq/dlq.service';
import { DtqController } from './dlq/dlq.controller';
import { MetricsService } from './metrics/metrics.service';
import { MetricsController } from './metrics/metrics.controller';

@Module({
  imports: [ConfigModule],
  providers: [
    RabbitMQService,
    PaymentQueueService,
    PaymentConsumerService,
    DlqService,
    MetricsService,
  ],
  exports: [RabbitMQService, PaymentQueueService],
  controllers: [DtqController, MetricsController],
})
export class EventsModule {}
