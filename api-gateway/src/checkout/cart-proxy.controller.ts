import {
  Body,
  Controller,
  Post,
  Headers,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/strategies/jwt.strategy';
import { ProxyService } from 'src/proxy/service/proxy.service';
import { AddCartItemDto } from './dtos/add-cart-item.dto';

@ApiTags()
@Controller('cart')
export class CartProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('items')
  async addItem(
    @Body() body: AddCartItemDto,
    @Headers('authorization') authorization: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.proxyRequest(
      'checkout',
      'POST',
      '/cart/items',
      body,
      { authorization },
      user,
    );
  }

  @Get()
  async getCart(
    @Headers('authorization') authorization: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.proxyRequest(
      'checkout',
      'GET',
      '/cart',
      undefined,
      { authorization },
      user,
    );
  }

  @Delete('items/:itemId')
  async removeItem(
    @Param('itemId') itemId: string,
    @Headers('authorization') authorization: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.proxyRequest(
      'checkout',
      'DELETE',
      `/cart/items/${itemId}`,
      undefined,
      { authorization },
      user,
    );
  }
}
