import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(
    @Body() loginDTO: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    return this.authService.login(loginDTO, response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    return this.authService.logout(response);
  }

}
