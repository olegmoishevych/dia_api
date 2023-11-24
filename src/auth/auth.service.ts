import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { ChangePasswordDto } from './dto/сhangePassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async registration(email: string, password: string): Promise<void> {
    const users = await this.databaseService.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );

    if (users.length) throw new NotFoundException('User already exists');
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.databaseService.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
    );
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const users = await this.databaseService.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );

    if (!users.length) throw new NotFoundException('User not found');
    const user = users[0];

    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Incorrect password');
    }

    const payload = { email: user.email, userId: user.id };
    const refreshToken = randomBytes(64).toString('hex');

    await this.databaseService.query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, user.id],
    );

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
    };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    if (!refreshToken) {
      throw new NotFoundException('No refresh token provided');
    }

    const user = await this.databaseService.query(
      'SELECT * FROM users WHERE refresh_token = ?',
      [refreshToken],
    );

    if (!user.length) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const newRefreshToken = randomBytes(64).toString('hex');
    await this.databaseService.query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [newRefreshToken, user[0].id],
    );

    const payload = { email: user[0].email, userId: user[0].id };
    const newAccessToken = this.jwtService.sign(payload);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async changePassword(
    refreshToken: string,
    { oldPassword, newPassword }: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.databaseService.query(
      'SELECT * FROM users WHERE refresh_token = ?',
      [refreshToken],
    );

    if (!user.length) throw new NotFoundException('User not found');

    const passwordIsValid = await bcrypt.compare(oldPassword, user[0].password);
    if (!passwordIsValid)
      throw new BadRequestException('Incorrect old password');

    if (newPassword.length < 8) {
      throw new BadRequestException(
        'New password must be at least 8 characters long',
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.databaseService.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, user[0].id],
    );

    return { message: 'Password successfully changed' };
  }

  async deleteAccount(refreshToken: string): Promise<{ message: string }> {
    const user = await this.databaseService.query(
      'SELECT * FROM users WHERE refresh_token = ?',
      [refreshToken],
    );

    if (!user.length) throw new NotFoundException('User not found');

    await this.databaseService.query('DELETE FROM users WHERE id = ?', [
      user[0].id,
    ]);

    return { message: 'Account successfully deleted' };
  }
}
