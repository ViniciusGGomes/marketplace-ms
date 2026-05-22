import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { PaymentQueueService } from './payment-queue/payment-queue.service';
import { ConfigModule } from '@nestjs/config';
import { PaymentConsumerService } from './payment-consumer/payment-consumer.service';

@Module({
  imports: [ConfigModule],
  providers: [RabbitMQService, PaymentQueueService, PaymentConsumerService],
  exports: [RabbitMQService, PaymentQueueService],
})
export class EventsModule {}
