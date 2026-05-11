import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthServices } from '../services/auth.services';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from '../dtos/login.sto';
import { RegisterDto } from '../dtos/register.dto';

@ApiTags('Authentication')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private authServices: AuthServices) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Login do usuário',
    description: 'Autentica um usuário e retorna JWT e session token',
  })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  @Throttle({ medium: { limit: 3, ttl: 60000 } })
  async register(@Body() registerDto: RegisterDto) {
    return this.authServices.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registro de usuário',
    description: 'Cria uma nova conta de usuário no sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        accessToken: { type: 'string' },
        sessionToken: { type: 'string' },
        expiresIn: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Throttle({ medium: { limit: 5, ttl: 60000 } })
  async login(@Body() loginDto: LoginDto) {
    return this.authServices.login(loginDto);
  }
}
