/**
 * Manual real-API end-to-end tests.
 *
 * These tests exercise the actual cloud provider configured in
 * .env.development (e.g. openai-compatible / openrouter).
 *
 * Run separately from the main test suite:
 *   NODE_OPTIONS=--experimental-vm-modules npx jest --config jest.real-api.config.cjs --runInBand
 *
 * Prerequisites:
 *   - Valid API key(s) in .env.development
 *   - Sufficient rate-limit quota
 *   - Internet connectivity
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { describe } from 'node:test';

describe('Real Provider E2E Tests', () => {
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
    it('should return needs_confirmation with real vision provider', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/profile/analyze')
        .send({
          user_id: 'user_real_test',
          image: {
            file_id: 'file_real_monstera',
            // Public plant image URL (Unsplash)
            url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80',
            content_type: 'image/jpeg',
          },
          region: 'Shanghai',
          request_id: 'req_real_analyze_001',
        });

      // Guard against rate-limit failures
      if (response.body.status === 'failed') {
        console.warn('Real API analyzeProfile failed:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.request_id).toBe('req_real_analyze_001');

      if (response.body.status === 'success' || response.body.status === 'needs_confirmation') {
        expect(response.body.data).toBeDefined();
        expect(response.body.data.taxonomy_id).toBeDefined();
        expect(response.body.data.common_name).toBeDefined();
        expect(response.body.data.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe('POST /v1/plants/state/assess', () => {
    it('should return assessment with real vision provider', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/state/assess')
        .send({
          user_id: 'user_real_test',
          plant_id: 'plant_real_001',
          image: {
            file_id: 'file_real_assess',
            url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80',
            content_type: 'image/jpeg',
          },
          request_id: 'req_real_assess_001',
          today_context: {
            date: '2026-04-19',
            season: 'spring',
            weather_snapshot: {
              condition: 'sunny',
              temperature_c: 22,
              humidity: 55,
              light_level: 'high',
            },
          },
          recent_care_events: [
            {
              event_type: 'watered',
              occurred_at: '2026-04-15T10:00:00Z',
            },
          ],
          recent_assessments: [],
        });

      if (response.body.status === 'failed') {
        console.warn('Real API assessState failed:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.request_id).toBe('req_real_assess_001');

      if (response.body.status === 'success') {
        expect(response.body.data).toBeDefined();
        expect(response.body.data.overall_state).toBeDefined();
        expect(response.body.data.signals).toBeDefined();
        expect(Array.isArray(response.body.data.signals)).toBe(true);
      }
    });
  });

  describe('POST /v1/plants/daily-advice/generate', () => {
    it('should return daily advice (no vision required)', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/daily-advice/generate')
        .send({
          request_id: 'req_real_advice_001',
          plant_id: 'plant_real_001',
          profile: {
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
          today_context: {
            date: '2026-04-19',
            season: 'spring',
            weather_snapshot: {
              condition: 'sunny',
              temperature_c: 22,
              humidity: 55,
              light_level: 'high',
            },
            recent_care_events: [],
          },
        });

      if (response.body.status === 'failed') {
        console.warn('Real API generateDailyAdvice failed:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.request_id).toBe('req_real_advice_001');

      if (response.body.status === 'success') {
        expect(response.body.data).toBeDefined();
        expect(response.body.data.actions).toBeDefined();
        expect(Array.isArray(response.body.data.actions)).toBe(true);
        expect(response.body.data.today_summary).toBeDefined();
      }
    });
  });

  describe('POST /v1/plants/pixel-art/generate', () => {
    it('should generate pixel-art with real image generation provider', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/pixel-art/generate')
        .send({
          request_id: 'req_real_pixelart_001',
          image: {
            file_id: 'file_real_pixelart',
            // Public plant image URL (Unsplash)
            url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80',
            content_type: 'image/jpeg',
          },
          prompt: 'cozy 16-bit pixel-art monstera in a terracotta pot, warm sunset palette',
          variants: 1,
        });

      if (response.body.status === 'failed') {
        console.warn('Real API generatePixelArt failed:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.request_id).toBe('req_real_pixelart_001');

      if (response.body.status === 'success') {
        expect(response.body.data).toBeDefined();
        expect(response.body.data.source_image_id).toBe('file_real_pixelart');
        expect(response.body.data.style).toBe('pixel_art');
        expect(response.body.data.images).toBeDefined();
        expect(Array.isArray(response.body.data.images)).toBe(true);
        expect(response.body.data.images.length).toBeGreaterThan(0);

        const firstImage = response.body.data.images[0];
        expect(firstImage.file_id).toBeDefined();
        expect(firstImage.url).toBeDefined();
        expect(response.body.data.provider_metadata).toBeDefined();
      }
    });
  });
});

