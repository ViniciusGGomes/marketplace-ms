import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return await this.usersService.findById(userId);
  }

  @Get('sellers')
  async getActiveSellers() {
    return await this.usersService.findActiveSellers();
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
