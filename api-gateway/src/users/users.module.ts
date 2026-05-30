import { Module } from '@nestjs/common';
import { AuthProxyController } from './auth-proxy.controller';
import { ProxyModule } from 'src/proxy/proxy.module';
import { UsersProxyController } from './users-proxy.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ProxyModule, AuthModule],
  controllers: [AuthProxyController, UsersProxyController],
})
export class UsersModule {}
