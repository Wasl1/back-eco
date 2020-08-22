import { Injectable, ExecutionContext, HttpException, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info: Error, context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const hasRole = () => user.roles.some((role) => roles.includes(role));
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!(user.roles && hasRole())) {
      throw new HttpException('Vous n\'êtes pas autorisé', HttpStatus.OK);
    }
    return user && user.roles && hasRole();
  }
}
