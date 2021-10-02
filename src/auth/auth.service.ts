import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDTO } from './dto/login.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(
    loginDTO: LoginDTO,
    response: Response,
  ): Promise<{ message: string }> {
    const { email, password } = loginDTO;
    const user = await this.usersService.getUserByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { name: user.name, email };
      const accessToken: string = this.jwtService.sign(payload);

      response.cookie('access_token', accessToken, {
        httpOnly: true,
        domain: this.configService.get('APP_FRONT_DOMAIN'),
        expires: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours
      });

      return { message: 'success' };
    } else {
      throw new UnauthorizedException('Email e/ou senha inválidos');
    }
  }

  async logout(response: Response): Promise<{ message: string }> {
    response.clearCookie('access_token');
    return { message: 'success' };
  }

}
