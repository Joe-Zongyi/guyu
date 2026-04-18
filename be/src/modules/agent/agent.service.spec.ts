import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AgentService } from './agent.service.js';
import { VisionProviderService } from './vision-provider.service.js';

describe('AgentService', () => {
  let service: AgentService;
  let visionProviderService: VisionProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        VisionProviderService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AGENT_VISION_PROVIDER') return 'fake';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
    visionProviderService = module.get<VisionProviderService>(VisionProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with FakeVisionProvider', () => {
    const provider = visionProviderService.getProvider();
    expect(provider).toBeDefined();
    expect(provider.constructor.name).toBe('FakeVisionProvider');
  });

  it('should analyze profile with valid input', async () => {
    const input = {
      user_id: 'user-test',
      request_id: 'test-request-id',
      image: {
        file_id: 'f1',
        url: 'https://example.com/plant.jpg',
        content_type: 'image/jpeg',
      },
    };

    const result = await service.analyzeProfile(input);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('request_id', 'test-request-id');
    expect(result).toHaveProperty('status');
    expect(['needs_confirmation', 'failed']).toContain(result.status);
  });

  it('should generate daily advice with valid input', async () => {
    const input = {
      request_id: 'test-request-id',
      plant_id: 'plant-123',
      profile: {
        taxonomy_id: 'monstera_deliciosa',
        common_name: 'Monstera',
        scientific_name: 'Monstera deliciosa',
        plant_type_tags: ['foliage', 'indoor'],
        care_baseline: {
          watering_rule: 'Water when top 2-3cm dry',
          light_rule: 'Bright indirect',
        },
        risk_flags: [],
      },
      today_context: {
        date: '2026-04-18',
        season: 'spring',
        weather_snapshot: {
          condition: 'sunny',
          temperature_c: 22,
          humidity: 65,
          light_level: 'high',
        },
        recent_care_events: [],
      },
    };

    const result = await service.generateDailyAdvice(input);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('request_id', 'test-request-id');
    expect(result).toHaveProperty('status');
    expect(['success', 'failed']).toContain(result.status);
  });

  it('should assess state with valid input', async () => {
    const input = {
      request_id: 'test-request-id',
      plant_id: 'plant-123',
      profile: {
        taxonomy_id: 'monstera_deliciosa',
        common_name: 'Monstera',
      },
      image: {
        file_id: 'file_state_1',
        url: 'https://example.com/plant-state.jpg',
        content_type: 'image/jpeg',
      },
      recent_assessments: [],
    };

    const result = await service.assessState(input);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('request_id', 'test-request-id');
    expect(result).toHaveProperty('status');
    expect(['success', 'failed']).toContain(result.status);
  });

  it('should handle invalid input gracefully', async () => {
    const input = { invalid: 'data' };

    const result = await service.analyzeProfile(input);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('status');
    expect(['failed', 'needs_retry']).toContain(result.status);
    expect(result).toHaveProperty('error_code');
  });
});
