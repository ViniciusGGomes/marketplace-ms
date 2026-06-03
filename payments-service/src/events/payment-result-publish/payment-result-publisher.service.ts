import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { Payment } from 'src/payments/entities/payment.entity';
import { PaymentResultMessage } from './payment-result.interface';

@Injectable()
export class PaymentResultPublisherService {
  private readonly logger = new Logger(PaymentResultPublisherService.name);

  private readonly exchange = 'payments';
  private readonly routingKey = 'payment.result';

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publishPaymentResult(payment: Payment): Promise<void> {
    const message: PaymentResultMessage = {
      orderId: payment.orderId,
      status: payment.status as 'approved' | 'rejected',
      transactionId: payment.transactionId!,
      rejectionReason: payment.rejectionReason,
      processedAt: payment.processedAt!.toString(),
    };

    await this.rabbitMQService.publishMessage(
      this.exchange,
      this.routingKey,
      message,
    );

    this.logger.log(
      `📤 Payment result published: orderId=${message.orderId}, status=${message.status}`,
    );
  }
}
