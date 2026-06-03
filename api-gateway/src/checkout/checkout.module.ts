import { Module } from '@nestjs/common';
import { CartProxyController } from './cart-proxy.controller';
import { OrderProxyController } from './orders-proxy.controller';
import { ProxyModule } from 'src/proxy/proxy.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ProxyModule, AuthModule],
  controllers: [CartProxyController, OrderProxyController],
})
export class CheckoutModule {}
