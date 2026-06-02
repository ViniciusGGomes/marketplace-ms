import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CheckoutDto } from 'src/cart/dtos/checkout.dto';
import { Order } from './entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('cart/checkout')
  checkout(
    @CurrentUser('id') userId: string,
    @Body() dto: CheckoutDto,
  ): Promise<Order> {
    return this.ordersService.checkout(userId, dto);
  }

  @Get('orders')
  findAll(@CurrentUser('id') userId: string): Promise<Order[]> {
    return this.ordersService.findAll(userId);
  }

  @Get('orders/:id')
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Order> {
    return this.ordersService.findOne(userId, id);
  }
}
