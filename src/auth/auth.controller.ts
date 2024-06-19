import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  
  @Post('signUp')
  SignUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('signIn')
  SignIn(@Body() createUserDto: LoginDto) {
    return this.authService.login(createUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivatedRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @Req() request: Express.Request,
    @RawHeaders() rawHeaders: string[]
  ) {

    return {
      ok: true,
      message: 'Hola mundo private',
      user: user,
      userEmail,
      rawHeaders
    }
  }

  @Get('private2')
  @RoleProtected(ValidRoles.user)
  //@SetMetadata('roles', ['admin', 'super-user', 'user'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivatedRoute2(
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      user: user,
      
    }
  }

  @Get('private3')
  @Auth(ValidRoles.user)
  testingPrivatedRoute3(
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      user: user,
      
    }
  }

  @Get('check-auth-status')
  @Auth(ValidRoles.user)
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus(user);
  }

}
