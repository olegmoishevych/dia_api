import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Res,
  NotFoundException,
  Req,
  UnauthorizedException,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAndLoginDto } from './dto/registration.dto';
import { Response, Request } from 'express';
import { ChangePasswordDto } from './dto/сhangePassword.dto';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('registration')
  async userRegistration(
    @Body() { email, password }: RegisterAndLoginDto,
  ): Promise<{ message: string }> {
    await this.authService.registration(email, password);
    return { message: 'User successfully registered' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() { email, password }: RegisterAndLoginDto,
    @Res() response: Response,
  ): Promise<unknown> {
    const { access_token, refresh_token } = await this.authService.login(
      email,
      password,
    );

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return response.json({ access_token });
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('refresh')
  async refreshToken(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<unknown> {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) throw new NotFoundException('Refresh token not found');

    const { access_token, refresh_token } = await this.authService.refreshToken(
      refreshToken,
    );

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return response.json({ access_token });
  }

  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Req() request: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');

    return this.authService.changePassword(refreshToken, changePasswordDto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('delete-account')
  async deleteAccount(@Req() request: Request): Promise<{ message: string }> {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    return this.authService.deleteAccount(refreshToken);
  }
}
