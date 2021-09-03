import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/model/user.schema';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        return request?.cookies?.access_token;
      }]),
    });
  }

  async validate(payload: JwtPayload): Promise<UserDocument> {
    const { email } = payload;
    const user: UserDocument = await this.usersService.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Não autorizado');
    }

    return user;
  }
}
