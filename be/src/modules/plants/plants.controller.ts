import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentService } from '../agent/agent.service.js';
import { PlantsService } from './plants.service.js';
import { AnalyzeProfileDto } from './dto/analyze-profile.dto.js';
import { ConfirmProfileDto } from './dto/confirm-profile.dto.js';
import { DailyAdviceDto } from './dto/daily-advice.dto.js';
import { AssessStateDto } from './dto/assess-state.dto.js';
import { GeneratePixelArtDto } from './dto/generate-pixel-art.dto.js';

@ApiTags('plants')
@Controller('v1/plants')
export class PlantsController {
  constructor(
    private readonly agentService: AgentService,
    private readonly plantsService: PlantsService,
  ) {}

  @Post('profile/analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze plant image to identify species' })
  @ApiResponse({ status: 200, description: 'Profile analysis result' })
  async analyzeProfile(@Body() dto: AnalyzeProfileDto) {
    return this.agentService.analyzeProfile(dto);
  }

  @Post('profile/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm and create plant profile' })
  @ApiResponse({ status: 200, description: 'Confirmed plant profile' })
  async confirmProfile(@Body() dto: ConfirmProfileDto) {
    // Create plant in database from confirmed profile
    const plant = await this.plantsService.createPlant({
      user_id: 'user_default', // Should come from auth context
      plant_id: dto.plant_id,
      taxonomy_id: dto.profile.species_id ?? dto.plant_id,
      common_name: dto.profile.common_name,
      scientific_name: dto.profile.scientific_name,
      variety: dto.profile.variety,
    });

    return {
      status: 'success',
      request_id: dto.request_id,
      data: {
        plant_id: plant.plant_id,
        profile: dto.profile,
        preferences: dto.preferences,
        created_at: plant.created_at.toISOString(),
      },
    };
  }

  @Post('daily-advice/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate daily care advice' })
  @ApiResponse({ status: 200, description: 'Daily care advice' })
  async generateDailyAdvice(@Body() dto: DailyAdviceDto) {
    return this.agentService.generateDailyAdvice(dto);
  }

  @Post('state/assess')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assess plant health state' })
  @ApiResponse({ status: 200, description: 'Plant state assessment' })
  async assessState(@Body() dto: AssessStateDto) {
    return this.agentService.assessState(dto);
  }

  @Post('pixel-art/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate pixel-art rendering of plant image' })
  @ApiResponse({ status: 200, description: 'Generated pixel-art images' })
  async generatePixelArt(@Body() dto: GeneratePixelArtDto) {
    return this.agentService.generatePixelArt(dto);
  }

  @Get(':plantId')
  @ApiOperation({ summary: 'Get plant details with aggregation' })
  @ApiResponse({ status: 200, description: 'Complete plant data' })
  async getPlantDetails(@Param('plantId') plantId: string) {
    const plant = await this.plantsService.getPlantById(plantId);
    const rhythm = await this.plantsService.getRhythmData(plantId);

    const latestAdvice = plant.advice_snapshots[0];
    const dailyAdvice = latestAdvice
      ? {
          advice_date: latestAdvice.advice_date.toISOString().split('T')[0],
          actions: latestAdvice.actions ? JSON.parse(latestAdvice.actions) : [],
          warnings: latestAdvice.warnings ? JSON.parse(latestAdvice.warnings) : [],
          mood: latestAdvice.mood,
          weather_snapshot: latestAdvice.weather_snapshot
            ? JSON.parse(latestAdvice.weather_snapshot)
            : null,
        }
      : null;

    const latestAssessment = plant.assessments[0];

    return {
      plant_id: plant.plant_id,
      profile: {
        taxonomy_id: plant.taxonomy_id,
        common_name: plant.common_name,
        scientific_name: plant.scientific_name,
        variety: plant.variety,
        location: plant.location,
        pot_size: plant.pot_size,
        light_level: plant.light_level,
        pot_type: plant.pot_type,
      },
      daily_advice: dailyAdvice,
      latest_assessment: latestAssessment
        ? {
            id: latestAssessment.id,
            overall_state: latestAssessment.overall_state,
            signals: latestAssessment.signals ? JSON.parse(latestAssessment.signals) : [],
            confidence: latestAssessment.confidence,
            suggestions: latestAssessment.suggestions ? JSON.parse(latestAssessment.suggestions) : [],
            escalation_flag: latestAssessment.escalation_flag,
            image_url: latestAssessment.image_url,
            assessed_at: latestAssessment.assessed_at.toISOString(),
          }
        : null,
      rhythm_summary: rhythm,
      care_events: plant.care_events.map(e => ({
        id: e.id,
        event_type: e.event_type,
        date: e.date.toISOString(),
        details: e.details ? JSON.parse(e.details) : null,
        source: e.source,
        created_at: e.created_at.toISOString(),
      })),
      created_at: plant.created_at.toISOString(),
      updated_at: plant.updated_at.toISOString(),
    };
  }

  @Get(':plantId/rhythm')
  @ApiOperation({ summary: 'Get plant rhythm data' })
  @ApiResponse({ status: 200, description: 'Rhythm trends and history' })
  async getPlantRhythm(@Param('plantId') plantId: string) {
    return this.plantsService.getRhythmData(plantId);
  }

  @Post(':plantId/care-events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a care event' })
  @ApiResponse({ status: 201, description: 'Care event recorded' })
  async createCareEvent(
    @Param('plantId') plantId: string,
    @Body() body: {
      event_type: string;
      details?: Record<string, unknown>;
      source?: string;
      request_id?: string;
    },
  ) {
    const event = await this.plantsService.createCareEvent({
      plant_id: plantId,
      event_type: body.event_type,
      details: body.details,
      source: body.source,
      request_id: body.request_id,
    });

    return {
      status: 'success',
      data: {
        event_id: event.id,
        plant_id: event.plant_id,
        event_type: event.event_type,
        created_at: event.created_at.toISOString(),
      },
    };
  }

  @Get(':plantId/care-events')
  @ApiOperation({ summary: 'Get care events for a plant' })
  @ApiResponse({ status: 200, description: 'List of care events' })
  async getCareEvents(
    @Param('plantId') plantId: string,
    @Query('limit') limit?: string,
  ) {
    const events = await this.plantsService.getCareEvents(
      plantId,
      limit ? parseInt(limit, 10) : 50,
    );

    return {
      plant_id: plantId,
      events: events.map(e => ({
        event_id: e.id,
        event_type: e.event_type,
        date: e.date.toISOString(),
        details: e.details ? JSON.parse(e.details) : null,
        source: e.source,
        created_at: e.created_at.toISOString(),
      })),
    };
  }
}
