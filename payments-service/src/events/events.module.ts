import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentQueueService } from './payment-queue/payment-queue.service';
import { PaymentConsumerService } from './payment-consumer/payment-consumer.service';
import { DlqService } from './dlq/dlq.service';
import { PaymentsModule } from '../payments/payments.module';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { PaymentResultPublisherService } from './payment-result-publish/payment-result-publisher.service';

@Module({
  imports: [ConfigModule, PaymentsModule],
  controllers: [],
  providers: [
    RabbitMQService,
    PaymentQueueService,
    PaymentConsumerService,
    DlqService,
    PaymentResultPublisherService,
  ],
  exports: [RabbitMQService],
})
export class EventsModule {}
