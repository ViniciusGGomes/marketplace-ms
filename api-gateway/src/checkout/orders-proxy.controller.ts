import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/strategies/jwt.strategy';
import { ProxyService } from 'src/proxy/service/proxy.service';
import { CheckoutDto } from './dtos/checkout.dto';

@Controller()
export class OrderProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('cart/checkout')
  async checkout(
    @Body() body: CheckoutDto,
    @Headers('authorization') authorization: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.proxyRequest(
      'checkout',
      'POST',
      '/cart/checkout',
      body,
      { authorization },
      user,
    );
  }
  @Get('orders')
  async listOrders(
    @Headers('authorization') authorization: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.proxyRequest(
      'checkout',
      'GET',
      '/orders',
      undefined,
      { authorization },
      user,
    );
  }

  @Get('orders/:id')
  async getOrder(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.proxyRequest(
      'checkout',
      'GET',
      `/orders/${id}`,
      undefined,
      { authorization },
      user,
    );
  }
}
