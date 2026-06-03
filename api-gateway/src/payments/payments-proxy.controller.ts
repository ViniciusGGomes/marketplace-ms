import { Controller, Param, Headers, Get } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/strategies/jwt.strategy';
import { ProxyService } from 'src/proxy/service/proxy.service';

@Controller('payments')
export class PaymentsProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('orderId')
  async getPaymentByOrderID(
    @Param('orderId') orderId: string,
    @Headers('authorization') authorization: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.proxyRequest(
      'payments',
      'GET',
      `/payments/${orderId}`,
      undefined,
      { authorization },
      user,
    );
  }
}
