import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthServices } from 'src/auth/services/auth.services';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authServices: AuthServices) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const sessionToken = request.headers['x-session-token'];

    if (!sessionToken) {
      throw new UnauthorizedException('Session token required ');
    }

    try {
      const session =
        await this.authServices.validateSessionToken(sessionToken);

      if (!session.valid || !session.user) {
        throw new UnauthorizedException('Invalid session token');
      }

      request.user = session.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid session token');
    }
  }
}
