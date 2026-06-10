import { Controller, Get, Param, Headers } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/strategies/jwt.strategy';
import { ProxyService } from 'src/proxy/service/proxy.service';

@Controller('users')
export class UsersProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('profile')
  getProfile(
    @Headers('authorization') authHeader: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.proxyRequest(
      'users',
      'GET',
      '/users/profile',
      undefined,
      { Authorization: authHeader },
      user,
    );
  }

  @Get('sellers')
  getActiveSellers(
    @Headers('authorization') authHeader: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.proxyRequest(
      'users',
      'GET',
      '/users/sellers',
      undefined,
      { Authorization: authHeader },
      user,
    );
  }

  @Get(':id')
  getById(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proxyService.proxyRequest(
      'users',
      'GET',
      `/users/${id}`,
      undefined,
      { Authorization: authHeader },
      user,
    );
  }
}
