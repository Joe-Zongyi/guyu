import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { DatabaseService } from '../../src/database/database.service.js';

describe('Plant Management Integration Tests', () => {
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
    // Clean up test data
    await db.careEvent.deleteMany({
      where: { plant_id: { contains: 'test' } },
    });
    await db.plant.deleteMany({
      where: { plant_id: { contains: 'test' } },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/plants/profile/confirm', () => {
    it('should create plant in database on profile confirmation', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/profile/confirm')
        .send({
          request_id: 'req_confirm_001',
          plant_id: 'plant_test_confirm_001',
          profile: {
            species_id: 'monstera_deliciosa',
            common_name: '龟背竹',
            scientific_name: 'Monstera deliciosa',
            variety: 'Deliciosa',
            confidence: 0.95,
          },
          preferences: {
            'watering.frequency': 'weekly',
          },
        });

      expect(response.status).toBe(200);
      if (response.body.status !== 'success') {
        console.log('Confirm response:', JSON.stringify(response.body, null, 2));
      }
      expect(response.body.status).toBe('success');
      expect(response.body.data.plant_id).toBe('plant_test_confirm_001');

      // Verify in database
      const plant = await db.plant.findUnique({
        where: { plant_id: 'plant_test_confirm_001' },
      });

      expect(plant).toBeDefined();
      expect(plant?.common_name).toBe('龟背竹');
      expect(plant?.taxonomy_id).toBe('monstera_deliciosa');
    });

    it('should return created_at from database', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/plants/profile/confirm')
        .send({
          request_id: 'req_confirm_002',
          plant_id: 'plant_test_confirm_002',
          profile: {
            species_id: 'pothos_aureum',
            common_name: '绿萝',
            confidence: 0.92,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.created_at).toBeDefined();
      expect(new Date(response.body.data.created_at).getTime()).toBeGreaterThan(0);
    });
  });

  describe('GET /v1/plants/:plantId', () => {
    it('should return plant details with profile data', async () => {
      // Create a plant first
      await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_get_001',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
          scientific_name: 'Monstera deliciosa',
          location: 'indoor',
          pot_size: 'medium',
        },
      });

      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_get_001',
      );

      expect(response.status).toBe(200);
      expect(response.body.plant_id).toBe('plant_test_get_001');
      expect(response.body.profile).toBeDefined();
      expect(response.body.profile.common_name).toBe('龟背竹');
      expect(response.body.profile.taxonomy_id).toBe('monstera_deliciosa');
      expect(response.body.profile.location).toBe('indoor');
      expect(response.body.rhythm_summary).toBeDefined();
      expect(response.body.care_events).toBeDefined();
    });

    it('should return 404 for non-existent plant', async () => {
      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_nonexistent_999',
      );

      expect(response.status).toBe(404);
    });

    it('should include care events in plant details', async () => {
      const plant = await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_events_001',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      await db.careEvent.create({
        data: {
          plant_id: plant.id,
          event_type: 'watered',
          source: 'user',
        },
      });

      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_events_001',
      );

      expect(response.status).toBe(200);
      expect(response.body.care_events.length).toBeGreaterThan(0);
      expect(response.body.care_events[0].event_type).toBe('watered');
    });
  });

  describe('GET /v1/plants/:plantId/rhythm', () => {
    it('should return rhythm data structure', async () => {
      await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_rhythm_001',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_rhythm_001/rhythm',
      );

      expect(response.status).toBe(200);
      expect(response.body.plant_id).toBe('plant_test_rhythm_001');
      expect(response.body.streak).toBeDefined();
      expect(response.body.stability).toBeDefined();
      expect(response.body.history).toBeDefined();
      expect(Array.isArray(response.body.history)).toBe(true);
    });

    it('should calculate streak based on recent water events', async () => {
      const plant = await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_rhythm_002',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      // Add a recent water event
      await db.careEvent.create({
        data: {
          plant_id: plant.id,
          event_type: 'watered',
          created_at: new Date(Date.now() - 86400000), // 1 day ago
        },
      });

      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_rhythm_002/rhythm',
      );

      expect(response.status).toBe(200);
      expect(response.body.total_water_events).toBe(1);
      expect(response.body.days_since_last_water).toBe(1);
    });
  });

  describe('POST /v1/plants/:plantId/care-events', () => {
    it('should create a care event', async () => {
      const plant = await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_care_001',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/v1/plants/plant_test_care_001/care-events')
        .send({
          event_type: 'watered',
          details: { amount: '500ml', method: 'pour' },
          source: 'user',
          request_id: 'req_care_001',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.event_type).toBe('watered');
      expect(response.body.data.plant_id).toBe(plant.id);
    });

    it('should create fertilize event', async () => {
      await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_care_002',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/v1/plants/plant_test_care_002/care-events')
        .send({
          event_type: 'fertilized',
          details: { fertilizer_type: 'liquid', amount: '10ml' },
        });

      expect(response.status).toBe(201);
      expect(response.body.data.event_type).toBe('fertilized');
    });

    it('should create prune event', async () => {
      await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_care_003',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/v1/plants/plant_test_care_003/care-events')
        .send({
          event_type: 'pruned',
          details: { removed_leaves: 2 },
        });

      expect(response.status).toBe(201);
      expect(response.body.data.event_type).toBe('pruned');
    });
  });

  describe('GET /v1/plants/:plantId/care-events', () => {
    it('should list care events for a plant', async () => {
      const plant = await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_list_001',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      await db.careEvent.createMany({
        data: [
          {
            plant_id: plant.id,
            event_type: 'watered',
          },
          {
            plant_id: plant.id,
            event_type: 'fertilized',
          },
        ],
      });

      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_list_001/care-events',
      );

      expect(response.status).toBe(200);
      expect(response.body.plant_id).toBe('plant_test_list_001');
      expect(response.body.events.length).toBe(2);
      expect(response.body.events.map((e: any) => e.event_type)).toContain('watered');
      expect(response.body.events.map((e: any) => e.event_type)).toContain('fertilized');
    });

    it('should respect limit parameter', async () => {
      const plant = await db.plant.create({
        data: {
          user_id: 'user_test',
          plant_id: 'plant_test_limit_001',
          taxonomy_id: 'monstera_deliciosa',
          common_name: '龟背竹',
        },
      });

      await db.careEvent.createMany({
        data: Array.from({ length: 10 }, (_, i) => ({
          plant_id: plant.id,
          event_type: 'watered',
        })),
      });

      const response = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_limit_001/care-events?limit=5',
      );

      expect(response.status).toBe(200);
      expect(response.body.events.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Plant CRUD operations', () => {
    it('should create and retrieve plant', async () => {
      // Create via API
      const createResponse = await request(app.getHttpServer())
        .post('/v1/plants/profile/confirm')
        .send({
          request_id: 'req_crud_001',
          plant_id: 'plant_test_crud_001',
          profile: {
            species_id: 'ficus_lyrata',
            common_name: '琴叶榕',
            confidence: 0.9,
          },
        });

      expect(createResponse.status).toBe(200);

      // Retrieve
      const getResponse = await request(app.getHttpServer()).get(
        '/v1/plants/plant_test_crud_001',
      );

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.profile.common_name).toBe('琴叶榕');
      expect(getResponse.body.profile.taxonomy_id).toBe('ficus_lyrata');
    });
  });
});
