import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export enum UserRole {
  SELLER = 'SELLER',
  BUYER = 'BUYER',
}

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // O Passport já usou a secret acima para validar se a assinatura do token é real e se não expirou.
  // Se chegou aqui, o token É VÁLIDO.
  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Retorna os dados decodificados do payload.
    // O NestJS vai injetar esse objeto no request.user, preenchendo o seu @CurrentUser()!
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
