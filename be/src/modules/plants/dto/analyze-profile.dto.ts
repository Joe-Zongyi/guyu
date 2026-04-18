import { IsNotEmpty, IsString, IsOptional, IsObject, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Mirrors agent-layer FileRefSchema (primitives.ts).
class FileRefDto {
  @ApiProperty({ example: 'file_xxx' })
  @IsString()
  @IsNotEmpty()
  file_id: string;

  @ApiPropertyOptional({ example: 'https://example.com/plant.jpg' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ example: 'image/jpeg' })
  @IsOptional()
  @IsString()
  content_type?: string;

  @ApiPropertyOptional({ example: '2026-04-18T09:00:00Z' })
  @IsOptional()
  @IsString()
  captured_at?: string;
}

// Mirrors agent-layer AnalyzeProfileInputSchema (inputs.ts).
export class AnalyzeProfileDto {
  @ApiProperty({ example: 'user_demo' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ type: FileRefDto })
  @IsObject()
  @ValidateNested()
  @Type(() => FileRefDto)
  image: FileRefDto;

  @ApiPropertyOptional({ example: 'Shanghai' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ example: 'req_xxx' })
  @IsString()
  @IsNotEmpty()
  request_id: string;
}
