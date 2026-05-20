import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { ConfigModule } from '@nestjs/config';
import { PaymentQueueService } from './payment-queue/payment-queue.service';

@Module({
  imports: [ConfigModule],
  providers: [RabbitMQService, PaymentQueueService],
  exports: [RabbitMQService, PaymentQueueService],
})
export class EventsModule {}
