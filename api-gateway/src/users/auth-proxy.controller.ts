import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ProxyService } from 'src/proxy/service/proxy.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.proxyService.proxyRequest(
      'users',
      'POST',
      '/auth/register',
      body,
    );
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginDto) {
    return this.proxyService.proxyRequest('users', 'POST', '/auth/login', body);
  }

  @Get('validate-token')
  @UseGuards(JwtAuthGuard)
  validateToken(
    @Headers('authorization') authHeader: string,
    @CurrentUser() user: { userId: string; email: string; role: string },
  ) {
    return this.proxyService.proxyRequest(
      'users',
      'GET',
      '/auth/validate-token',
      undefined,
      { Authorization: authHeader },
      user,
    );
  }
}
