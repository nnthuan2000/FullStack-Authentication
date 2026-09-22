import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import type { Request } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { type AuthenticatedUser } from './types/auth-request.type';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  signin(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.login(user.id, user.name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getAll() {
    return 'Now you can access this protected';
  }
}
