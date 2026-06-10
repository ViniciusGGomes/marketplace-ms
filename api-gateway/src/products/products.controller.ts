import { Body, Controller, Post, Headers, Get, Param } from '@nestjs/common';
import { ProxyService } from 'src/proxy/service/proxy.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/strategies/jwt.strategy';

@Controller('products')
export class ProductsController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post()
  async create(
    @Body() body: CreateProductDto,
    @Headers('authorization') authorization: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.proxyRequest(
      'products',
      'POST',
      '/products',
      body,
      { authorization },
      user,
    );
  }

  @Get()
  async findAll() {
    return this.proxyService.proxyRequest('products', 'GET', '/products');
  }

  @Get('seller/:sellerId')
  async findBySeller(@Param('sellerId') sellerId: string) {
    return this.proxyService.proxyRequest(
      'products',
      'GET',
      `/products/seller/${sellerId}`,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.proxyService.proxyRequest('products', 'GET', `/products/${id}`);
  }
}
