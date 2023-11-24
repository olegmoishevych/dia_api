import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123', description: 'The old password' })
  oldPassword: string;

  @ApiProperty({ example: 'newPassword123', description: 'The new password' })
  newPassword: string;
}
