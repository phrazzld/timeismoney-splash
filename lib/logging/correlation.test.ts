/**
 * Tests for correlation ID management (T018)
 */

import { 
  generateCorrelationId, 
  getCurrentCorrelationId, 
  setCorrelationId, 
  clearCorrelationId,
  validateCorrelationId,
  withCorrelationId,
  CorrelationIdManager 
} from './correlation';

describe('Correlation ID Management (T018)', () => {
  beforeEach(() => {
    // Clear any existing correlation ID before each test
    clearCorrelationId();
  });

  afterEach(() => {
    // Clean up after each test
    clearCorrelationId();
  });

  describe('generateCorrelationId', () => {
    it('should generate a valid correlation ID', () => {
      const id = generateCorrelationId();
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs on successive calls', () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();
      
      expect(id1).not.toEqual(id2);
    });

    it('should generate IDs in correct format (UUID v4)', () => {
      const id = generateCorrelationId();
      
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should be cryptographically secure', () => {
      // Generate multiple IDs and check for patterns
      const ids = Array.from({ length: 100 }, () => generateCorrelationId());
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(100); // All should be unique
    });

    it('should work in various browser environments', () => {
      // Mock different crypto environments
      const originalCrypto = global.crypto;
      
      try {
        // Test with modern crypto API
        Object.defineProperty(global, 'crypto', {
          value: {
            randomUUID: () => '550e8400-e29b-41d4-a716-446655440000'
          },
          configurable: true
        });
        
        let id = generateCorrelationId();
        expect(id).toBe('550e8400-e29b-41d4-a716-446655440000');
        
        // Test with getRandomValues fallback
        Object.defineProperty(global, 'crypto', {
          value: {
            getRandomValues: (array: Uint8Array) => {
              for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
              }
              return array;
            }
          },
          configurable: true
        });
        
        id = generateCorrelationId();
        expect(validateCorrelationId(id)).toBe(true);
        
      } finally {
        global.crypto = originalCrypto;
      }
    });
  });

  describe('validateCorrelationId', () => {
    it('should validate correct UUID v4 format', () => {
      const validId = '550e8400-e29b-41d4-a716-446655440000';
      expect(validateCorrelationId(validId)).toBe(true);
    });

    it('should reject invalid formats', () => {
      const invalidIds = [
        '',
        'invalid-id',
        '550e8400-e29b-41d4-a716', // too short
        '550e8400-e29b-41d4-a716-446655440000-extra', // too long
        '550e8400-e29b-31d4-a716-446655440000', // wrong version
        '550e8400-e29b-41d4-z716-446655440000', // invalid character
        null,
        undefined,
        123
      ];

      invalidIds.forEach(id => {
        expect(validateCorrelationId(id as any)).toBe(false);
      });
    });

    it('should be case insensitive', () => {
      const lowercaseId = '550e8400-e29b-41d4-a716-446655440000';
      const uppercaseId = '550E8400-E29B-41D4-A716-446655440000';
      
      expect(validateCorrelationId(lowercaseId)).toBe(true);
      expect(validateCorrelationId(uppercaseId)).toBe(true);
    });
  });

  describe('getCurrentCorrelationId', () => {
    it('should return null when no correlation ID is set', () => {
      expect(getCurrentCorrelationId()).toBeNull();
    });

    it('should return the current correlation ID when set', () => {
      const id = generateCorrelationId();
      setCorrelationId(id);
      
      expect(getCurrentCorrelationId()).toBe(id);
    });
  });

  describe('setCorrelationId', () => {
    it('should set a valid correlation ID', () => {
      const id = generateCorrelationId();
      setCorrelationId(id);
      
      expect(getCurrentCorrelationId()).toBe(id);
    });

    it('should throw error for invalid correlation ID', () => {
      expect(() => setCorrelationId('invalid-id')).toThrow('Invalid correlation ID format');
    });

    it('should replace existing correlation ID', () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();
      
      setCorrelationId(id1);
      expect(getCurrentCorrelationId()).toBe(id1);
      
      setCorrelationId(id2);
      expect(getCurrentCorrelationId()).toBe(id2);
    });
  });

  describe('clearCorrelationId', () => {
    it('should clear the current correlation ID', () => {
      const id = generateCorrelationId();
      setCorrelationId(id);
      expect(getCurrentCorrelationId()).toBe(id);
      
      clearCorrelationId();
      expect(getCurrentCorrelationId()).toBeNull();
    });

    it('should not throw when no correlation ID is set', () => {
      expect(() => clearCorrelationId()).not.toThrow();
    });
  });

  describe('withCorrelationId', () => {
    it('should execute function with temporary correlation ID', async () => {
      const id = generateCorrelationId();
      let capturedId: string | null = null;
      
      const result = await withCorrelationId(id, async () => {
        capturedId = getCurrentCorrelationId();
        return 'test-result';
      });
      
      expect(capturedId).toBe(id);
      expect(result).toBe('test-result');
      expect(getCurrentCorrelationId()).toBeNull(); // Should be restored
    });

    it('should restore previous correlation ID after execution', async () => {
      const originalId = generateCorrelationId();
      const temporaryId = generateCorrelationId();
      
      setCorrelationId(originalId);
      
      await withCorrelationId(temporaryId, async () => {
        expect(getCurrentCorrelationId()).toBe(temporaryId);
      });
      
      expect(getCurrentCorrelationId()).toBe(originalId);
    });

    it('should handle errors and still restore correlation ID', async () => {
      const originalId = generateCorrelationId();
      const temporaryId = generateCorrelationId();
      
      setCorrelationId(originalId);
      
      await expect(
        withCorrelationId(temporaryId, async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
      
      expect(getCurrentCorrelationId()).toBe(originalId);
    });

    it('should work with synchronous functions', async () => {
      const id = generateCorrelationId();
      
      const result = await withCorrelationId(id, () => {
        expect(getCurrentCorrelationId()).toBe(id);
        return 'sync-result';
      });
      
      expect(result).toBe('sync-result');
      expect(getCurrentCorrelationId()).toBeNull();
    });
  });

  describe('CorrelationIdManager class', () => {
    let manager: CorrelationIdManager;

    beforeEach(() => {
      manager = new CorrelationIdManager();
    });

    it('should generate new correlation ID on construction', () => {
      expect(manager.getCurrentId()).toBeDefined();
      expect(validateCorrelationId(manager.getCurrentId())).toBe(true);
    });

    it('should allow setting custom correlation ID', () => {
      const customId = generateCorrelationId();
      manager.setId(customId);
      
      expect(manager.getCurrentId()).toBe(customId);
    });

    it('should regenerate correlation ID', () => {
      const originalId = manager.getCurrentId();
      manager.regenerate();
      const newId = manager.getCurrentId();
      
      expect(newId).not.toBe(originalId);
      expect(validateCorrelationId(newId)).toBe(true);
    });

    it('should create child correlation IDs', () => {
      const parentId = manager.getCurrentId();
      const childId = manager.createChild();
      
      expect(childId).not.toBe(parentId);
      expect(validateCorrelationId(childId)).toBe(true);
      expect(childId).toContain(parentId.split('-')[0]); // Should share prefix
    });

    it('should support middleware-style execution', async () => {
      const id = generateCorrelationId();
      let executedId: string | null = null;
      
      const middleware = manager.middleware(id);
      const result = await middleware(async () => {
        executedId = getCurrentCorrelationId();
        return 'middleware-result';
      });
      
      expect(executedId).toBe(id);
      expect(result).toBe('middleware-result');
    });
  });

  describe('Performance and Memory', () => {
    it('should not leak memory with multiple operations', () => {
      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;
      
      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        const id = generateCorrelationId();
        setCorrelationId(id);
        getCurrentCorrelationId();
        clearCorrelationId();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage?.()?.heapUsed || 0;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Should not grow significantly (less than 1MB)
      expect(memoryGrowth).toBeLessThan(1024 * 1024);
    });

    it('should generate IDs quickly', () => {
      const start = performance.now();
      
      // Generate many IDs
      for (let i = 0; i < 1000; i++) {
        generateCorrelationId();
      }
      
      const end = performance.now();
      const timePerGeneration = (end - start) / 1000;
      
      // Should generate each ID in less than 1ms
      expect(timePerGeneration).toBeLessThan(1);
    });
  });

  describe('Thread Safety and Async Operations', () => {
    it('should handle concurrent correlation ID operations', async () => {
      const promises = Array.from({ length: 10 }, async (_, index) => {
        const id = generateCorrelationId();
        
        return withCorrelationId(id, async () => {
          // Simulate async work
          await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
          return getCurrentCorrelationId();
        });
      });
      
      const results = await Promise.all(promises);
      
      // All should return their respective correlation IDs
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(validateCorrelationId(result!)).toBe(true);
      });
      
      // All should be unique
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(10);
    });

    it('should maintain correlation ID through promise chains', async () => {
      const id = generateCorrelationId();
      
      const result = await withCorrelationId(id, async () => {
        const step1 = await Promise.resolve(getCurrentCorrelationId());
        const step2 = await Promise.resolve().then(() => getCurrentCorrelationId());
        const step3 = await new Promise(resolve => {
          setTimeout(() => resolve(getCurrentCorrelationId()), 10);
        });
        
        return { step1, step2, step3 };
      });
      
      expect(result.step1).toBe(id);
      expect(result.step2).toBe(id);
      expect(result.step3).toBe(id);
    });
  });
});