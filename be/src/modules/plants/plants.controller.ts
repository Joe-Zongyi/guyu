import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentService } from '../agent/agent.service.js';
import { AnalyzeProfileDto } from './dto/analyze-profile.dto.js';
import { ConfirmProfileDto } from './dto/confirm-profile.dto.js';
import { DailyAdviceDto } from './dto/daily-advice.dto.js';
import { AssessStateDto } from './dto/assess-state.dto.js';
import { GeneratePixelArtDto } from './dto/generate-pixel-art.dto.js';

@ApiTags('plants')
@Controller('v1/plants')
export class PlantsController {
  constructor(private readonly agentService: AgentService) {}

  @Post('profile:analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze plant image to identify species' })
  @ApiResponse({ status: 200, description: 'Profile analysis result' })
  async analyzeProfile(@Body() dto: AnalyzeProfileDto) {
    return this.agentService.analyzeProfile(dto);
  }

  @Post('profile:confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm and create plant profile' })
  @ApiResponse({ status: 200, description: 'Confirmed plant profile' })
  async confirmProfile(@Body() dto: ConfirmProfileDto) {
    // Persistence will land in Phase 4 (DB). For now echo back a canonical shape.
    return {
      status: 'success',
      request_id: dto.request_id,
      data: {
        plant_id: dto.plant_id,
        profile: dto.profile,
        preferences: dto.preferences,
        created_at: new Date().toISOString(),
      },
    };
  }

  @Post('daily-advice:generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate daily care advice' })
  @ApiResponse({ status: 200, description: 'Daily care advice' })
  async generateDailyAdvice(@Body() dto: DailyAdviceDto) {
    return this.agentService.generateDailyAdvice(dto);
  }

  @Post('state:assess')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assess plant health state' })
  @ApiResponse({ status: 200, description: 'Plant state assessment' })
  async assessState(@Body() dto: AssessStateDto) {
    return this.agentService.assessState(dto);
  }

  @Post('pixel-art:generate')
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
    // Will be implemented against DB aggregation in Phase 4.
    return {
      plant_id: plantId,
      profile: null,
      daily_advice: null,
      latest_assessment: null,
      rhythm_summary: null,
    };
  }

  @Get(':plantId/rhythm')
  @ApiOperation({ summary: 'Get plant rhythm data' })
  @ApiResponse({ status: 200, description: 'Rhythm trends and history' })
  async getPlantRhythm(@Param('plantId') plantId: string) {
    return {
      plant_id: plantId,
      streak: 0,
      stability: 0,
      history: [],
    };
  }
}
