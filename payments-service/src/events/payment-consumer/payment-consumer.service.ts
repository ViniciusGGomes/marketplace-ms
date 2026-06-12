import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PaymentQueueService } from '../payment-queue/payment-queue.service';
import { PaymentOrderMessage } from '../payment-queue.interface';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { PaymentsService } from 'src/payments/payments.service';
import { PaymentResultPublisherService } from '../payment-result-publish/payment-result-publisher.service';

@Injectable()
export class PaymentConsumerService implements OnModuleInit {
  private readonly logger = new Logger(PaymentConsumerService.name);

  constructor(
    private readonly paymentQueueService: PaymentQueueService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly paymentsService: PaymentsService,
    private readonly paymentResultPublisherService: PaymentResultPublisherService,
  ) {}

  private validateMessage(message: PaymentOrderMessage): boolean {
    // Verificações básicas
    if (!message.orderId) {
      this.logger.error('Missing orderId in payment message');
      return false;
    }

    if (!message.userId) {
      this.logger.error('Missing userId in payment message');
      return false;
    }

    if (!message.amount || message.amount <= 0) {
      this.logger.error('Invalid amount in payment message');
      return false;
    }

    if (!message.paymentMethod) {
      this.logger.error('Missing paymentMethod in payment message');
      return false;
    }

    // Validação dos itens
    if (!message.items || message.items.length === 0) {
      this.logger.error('No items in payment message');
      return false;
    }

    // Todas validações passaram
    return true;
  }

  private async processPaymentOrder(
    message: PaymentOrderMessage,
  ): Promise<void> {
    try {
      if (!this.validateMessage(message)) {
        this.logger.error('❌ Invalid payment message received');
        throw new Error('Invalid payment message received');
      }
      const payment = await this.paymentsService.processPayment(message);

      try {
        await this.paymentResultPublisherService.publishPaymentResult(payment);
      } catch (publishError) {
        this.logger.error(
          `⚠️ Failed to publish payment result for orderId=${message.orderId}, payment is saved and can be queried via REST`,
          publishError,
        );
      }

      this.logger.log('✅ Payment order processed successfully');
    } catch (error) {
      this.logger.error(
        `❌ Failed to process payment for order ${message.orderId}:`,
        error,
      );
      throw error;
    }
  }

  async startConsuming() {
    try {
      this.logger.log('👂 Starting to consume payment orders from queue');

      const isConnected = await this.rabbitMQService.waitForConnection();

      if (!isConnected) {
        this.logger.error(
          '❌ Could not connect to RabbitMQ after multiple attempts',
        );
        return;
      }

      await this.paymentQueueService.consumePaymentOrders(
        this.processPaymentOrder.bind(this),
      );

      this.logger.log('✅ Payment Consumer Service started successfully');
    } catch (error) {
      this.logger.error('❌ Failed to start consuming payment orders:', error);
    }
  }

  async onModuleInit() {
    this.logger.log('🚀 Starting Payment Consumer Service');
    await this.startConsuming();
  }
}
