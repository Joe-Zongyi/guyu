import { IsNotEmpty, IsString, IsObject, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Shape mirrors agent-layer AssessStateInputSchema (inputs.ts).
// Deep validation lives in agent-layer Zod; DTO only enforces top-level contract.
export class AssessStateDto {
  @ApiProperty({ example: 'req_abc' })
  @IsString()
  @IsNotEmpty()
  request_id: string;

  @ApiProperty({ example: 'plant-123' })
  @IsString()
  @IsNotEmpty()
  plant_id: string;

  @ApiProperty({
    description: 'FileRef-shaped image descriptor.',
    example: {
      file_id: 'file_xxx',
      url: 'https://example.com/plant-state.jpg',
      content_type: 'image/jpeg',
    },
  })
  @IsObject()
  @IsNotEmpty()
  image: Record<string, unknown>;

  @ApiProperty({
    description: 'Minimal species reference for assessment.',
    example: { taxonomy_id: 'monstera_deliciosa', common_name: '龟背竹' },
  })
  @IsObject()
  @IsNotEmpty()
  profile: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Prior assessment summaries; omit or send [] for first assessment.',
    type: 'array',
    example: [],
  })
  @IsOptional()
  @IsArray()
  recent_assessments?: Array<Record<string, unknown>>;
}
