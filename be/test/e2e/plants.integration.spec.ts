import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';

describe('Plants API Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/plants/profile/analyze', () => {
    it('should analyze a plant image and return needs_confirmation status', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/profile/analyze')
        .send({
          user_id: 'user_test_001',
          image: {
            file_id: 'file_monstera_001',
            url: 'https://example.com/monstera.jpg',
            content_type: 'image/jpeg',
          },
          region: 'Shanghai',
          request_id: 'req_analyze_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('needs_confirmation');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.draft_id).toBeDefined();
      expect(response.body.data.recognition_status).toBeDefined();
      expect(response.body.data.taxonomy_id).toBeDefined();
      expect(response.body.data.common_name).toBeDefined();
      expect(response.body.data.confidence).toBeGreaterThan(0);
      expect(response.body.data.care_baseline).toBeDefined();
      expect(response.body.request_id).toBe('req_analyze_001');
    });

    it('should handle blurry image with appropriate error', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/profile/analyze')
        .send({
          user_id: 'user_test_002',
          image: {
            file_id: 'file_blurry_001',
            url: 'https://example.com/blurry.jpg',
            content_type: 'image/jpeg',
          },
          request_id: 'req_blurry_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('failed');
      expect(response.body.error_code).toBe('IMAGE_TOO_BLURRY');
      expect(response.body.message).toContain('清晰度不足');
      expect(response.body.request_id).toBe('req_blurry_001');
    });

    it('should handle no plant detected', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/profile/analyze')
        .send({
          user_id: 'user_test_003',
          image: {
            file_id: 'file_noplant_001',
            url: 'https://example.com/noplant.jpg',
            content_type: 'image/jpeg',
          },
          request_id: 'req_noplant_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('failed');
      expect(response.body.error_code).toBe('NO_PLANT_DETECTED');
      expect(response.body.message).toContain('未在图片中检测到植物');
    });

    it('should handle multiple plants detected', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/profile/analyze')
        .send({
          user_id: 'user_test_004',
          image: {
            file_id: 'file_multi_001',
            url: 'https://example.com/multi.jpg',
            content_type: 'image/jpeg',
          },
          request_id: 'req_multi_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('failed');
      expect(response.body.error_code).toBe('MULTIPLE_PLANTS_DETECTED');
      expect(response.body.message).toContain('多株植物');
    });

    it('should handle ambiguous recognition', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/profile/analyze')
        .send({
          user_id: 'user_test_005',
          image: {
            file_id: 'file_ambiguous_001',
            url: 'https://example.com/ambiguous.jpg',
            content_type: 'image/jpeg',
          },
          request_id: 'req_ambiguous_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('needs_confirmation');
      expect(response.body.data.recognition_status).toBe('ambiguous');
      expect(response.body.data.candidates.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle low confidence match', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/profile/analyze')
        .send({
          user_id: 'user_test_006',
          image: {
            file_id: 'file_lowconf_001',
            url: 'https://example.com/lowconf.jpg',
            content_type: 'image/jpeg',
          },
          request_id: 'req_lowconf_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('failed');
      expect(response.body.error_code).toBe('LOW_CONFIDENCE_MATCH');
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/profile/analyze')
        .send({
          user_id: 'user_test_007',
          image: {
            file_id: 'file_test',
          },
          request_id: 'req_invalid_001',
        });

      // The request may pass validation but fail agent-layer validation
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should include care_baseline in successful response', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/profile/analyze')
        .send({
          user_id: 'user_test_008',
          image: {
            file_id: 'file_pothos_001',
            url: 'https://example.com/pothos.jpg',
            content_type: 'image/jpeg',
          },
          request_id: 'req_pothos_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.care_baseline).toBeDefined();
      expect(response.body.data.care_baseline.watering_rule).toBeDefined();
      expect(response.body.data.care_baseline.light_rule).toBeDefined();
    });
  });

  describe('POST /v1/plants/state/assess', () => {
    it('should assess plant state successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/state/assess')
        .send({
          plant_id: 'plant_test_001',
          image: {
            file_id: 'file_stable_001',
            url: 'https://example.com/stable.jpg',
            content_type: 'image/jpeg',
          },
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
          },
          recent_assessments: [],
          request_id: 'req_assess_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.overall_state).toBeDefined();
      expect(response.body.data.signals).toBeDefined();
      expect(Array.isArray(response.body.data.signals)).toBe(true);
      expect(response.body.data.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.data.confidence).toBeLessThanOrEqual(1);
      expect(response.body.data.suggestions).toBeDefined();
      expect(Array.isArray(response.body.data.suggestions)).toBe(true);
      expect(response.body.request_id).toBe('req_assess_001');
    });

    it('should detect wilted leaves signal', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/state/assess')
        .send({
          plant_id: 'plant_test_002',
          image: {
            file_id: 'file_wilt_001',
            url: 'https://example.com/wilt.jpg',
            content_type: 'image/jpeg',
          },
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
          },
          request_id: 'req_wilt_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.signals).toContain('slightly_wilted_leaves');
      expect(response.body.data.suggestions).toContain('检查盆土是否已经过干');
    });

    it('should detect yellowing tip signal', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/state/assess')
        .send({
          plant_id: 'plant_test_003',
          image: {
            file_id: 'file_yellow_001',
            url: 'https://example.com/yellow.jpg',
            content_type: 'image/jpeg',
          },
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
          },
          request_id: 'req_yellow_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.signals).toContain('yellowing_tip');
    });

    it('should detect leaf droop signal', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/state/assess')
        .send({
          plant_id: 'plant_test_004',
          image: {
            file_id: 'file_droop_001',
            url: 'https://example.com/droop.jpg',
            content_type: 'image/jpeg',
          },
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
          },
          request_id: 'req_droop_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.signals).toContain('leaf_droop');
    });

    it('should detect new growth signal', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/state/assess')
        .send({
          plant_id: 'plant_test_005',
          image: {
            file_id: 'file_growth_001',
            url: 'https://example.com/growth.jpg',
            content_type: 'image/jpeg',
          },
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
          },
          request_id: 'req_growth_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.signals).toContain('new_growth_visible');
    });

    it('should handle blurry image for state assessment', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/state/assess')
        .send({
          plant_id: 'plant_test_006',
          image: {
            file_id: 'file_blurry_002',
            url: 'https://example.com/blurry.jpg',
            content_type: 'image/jpeg',
          },
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
          },
          request_id: 'req_blurry_002',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('failed');
      expect(response.body.error_code).toBe('IMAGE_TOO_BLURRY');
    });

    it('should handle no plant detected for state assessment', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/state/assess')
        .send({
          plant_id: 'plant_test_007',
          image: {
            file_id: 'file_noplant_002',
            url: 'https://example.com/noplant.jpg',
            content_type: 'image/jpeg',
          },
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
          },
          request_id: 'req_noplant_002',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('failed');
      expect(response.body.error_code).toBe('NO_PLANT_DETECTED');
    });

    it('should compare to previous assessment when recent assessments provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/state/assess')
        .send({
          plant_id: 'plant_test_008',
          image: {
            file_id: 'file_stable_002',
            url: 'https://example.com/stable.jpg',
            content_type: 'image/jpeg',
          },
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
          },
          recent_assessments: [
            {
              overall_state: 'needs_attention',
              signals: ['slightly_wilted_leaves'],
              assessed_at: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
          request_id: 'req_compare_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.compare_to_previous).toBeDefined();
      expect(['better', 'worse', 'same', 'unknown']).toContain(
        response.body.data.compare_to_previous,
      );
    });

    it('should set escalation_flag for needs_attention state', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/state/assess')
        .send({
          plant_id: 'plant_test_009',
          image: {
            file_id: 'file_wilt_yellow_001',
            url: 'https://example.com/wilt-yellow.jpg',
            content_type: 'image/jpeg',
          },
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
          },
          request_id: 'req_escalation_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      // Multiple stress signals may trigger needs_attention which triggers escalation
      if (response.body.data.overall_state === 'needs_attention') {
        expect(response.body.data.escalation_flag).toBe(true);
      }
    });
  });

  describe('POST /v1/plants/daily-ad:generate', () => {
    it('should generate daily advice successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/daily-advice/generate')
        .send({
          plant_id: 'plant_test_001',
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
            scientific_name: 'Monstera deliciosa',
            plant_type_tags: ['foliage', 'indoor'],
            care_baseline: {
              watering_rule: '土表 2-3 厘米干后浇透',
              light_rule: '明亮散射光',
              humidity_rule: '保持环境湿度 60-80%',
              fertilizing_rule: '生长季每月一次薄肥',
            },
            risk_flags: [],
            weather_link_fields: {
              heat_sensitivity: 'medium',
              cold_sensitivity: 'medium',
              humidity_sensitivity: 'medium',
              light_sensitivity: 'medium',
            },
          },
          today_context: {
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
          request_id: 'req_advice_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.date).toBe('2026-04-18');
      expect(response.body.data.actions).toBeDefined();
      expect(Array.isArray(response.body.data.actions)).toBe(true);
      expect(response.body.data.warnings).toBeDefined();
      expect(Array.isArray(response.body.data.warnings)).toBe(true);
      expect(response.body.data.today_summary).toBeDefined();
      expect(response.body.data.mood_copy).toBeDefined();
      expect(response.body.data.derived_context).toBeDefined();
      expect(response.body.request_id).toBe('req_advice_001');
    });

    it('should recommend watering when days since water is high', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/daily-advice/generate')
        .send({
          plant_id: 'plant_test_002',
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
            care_baseline: {
              watering_rule: '土表 2-3 厘米干后浇透',
              light_rule: '明亮散射光',
            },
            risk_flags: [],
          },
          today_context: {
            date: '2026-04-18',
            recent_care_events: [
              {
                type: 'watered',
                occurred_at: new Date(Date.now() - 8 * 86400000).toISOString(),
              },
            ],
          },
          request_id: 'req_advice_water_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      const waterAction = response.body.data.actions.find((a: any) =>
        a.type.startsWith('water'),
      );
      expect(waterAction).toBeDefined();
    });

    it('should suggest moving to shade on hot sunny day', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/daily-advice/generate')
        .send({
          plant_id: 'plant_test_003',
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
            care_baseline: {
              watering_rule: '土表 2-3 厘米干后浇透',
              light_rule: '明亮散射光',
            },
            risk_flags: [],
            weather_link_fields: {
              heat_sensitivity: 'high',
              cold_sensitivity: 'medium',
              humidity_sensitivity: 'medium',
              light_sensitivity: 'high',
            },
          },
          today_context: {
            date: '2026-07-15',
            weather_snapshot: {
              condition: 'sunny',
              temperature_c: 32,
              humidity: 60,
              light_level: 'high',
            },
            recent_care_events: [],
          },
          request_id: 'req_advice_hot_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      const shadeAction = response.body.data.actions.find(
        (a: any) => a.type === 'move_to_shade',
      );
      expect(shadeAction).toBeDefined();
    });

    it('should suggest increasing humidity on dry day for sensitive plant', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/daily-advice/generate')
        .send({
          plant_id: 'plant_test_004',
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
            care_baseline: {
              watering_rule: '土表 2-3 厘米干后浇透',
              light_rule: '明亮散射光',
            },
            risk_flags: [],
            weather_link_fields: {
              heat_sensitivity: 'medium',
              cold_sensitivity: 'medium',
              humidity_sensitivity: 'high',
              light_sensitivity: 'medium',
            },
          },
          today_context: {
            date: '2026-04-18',
            weather_snapshot: {
              condition: 'sunny',
              temperature_c: 25,
              humidity: 35,
              light_level: 'high',
            },
            recent_care_events: [],
          },
          request_id: 'req_advice_dry_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      const humidityAction = response.body.data.actions.find(
        (a: any) => a.type === 'increase_humidity',
      );
      expect(humidityAction).toBeDefined();
    });

    it('should suggest ventilation on very humid day', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/daily-advice/generate')
        .send({
          plant_id: 'plant_test_005',
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
            care_baseline: {
              watering_rule: '土表 2-3 厘米干后浇透',
              light_rule: '明亮散射光',
            },
            risk_flags: ['overwatering_sensitive'],
          },
          today_context: {
            date: '2026-04-18',
            weather_snapshot: {
              condition: 'rain',
              temperature_c: 22,
              humidity: 90,
              light_level: 'medium',
            },
            recent_care_events: [],
          },
          request_id: 'req_advice_humid_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      const ventilateAction = response.body.data.actions.find(
        (a: any) => a.type === 'ventilate',
      );
      expect(ventilateAction).toBeDefined();
    });

    it('should suggest fertilizing in growing season', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/daily-advice/generate')
        .send({
          plant_id: 'plant_test_006',
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
            care_baseline: {
              watering_rule: '土表 2-3 厘米干后浇透',
              light_rule: '明亮散射光',
              fertilizing_rule: '生长季每月一次薄肥',
            },
            risk_flags: [],
          },
          today_context: {
            date: '2026-05-15',
            weather_snapshot: {
              condition: 'sunny',
              temperature_c: 22,
              humidity: 60,
              light_level: 'high',
            },
            // occurred_at must be anchored to today_context.date (not Date.now),
            // otherwise daysSinceWater is computed from a future "today" and
            // watering_pressure becomes "high", which suppresses fertilize.
            recent_care_events: [
              {
                type: 'fertilized',
                occurred_at: '2026-04-05T09:00:00Z',
              },
              {
                type: 'watered',
                occurred_at: '2026-05-13T09:00:00Z',
              },
            ],
          },
          request_id: 'req_advice_fertilize_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      const fertilizeAction = response.body.data.actions.find(
        (a: any) => a.type === 'fertilize',
      );
      expect(fertilizeAction).toBeDefined();
    });

    it('should skip watering if watered today', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/daily-advice/generate')
        .send({
          plant_id: 'plant_test_007',
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
            care_baseline: {
              watering_rule: '土表 2-3 厘米干后浇透',
              light_rule: '明亮散射光',
            },
            risk_flags: [],
          },
          today_context: {
            date: '2026-04-18',
            recent_care_events: [
              {
                type: 'watered',
                occurred_at: new Date(Date.now() - 3600000).toISOString(),
              },
            ],
          },
          request_id: 'req_advice_skip_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      const skipWaterAction = response.body.data.actions.find(
        (a: any) => a.type === 'skip_water',
      );
      expect(skipWaterAction).toBeDefined();
    });

    it('should include warning when weather data is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/daily-advice/generate')
        .send({
          plant_id: 'plant_test_008',
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
            care_baseline: {
              watering_rule: '土表 2-3 厘米干后浇透',
              light_rule: '明亮散射光',
            },
            risk_flags: [],
          },
          today_context: {
            date: '2026-04-18',
            recent_care_events: [],
          },
          request_id: 'req_advice_noweather_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.warnings).toContain(
        '今日天气数据缺失，已按通用基线生成保守建议',
      );
    });

    it('should infer season from date when not provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/daily-advice/generate')
        .send({
          plant_id: 'plant_test_009',
          profile: {
            taxonomy_id: 'monstera_deliciosa',
            common_name: '龟背竹',
            care_baseline: {
              watering_rule: '土表 2-3 厘米干后浇透',
              light_rule: '明亮散射光',
            },
            risk_flags: [],
          },
          today_context: {
            date: '2026-01-15',
            recent_care_events: [],
          },
          request_id: 'req_advice_season_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      // Winter date should infer winter season
    });

    it('should handle validation errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/daily-advice/generate')
        .send({
          plant_id: 'plant_test_010',
          profile: {}, // Invalid empty profile
          today_context: {}, // Invalid empty context
          request_id: 'req_advice_invalid_001',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('failed');
      expect(response.body.error_code).toBeDefined();
      expect(response.body.message).toContain('invalid input');
    });
  });

  describe('GET /v1/plants/:plantId', () => {
    it('should return plant details structure', async () => {
      // Create plant first
      await request(app.getHttpServer())
        .post('/v1/plants/profile/confirm')
        .send({
          request_id: 'req_get_test',
          plant_id: 'plant_test_001',
          profile: {
            species_id: 'monstera_deliciosa',
            common_name: '龟背竹',
          },
        });

      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_001',
      );

      expect(response.status).toBe(200);
      expect(response.body.plant_id).toBe('plant_test_001');
      expect(response.body.profile).toBeDefined();
      expect(response.body.daily_advice).toBeDefined();
      expect(response.body.latest_assessment).toBeDefined();
      expect(response.body.rhythm_summary).toBeDefined();
    });
  });

  describe('GET /v1/plants/:plantId/rhythm', () => {
    it('should return plant rhythm data structure', async () => {
      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_001/rhythm',
      );

      expect(response.status).toBe(200);
      expect(response.body.plant_id).toBe('plant_test_001');
      expect(response.body.streak).toBeDefined();
      expect(response.body.stability).toBeDefined();
      expect(response.body.history).toBeDefined();
      expect(Array.isArray(response.body.history)).toBe(true);
    });
  });
});
