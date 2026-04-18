import { IsNotEmpty, IsString, IsArray, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmProfileDto {
  @ApiProperty({
    description: 'Unique request identifier for tracking',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  request_id: string;

  @ApiProperty({
    description: 'Unique plant identifier',
    example: 'plant-123',
  })
  @IsString()
  @IsNotEmpty()
  plant_id: string;

  @ApiProperty({
    description: 'Confirmed plant profile',
    type: 'object',
    example: {
      species_id: 'monstera_deliciosa',
      common_name: 'Monstera',
      scientific_name: 'Monstera deliciosa',
      variety: 'Deliciosa',
      confidence: 0.95,
    },
  })
  @IsNotEmpty()
  profile: {
    species_id: string;
    common_name: string;
    scientific_name: string;
    variety: string;
    confidence: number;
    [key: string]: any;
  };

  @ApiProperty({
    description: 'Plant care preferences',
    required: false,
    example: {
      'watering.frequency': 'weekly',
      'lighting.level': 'bright_indirect',
    },
  })
  @IsOptional()
  preferences?: Record<string, string>;
}
