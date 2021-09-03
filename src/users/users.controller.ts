import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { UserDocument } from './model/user.schema';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/get-user')
  getAuthUser(
    @GetUser() user: UserDocument,
  ): Promise<UserDocument> {
    return this.usersService.getAuthUser(user);
  }

}
