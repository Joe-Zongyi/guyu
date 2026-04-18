import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';

interface CreatePlantInput {
  user_id: string;
  plant_id: string;
  taxonomy_id: string;
  common_name: string;
  scientific_name?: string;
  variety?: string;
  location?: string;
  pot_size?: string;
  light_level?: string;
  pot_type?: string;
}

interface CreateCareEventInput {
  plant_id: string;
  event_type: string;
  date?: Date;
  details?: Record<string, unknown>;
  source?: string;
  request_id?: string;
}

@Injectable()
export class PlantsService {
  private readonly logger = new Logger(PlantsService.name);

  constructor(private readonly db: DatabaseService) {}

  async createPlant(input: CreatePlantInput) {
    const plant = await this.db.plant.create({
      data: {
        user_id: input.user_id,
        plant_id: input.plant_id,
        taxonomy_id: input.taxonomy_id,
        common_name: input.common_name,
        scientific_name: input.scientific_name,
        variety: input.variety,
        location: input.location,
        pot_size: input.pot_size,
        light_level: input.light_level,
        pot_type: input.pot_type,
      },
    });

    this.logger.log(`Plant created: ${input.plant_id}`);
    return plant;
  }

  async getPlantById(plantId: string) {
    const plant = await this.db.plant.findUnique({
      where: { plant_id: plantId },
      include: {
        care_events: {
          orderBy: { created_at: 'desc' },
          take: 50,
        },
        assessments: {
          orderBy: { assessed_at: 'desc' },
          take: 10,
        },
        advice_snapshots: {
          orderBy: { advice_date: 'desc' },
          take: 7,
        },
      },
    });

    if (!plant) {
      throw new NotFoundException(`Plant not found: ${plantId}`);
    }

    return plant;
  }

  async getPlantsByUserId(userId: string) {
    return this.db.plant.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        care_events: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            care_events: true,
            assessments: true,
          },
        },
      },
    });
  }

  async updatePlant(plantId: string, data: Partial<CreatePlantInput>) {
    const plant = await this.db.plant.update({
      where: { plant_id: plantId },
      data: {
        ...(data.common_name && { common_name: data.common_name }),
        ...(data.scientific_name && { scientific_name: data.scientific_name }),
        ...(data.variety && { variety: data.variety }),
        ...(data.location && { location: data.location }),
        ...(data.pot_size && { pot_size: data.pot_size }),
        ...(data.light_level && { light_level: data.light_level }),
        ...(data.pot_type && { pot_type: data.pot_type }),
      },
    });

    this.logger.log(`Plant updated: ${plantId}`);
    return plant;
  }

  async createCareEvent(input: CreateCareEventInput) {
    // Find the internal plant id by public plant_id
    const plant = await this.db.plant.findUnique({
      where: { plant_id: input.plant_id },
    });

    if (!plant) {
      throw new NotFoundException(`Plant not found: ${input.plant_id}`);
    }

    const event = await this.db.careEvent.create({
      data: {
        plant_id: plant.id,
        event_type: input.event_type,
        date: input.date ?? new Date(),
        details: input.details ? JSON.stringify(input.details) : null,
        source: input.source ?? 'user',
        request_id: input.request_id,
      },
    });

    this.logger.log(`Care event created: ${input.event_type} for plant ${input.plant_id}`);
    return event;
  }

  async getCareEvents(plantId: string, limit = 50) {
    const plant = await this.db.plant.findUnique({
      where: { plant_id: plantId },
    });

    if (!plant) return [];

    return this.db.careEvent.findMany({
      where: { plant_id: plant.id },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async getRecentCareEvents(plantId: string, days = 30) {
    const plant = await this.db.plant.findUnique({
      where: { plant_id: plantId },
    });

    if (!plant) return [];

    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.db.careEvent.findMany({
      where: {
        plant_id: plant.id,
        created_at: {
          gte: since,
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getRhythmData(plantId: string) {
    const events = await this.getCareEvents(plantId, 100);

    // Calculate streak (consecutive days with care events)
    const waterEvents = events.filter(e => e.event_type === 'watered');
    const fertilizeEvents = events.filter(e => e.event_type === 'fertilized');

    // Simple streak calculation: days since last care event
    const lastWaterEvent = waterEvents[0];
    const daysSinceLastWater = lastWaterEvent
      ? Math.floor((Date.now() - lastWaterEvent.created_at.getTime()) / 86400000)
      : null;

    // Calculate stability (consistency of care)
    const stability = this.calculateStability(waterEvents);

    // Build history for the last 30 days
    const history = this.buildHistory(events, 30);

    return {
      plant_id: plantId,
      streak: daysSinceLastWater !== null ? Math.max(0, 7 - daysSinceLastWater) : 0,
      stability,
      days_since_last_water: daysSinceLastWater,
      total_water_events: waterEvents.length,
      total_fertilize_events: fertilizeEvents.length,
      history,
    };
  }

  private calculateStability(waterEvents: { created_at: Date }[]): number {
    if (waterEvents.length < 2) return 0;

    // Calculate average interval between waterings
    const intervals: number[] = [];
    for (let i = 0; i < waterEvents.length - 1; i++) {
      const days = Math.floor(
        (waterEvents[i]!.created_at.getTime() - waterEvents[i + 1]!.created_at.getTime()) / 86400000,
      );
      intervals.push(days);
    }

    if (intervals.length === 0) return 0;

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Stability score: 0-100, higher is more consistent
    // If stdDev is low, stability is high
    const stability = Math.max(0, Math.min(100, 100 - stdDev * 10));
    return Math.round(stability);
  }

  private buildHistory(
    events: { event_type: string; created_at: Date }[],
    days: number,
  ): Array<{ date: string; events: string[] }> {
    const history: Array<{ date: string; events: string[] }> = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]!;

      const dayEvents = events.filter(e => {
        const eventDate = e.created_at.toISOString().split('T')[0]!;
        return eventDate === dateStr;
      });

      history.push({
        date: dateStr,
        events: dayEvents.map(e => e.event_type),
      });
    }

    return history;
  }
}
