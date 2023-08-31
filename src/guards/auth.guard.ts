import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "./../users/users.service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private usersService: UsersService) { }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    try {
      const data = this.usersService.checkToken((authorization ?? "").split(" ")[1]);
      const user = await this.usersService.getUserById(parseInt(data.sub));
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException("User unauthorized due to invalid token.");
    }
  }
}
