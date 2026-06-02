import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
    // 💡 Tipamos o Request localmente para o ESLint saber que o .user é do tipo correto
    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();

    const user = request.user;

    // Se você passar uma propriedade (ex: @CurrentUser('id')), retorna só ela. Se não, retorna o objeto user inteiro.
    return data ? user?.[data] : user;
  },
);
