import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { DatabaseService } from '../../src/database/database.service.js';

describe('Aggregation APIs Integration Tests', () => {
  let app: INestApplication;
  let db: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    db = moduleFixture.get<DatabaseService>(DatabaseService);
    await app.init();
  });

  beforeEach(async () => {
    await db.dailyAdviceSnapshot.deleteMany({
      where: { plant: { plant_id: { contains: 'test' } } },
    });
    await db.plantStateAssessment.deleteMany({
      where: { plant: { plant_id: { contains: 'test' } } },
    });
    await db.careEvent.deleteMany({
      where: { plant: { plant_id: { contains: 'test' } } },
    });
    await db.plant.deleteMany({
      where: { plant_id: { contains: 'test' } },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /v1/plants/:plantId with aggregation', () => {
    it('should include daily_advice when snapshot exists', async () => {
      const plant = await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_agg_001',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      await db.dailyAdviceSnapshot.create({
        data: {
          plant_id: plant.id,
          advice_date: new Date(),
          actions: JSON.stringify([
            { type: 'water', priority: 'high', reason: '土壤干燥', suggested_time: 'morning' },
          ]),
          warnings: JSON.stringify(['注意通风']),
          mood: 'cheerful',
          weather_snapshot: JSON.stringify({ temperature: 22, humidity: 55 }),
        },
      });

      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_agg_001',
      );

      expect(response.status).toBe(200);
      expect(response.body.daily_advice).toBeDefined();
      expect(response.body.daily_advice.actions).toHaveLength(1);
      expect(response.body.daily_advice.actions[0].type).toBe('water');
      expect(response.body.daily_advice.mood).toBe('cheerful');
      expect(response.body.daily_advice.weather_snapshot).toEqual({ temperature: 22, humidity: 55 });
    });

    it('should return null daily_advice when no snapshot exists', async () => {
      await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_agg_002',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_agg_002',
      );

      expect(response.status).toBe(200);
      expect(response.body.daily_advice).toBeNull();
    });

    it('should include parsed latest_assessment', async () => {
      const plant = await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_agg_003',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      await db.plantStateAssessment.create({
        data: {
          plant_id: plant.id,
          overall_state: 'healthy',
          signals: JSON.stringify(['leaf_vibrant', 'new_growth']),
          confidence: 0.92,
          suggestions: JSON.stringify(['继续保持当前养护']),
          escalation_flag: false,
        },
      });

      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_agg_003',
      );

      expect(response.status).toBe(200);
      expect(response.body.latest_assessment).toBeDefined();
      expect(response.body.latest_assessment.overall_state).toBe('healthy');
      expect(response.body.latest_assessment.signals).toContain('leaf_vibrant');
      expect(response.body.latest_assessment.confidence).toBe(0.92);
      expect(response.body.latest_assessment.suggestions).toContain('继续保持当前养护');
    });

    it('should include parsed care_events', async () => {
      const plant = await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_agg_004',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      await db.careEvent.create({
        data: {
          plant_id: plant.id,
          event_type: 'watered',
          details: JSON.stringify({ amount: '500ml' }),
          source: 'user',
        },
      });

      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_agg_004',
      );

      expect(response.status).toBe(200);
      expect(response.body.care_events).toBeDefined();
      expect(response.body.care_events.length).toBe(1);
      expect(response.body.care_events[0].event_type).toBe('watered');
      expect(response.body.care_events[0].details).toEqual({ amount: '500ml' });
    });
  });

  describe('GET /v1/videos', () => {
    it('should return video recommendations', async () => {
      const response = await request(app.getHttpServer()).get('/v1/videos');

      expect(response.status).toBe(200);
      expect(response.body.videos).toBeDefined();
      expect(Array.isArray(response.body.videos)).toBe(true);
      expect(response.body.videos.length).toBeGreaterThan(0);
      expect(response.body.total).toBeDefined();
    });

    it('should filter videos by tag', async () => {
      const response = await request(app.getHttpServer()).get('/v1/videos?tag=' + encodeURIComponent('浇水'));

      expect(response.status).toBe(200);
      expect(response.body.videos.every((v: any) => v.tags.includes('浇水'))).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app.getHttpServer()).get('/v1/videos?limit=2');

      expect(response.status).toBe(200);
      expect(response.body.videos.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /v1/videos/:id', () => {
    it('should return video details', async () => {
      const response = await request(app.getHttpServer()).get('/v1/videos/vid_001');

      expect(response.status).toBe(200);
      expect(response.body.video).toBeDefined();
      expect(response.body.video.id).toBe('vid_001');
    });

    it('should return failed status for non-existent video', async () => {
      const response = await request(app.getHttpServer()).get('/v1/videos/vid_nonexistent');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('failed');
    });
  });

  describe('GET /v1/creators/similar', () => {
    it('should return similar creators', async () => {
      const response = await request(app.getHttpServer()).get('/v1/creators/similar');

      expect(response.status).toBe(200);
      expect(response.body.creators).toBeDefined();
      expect(Array.isArray(response.body.creators)).toBe(true);
      expect(response.body.total).toBeDefined();
    });

    it('should filter creators by tag', async () => {
      const response = await request(app.getHttpServer()).get('/v1/creators/similar?tag=' + encodeURIComponent('病虫害'));

      expect(response.status).toBe(200);
      expect(response.body.creators.every((c: any) => c.tags.includes('病虫害'))).toBe(true);
    });
  });

  describe('GET /v1/creators/:id', () => {
    it('should return creator details', async () => {
      const response = await request(app.getHttpServer()).get('/v1/creators/creator_001');

      expect(response.status).toBe(200);
      expect(response.body.creator).toBeDefined();
      expect(response.body.creator.id).toBe('creator_001');
    });

    it('should return failed status for non-existent creator', async () => {
      const response = await request(app.getHttpServer()).get('/v1/creators/creator_nonexistent');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('failed');
    });
  });
});
