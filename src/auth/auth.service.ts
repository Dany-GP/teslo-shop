import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import * as bcrypt from "bcrypt";
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {

  }


  async checkAuthStatus(user: User){
    return {
      ...user,
      token: this._getJwtToken({ id: user.id })
    };
  }

  async createUser(userDto: CreateUserDto) {
    try {

      const { password, ...userData } = userDto;



      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);




      return {
        user: user.email,
        fullName: user.fullName,
        roles: user.roles,
        token: this._getJwtToken({ id: user.id })
      };

    } catch (error) {
      this._handleDbErrors(error);
    }
  }

  async login(userDto: LoginDto) {

    const { password, email } = userDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true
      }
    });

    if (!user) {
      throw new UnauthorizedException("User not exists");
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException("Crendentials are not valid");
    }

    return {
      ...user,
      token: this._getJwtToken({ id: user.id })
    };

    // try {

    // } catch (error) {
    //   this._handleDbErrors(error);
    // }
  }


  private _getJwtToken(payload: JwtPayload): string {

    const token = this.jwtService.sign(payload);

    return token;
  }

  private _handleDbErrors(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException("User already exists");
    }
    console.log(error);
    throw new InternalServerErrorException("Unexpected error, Check logs");

  }
}
