import { Controller, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('payments/:orderId')
  async findOrderId(@Param('orderId') orderId: string) {
    return await this.paymentsService.findOrderId(orderId);
  }
}
