import { Module } from '@nestjs/common';
import { PaymentsProxyController } from './payments-proxy.controller';
import { ProxyModule } from '../proxy/proxy.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ProxyModule, AuthModule],
  controllers: [PaymentsProxyController],
})
export class PaymentsModule {}
