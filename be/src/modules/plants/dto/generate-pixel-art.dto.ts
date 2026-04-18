import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsUrl,
} from 'class-validator';
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

// Mirrors agent-layer GeneratePixelArtInputSchema (inputs.ts).
export class GeneratePixelArtDto {
  @ApiProperty({ type: FileRefDto })
  @IsObject()
  @ValidateNested()
  @Type(() => FileRefDto)
  image: FileRefDto;

  @ApiPropertyOptional({ type: [FileRefDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileRefDto)
  style_references?: FileRefDto[];

  @ApiPropertyOptional({
    example:
      'A cozy 16-bit pixel-art monstera in a terracotta pot, warm sunset palette.',
  })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  variants?: number;

  @ApiProperty({ example: 'req_xxx' })
  @IsString()
  @IsNotEmpty()
  request_id: string;
}
