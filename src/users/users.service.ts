import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './model/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
  ) {}

  async getUserById(id: Types.ObjectId): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID de usuário "${id}" inválido`);
    }
    const found = await this.usersModel
      .findOne({
        _id: id,
        inactivated: null,
      })
      .select('-roles')
      .exec();

    if (!found) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
    }
    return found;
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    return await this.usersModel.findOne({email});
  }

}
