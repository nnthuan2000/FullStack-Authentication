import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...user } = createUserDto;
    const hashedPassword = await argon2.hash(password);

    return await this.prisma.user.create({
      data: {
        password: hashedPassword,
        ...user,
      },
    });
  }

  async findByEmail(email: string) {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    return foundUser;
  }
}
