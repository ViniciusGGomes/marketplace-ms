import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/strategies/jwt.strategy';
import { UserRole } from './enums/user-role';
import { Public } from 'src/auth/decorators/public.decorator';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.role !== UserRole.SELLER) {
      throw new ForbiddenException('Only sellers can create products');
    }

    return this.productsService.create(createProductDto, user.id);
  }

  @Public()
  @Get()
  async findAll(): Promise<Product[]> {
    return await this.productsService.findAll();
  }

  @Public()
  @Get('seller/:sellerId')
  async findBySeller(@CurrentUser('id') userId: string): Promise<Product[]> {
    return await this.productsService.findBySeller(userId);
  }

  @Public()
  @Get(':id')
  async findOnde(@Param('id') id: string): Promise<Product> {
    return await this.productsService.findOne(id);
  }
}
