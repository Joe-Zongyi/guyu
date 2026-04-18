import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const MOCK_CREATORS = [
  {
    id: 'creator_001',
    name: '绿植小能手',
    avatar_url: 'https://example.com/avatar1.jpg',
    bio: '专注室内绿植养护，分享实用技巧',
    follower_count: 45000,
    video_count: 128,
    tags: ['室内植物', '养护技巧'],
  },
  {
    id: 'creator_002',
    name: '园艺博士',
    avatar_url: 'https://example.com/avatar2.jpg',
    bio: '植物学博士，科学解读植物生长奥秘',
    follower_count: 32000,
    video_count: 85,
    tags: ['植物科学', '深度解析'],
  },
  {
    id: 'creator_003',
    name: '植物医生',
    avatar_url: 'https://example.com/avatar3.jpg',
    bio: '植物病虫害防治专家',
    follower_count: 28000,
    video_count: 96,
    tags: ['病虫害', '植物健康'],
  },
];

@ApiTags('creators')
@Controller('v1/creators')
export class CreatorsController {
  @Get('similar')
  @ApiOperation({ summary: 'Get similar creators' })
  @ApiResponse({ status: 200, description: 'List of similar creators' })
  async getSimilarCreators(
    @Query('tag') tag?: string,
    @Query('limit') limit?: string,
  ) {
    let creators = MOCK_CREATORS;
    if (tag) {
      creators = creators.filter(c => c.tags.includes(tag));
    }
    const take = limit ? parseInt(limit, 10) : 10;
    return {
      creators: creators.slice(0, take),
      total: creators.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get creator details' })
  @ApiResponse({ status: 200, description: 'Creator details' })
  @ApiResponse({ status: 404, description: 'Creator not found' })
  async getCreator(@Param('id') id: string) {
    const creator = MOCK_CREATORS.find(c => c.id === id);
    if (!creator) {
      return { status: 'failed', error_code: 'NOT_FOUND', message: 'Creator not found' };
    }
    return { creator };
  }
}
