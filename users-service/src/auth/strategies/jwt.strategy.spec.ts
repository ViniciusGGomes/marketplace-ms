import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../users/enums/user-role.enum';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);
  });

  it('should map payload sub to id and return email and role', () => {
    const result = strategy.validate({
      sub: 'uuid-123',
      email: 'user@example.com',
      role: UserRole.BUYER,
    });

    expect(result).toEqual({
      id: 'uuid-123',
      email: 'user@example.com',
      role: UserRole.BUYER,
    });
  });
});
