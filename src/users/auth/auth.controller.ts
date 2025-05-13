import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthService } from './auth.service';
import { User } from '../users.entity';
import { LoginDto } from '../dto/login.dto';
import { LoginResponse } from '../login-response';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { UserService } from '../user/user.service';
import { AuthGuard } from '../auth.guard';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto): Promise<User> {
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    const accessToken = await this.authService.login(dto.email, dto.password);
    return new LoginResponse({ accessToken });
  }

  @Get('/profile')
  @UseGuards(AuthGuard)
  async profile(@Request() request: AuthRequest): Promise<User> {
    const user = await this.userService.findOne(request.user.sub);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
