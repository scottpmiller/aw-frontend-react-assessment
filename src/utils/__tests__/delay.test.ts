import { delay, delayPatterns } from '../delay';

// Mock setTimeout for testing
jest.useFakeTimers();

describe('delay utilities', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('delay', () => {
    it('should resolve after specified time', async () => {
      const promise = delay(1000);
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      await expect(promise).resolves.toBeUndefined();
    });

    it('should not resolve before specified time', async () => {
      const promise = delay(1000);
      let resolved = false;
      
      promise.then(() => {
        resolved = true;
      });
      
      // Advance time by less than delay
      jest.advanceTimersByTime(500);
      
      // Give promises a chance to resolve
      await Promise.resolve();
      
      expect(resolved).toBe(false);
      
      // Now advance the remaining time
      jest.advanceTimersByTime(500);
      
      await promise;
      expect(resolved).toBe(true);
    });

    it('should handle zero delay', async () => {
      const promise = delay(0);
      
      jest.advanceTimersByTime(0);
      
      await expect(promise).resolves.toBeUndefined();
    });

    it('should handle multiple concurrent delays', async () => {
      const promise1 = delay(100);
      const promise2 = delay(200);
      const promise3 = delay(300);
      
      const resolved: number[] = [];
      
      promise1.then(() => resolved.push(1));
      promise2.then(() => resolved.push(2));
      promise3.then(() => resolved.push(3));
      
      // Advance time incrementally
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(resolved).toEqual([1]);
      
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(resolved).toEqual([1, 2]);
      
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(resolved).toEqual([1, 2, 3]);
    });
  });

  describe('delayPatterns', () => {
    beforeEach(() => {
      // Mock Math.random to return a predictable value
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('short', () => {
      it('should create delay in short range', async () => {
        const promise = delayPatterns.short();
        
        // With Math.random() = 0.5, short delay should be 0.5 * 100 + 25 = 75ms
        jest.advanceTimersByTime(75);
        
        await expect(promise).resolves.toBeUndefined();
      });
    });

    describe('medium', () => {
      it('should create delay in medium range', async () => {
        const promise = delayPatterns.medium();
        
        // With Math.random() = 0.5, medium delay should be 0.5 * 300 + 50 = 200ms
        jest.advanceTimersByTime(200);
        
        await expect(promise).resolves.toBeUndefined();
      });
    });

    describe('long', () => {
      it('should create delay in long range', async () => {
        const promise = delayPatterns.long();
        
        // With Math.random() = 0.5, long delay should be 0.5 * 500 + 100 = 350ms
        jest.advanceTimersByTime(350);
        
        await expect(promise).resolves.toBeUndefined();
      });
    });

    describe('variable', () => {
      it('should create delay with default range', async () => {
        const promise = delayPatterns.variable();
        
        // With Math.random() = 0.5, variable delay should be 0.5 * (500 - 50) + 50 = 275ms
        jest.advanceTimersByTime(275);
        
        await expect(promise).resolves.toBeUndefined();
      });

      it('should create delay with custom range', async () => {
        const promise = delayPatterns.variable(100, 300);
        
        // With Math.random() = 0.5, variable delay should be 0.5 * (300 - 100) + 100 = 200ms
        jest.advanceTimersByTime(200);
        
        await expect(promise).resolves.toBeUndefined();
      });

      it('should handle min equals max', async () => {
        const promise = delayPatterns.variable(150, 150);
        
        // Should be exactly 150ms
        jest.advanceTimersByTime(150);
        
        await expect(promise).resolves.toBeUndefined();
      });

      it('should handle zero range', async () => {
        const promise = delayPatterns.variable(0, 0);
        
        jest.advanceTimersByTime(0);
        
        await expect(promise).resolves.toBeUndefined();
      });
    });
  });

  describe('integration tests', () => {
    beforeEach(() => {
      // Use real timers for integration tests to test actual behavior
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should provide realistic timing behavior', async () => {
      const start = Date.now();
      await delay(50);
      const end = Date.now();
      
      // Allow some tolerance for timing (50ms +/- 20ms should be reasonable)
      expect(end - start).toBeGreaterThanOrEqual(45);
      expect(end - start).toBeLessThan(100);
    }, 200);

    it('should support Promise chaining', async () => {
      const results: string[] = [];
      
      await delay(10)
        .then(() => {
          results.push('first');
          return delay(10);
        })
        .then(() => {
          results.push('second');
          return delay(10);
        })
        .then(() => {
          results.push('third');
        });
      
      expect(results).toEqual(['first', 'second', 'third']);
    }, 200);

    it('should work with Promise.all', async () => {
      const start = Date.now();
      
      await Promise.all([
        delay(20),
        delay(30),
        delay(25)
      ]);
      
      const end = Date.now();
      
      // Should take approximately 30ms (the longest delay)
      expect(end - start).toBeGreaterThanOrEqual(25);
      expect(end - start).toBeLessThan(60);
    }, 200);

    it('should work with async/await', async () => {
      const start = Date.now();
      
      await delay(20);
      const middle = Date.now();
      
      await delay(20);
      const end = Date.now();
      
      expect(middle - start).toBeGreaterThanOrEqual(15);
      expect(end - middle).toBeGreaterThanOrEqual(15);
      expect(end - start).toBeGreaterThanOrEqual(35);
    }, 200);
  });

  describe('delay patterns randomness', () => {
    beforeEach(() => {
      jest.useRealTimers();
    });

    afterEach(() => {
      jest.useFakeTimers();
    });

    it('should produce different delays over multiple calls', async () => {
      const delays: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await delayPatterns.short();
        const duration = Date.now() - start;
        delays.push(duration);
      }
      
      // Check that we got some variation (not all delays are identical)
      const unique = new Set(delays);
      expect(unique.size).toBeGreaterThan(1);
      
      // Check that all delays are within expected range (25-125ms for short)
      delays.forEach(duration => {
        expect(duration).toBeGreaterThanOrEqual(20); // Allow some tolerance
        expect(duration).toBeLessThan(150);
      });
    }, 1000);
  });
});
