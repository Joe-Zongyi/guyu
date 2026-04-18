import { beforeEach, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from './database.module.js';
import { DatabaseService } from './database.service.js';

describe('DatabaseModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();
  });

  it('should provide DatabaseService', () => {
    const db = moduleRef.get(DatabaseService);
    expect(db).toBeDefined();
    expect(db).toBeInstanceOf(DatabaseService);
  });

  it('should export DatabaseService for importers', () => {
    const exported = moduleRef.get(DatabaseService);
    expect(exported).toBeDefined();
  });
});
