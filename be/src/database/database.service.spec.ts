import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { DatabaseService } from './database.service.js';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    service = new DatabaseService();
    jest.spyOn(service, '$connect').mockResolvedValue(undefined);
    jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('onModuleInit', () => {
    it('should call $connect and resolve when connection succeeds', async () => {
      await expect(service.onModuleInit()).resolves.toBeUndefined();
      expect(service.$connect).toHaveBeenCalledTimes(1);
    });

    it('should rethrow when $connect fails', async () => {
      const err = new Error('connection refused');
      jest.spyOn(service, '$connect').mockRejectedValueOnce(err);

      await expect(service.onModuleInit()).rejects.toThrow('connection refused');
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect', async () => {
      await service.onModuleDestroy();
      expect(service.$disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkHealth', () => {
    it('should return true when SELECT 1 succeeds', async () => {
      jest.spyOn(service, '$queryRaw').mockResolvedValueOnce([{ '1': 1 }]);

      await expect(service.checkHealth()).resolves.toBe(true);
    });

    it('should return false when query fails', async () => {
      jest.spyOn(service, '$queryRaw').mockRejectedValueOnce(new Error('down'));

      await expect(service.checkHealth()).resolves.toBe(false);
    });
  });
});
