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
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getUserById(id: Types.ObjectId): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID "${id}" inválido`);
    }

    const found = await this.userModel.findOne({_id: id, disabled: null});

    if (!found) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
    }
    return found;
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({email});
  }

}
