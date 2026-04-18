import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const MOCK_VIDEOS = [
  {
    id: 'vid_001',
    title: '龟背竹养护指南：从入门到精通',
    description: '详细介绍龟背竹的光照、浇水、施肥技巧',
    thumbnail_url: 'https://example.com/thumb1.jpg',
    video_url: 'https://example.com/vid1.mp4',
    duration_seconds: 180,
    creator_id: 'creator_001',
    creator_name: '绿植小能手',
    tags: ['龟背竹', '养护', '入门'],
    view_count: 12500,
    created_at: '2026-03-15T08:00:00Z',
  },
  {
    id: 'vid_002',
    title: '如何判断植物是否需要浇水？',
    description: '三个简单方法判断土壤湿度',
    thumbnail_url: 'https://example.com/thumb2.jpg',
    video_url: 'https://example.com/vid2.mp4',
    duration_seconds: 120,
    creator_id: 'creator_002',
    creator_name: '园艺博士',
    tags: ['浇水', '技巧', '诊断'],
    view_count: 8900,
    created_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 'vid_003',
    title: '室内植物病虫害防治',
    description: '常见病虫害识别与处理方法',
    thumbnail_url: 'https://example.com/thumb3.jpg',
    video_url: 'https://example.com/vid3.mp4',
    duration_seconds: 240,
    creator_id: 'creator_003',
    creator_name: '植物医生',
    tags: ['病虫害', '防治', '健康'],
    view_count: 15200,
    created_at: '2026-04-01T09:00:00Z',
  },
];

@ApiTags('videos')
@Controller('v1/videos')
export class VideosController {
  @Get()
  @ApiOperation({ summary: 'List video recommendations' })
  @ApiResponse({ status: 200, description: 'List of videos' })
  async listVideos(
    @Query('tag') tag?: string,
    @Query('limit') limit?: string,
  ) {
    let videos = MOCK_VIDEOS;
    if (tag) {
      videos = videos.filter(v => v.tags.includes(tag));
    }
    const take = limit ? parseInt(limit, 10) : 10;
    return {
      videos: videos.slice(0, take),
      total: videos.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video details' })
  @ApiResponse({ status: 200, description: 'Video details' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async getVideo(@Param('id') id: string) {
    const video = MOCK_VIDEOS.find(v => v.id === id);
    if (!video) {
      return { status: 'failed', error_code: 'NOT_FOUND', message: 'Video not found' };
    }
    return { video };
  }
}
