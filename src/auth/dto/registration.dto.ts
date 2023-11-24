import { ApiProperty } from '@nestjs/swagger';

export class RegisterAndLoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password' })
  password: string;
}
