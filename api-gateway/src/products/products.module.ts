import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProxyModule } from 'src/proxy/proxy.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ProxyModule, AuthModule],
  controllers: [ProductsController],
})
export class ProductsModule {}
