import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { PaymentQueueService } from './payment-queue/payment-queue.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [RabbitMQService, PaymentQueueService],
  exports: [RabbitMQService, PaymentQueueService],
})
export class EventsModule {}
