import { IsNotEmpty, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Shape mirrors agent-layer GenerateDailyAdviceInputSchema (inputs.ts).
// Deep field validation is done by agent-layer's Zod schema; this DTO only guards
// required top-level keys and basic types to keep a single source of truth.
export class DailyAdviceDto {
  @ApiProperty({ example: 'req_abc' })
  @IsString()
  @IsNotEmpty()
  request_id: string;

  @ApiProperty({ example: 'plant-123' })
  @IsString()
  @IsNotEmpty()
  plant_id: string;

  @ApiProperty({
    description: 'Inline plant profile snapshot (from confirmed profile).',
    example: {
      taxonomy_id: 'monstera_deliciosa',
      common_name: '龟背竹',
      scientific_name: 'Monstera deliciosa',
      plant_type_tags: ['foliage', 'indoor'],
      care_baseline: {
        watering_rule: '土表 2-3 厘米干后浇透',
        light_rule: '明亮散射光',
      },
      risk_flags: [],
    },
  })
  @IsObject()
  @IsNotEmpty()
  profile: Record<string, unknown>;

  @ApiProperty({
    description: "Today's context: date (YYYY-MM-DD), optional season/weather, care events.",
    example: {
      date: '2026-04-18',
      season: 'spring',
      weather_snapshot: {
        condition: 'sunny',
        temperature_c: 22,
        humidity: 55,
        light_level: 'high',
      },
      recent_care_events: [],
    },
  })
  @IsObject()
  @IsNotEmpty()
  today_context: Record<string, unknown>;
}
