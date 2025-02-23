import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {


  constructor(
    private readonly reflector: Reflector
  ) {

  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {


    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;

    if (!user) {
      throw new BadRequestException('User not found');
    }
    console.log(user.roles, validRoles);

    // user.roles.forEach(role => {
    //   if(validRoles.includes(role)){
    //     return true;
    //   }
    // });

    if (validRoles === null || validRoles === undefined || validRoles.length == 0) {
      return true;
    }

    if (user.roles.some(x => validRoles.includes(x))) {
      return true;
    }

    throw new ForbiddenException(`User ${user.fullName} need a valid role`);
  }
}
