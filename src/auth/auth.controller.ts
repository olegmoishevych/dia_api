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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 404, description: 'User already exists' })
  @HttpCode(HttpStatus.CREATED)
  @Post('registration')
  async userRegistration(
    @Body() { email, password }: RegisterAndLoginDto,
  ): Promise<{ message: string }> {
    await this.authService.registration(email, password);
    return { message: 'User successfully registered' };
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Incorrect password' })
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

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 201, description: 'Access token refreshed' })
  @ApiResponse({ status: 404, description: 'No refresh token provided' })
  @ApiResponse({ status: 403, description: 'Invalid refresh token' })
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

  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Incorrect old password or new password too short' })
  @ApiResponse({ status: 401, description: 'No refresh token provided' })
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

  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'No refresh token provided' })
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
