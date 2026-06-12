import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AddCartItemDto } from './dtos/add-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  async addItem(
    @CurrentUser('id') userId: string,
    @Body() dto: AddCartItemDto,
  ) {
    return await this.cartService.addItem(userId, dto);
  }

  @Get()
  getCar(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Delete('items/:itemId')
  removeItem(
    @CurrentUser('id') userId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.cartService.removeItem(userId, itemId);
  }
}
