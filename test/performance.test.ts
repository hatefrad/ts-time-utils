import { describe, it, expect, vi } from "vitest";
import {
  sleep,
  timeout,
  debounce,
  throttle,
  retry,
  createStopwatch,
  measureTime,
  measureAsync,
  benchmark
} from "../src/performance";

describe("Performance utilities", () => {
  describe("sleep", () => {
    it("resolves after specified time", async () => {
      const start = Date.now();
      await sleep(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some tolerance
    });
  });

  describe("timeout", () => {
    it("resolves with promise result if within timeout", async () => {
      const promise = Promise.resolve('success');
      const result = await timeout(promise, 100);
      expect(result).toBe('success');
    });

    it("rejects if promise takes too long", async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('late'), 100));
      await expect(timeout(promise, 50)).rejects.toThrow('Operation timed out');
    });

    it("uses custom timeout message", async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('late'), 100));
      await expect(timeout(promise, 50, 'Custom timeout')).rejects.toThrow('Custom timeout');
    });
  });

  describe("debounce", () => {
    it("delays function execution", async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 50);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(fn).not.toHaveBeenCalled();
      
      await sleep(60);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("cancels previous calls", async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 50);
      
      debouncedFn('first');
      await sleep(25);
      debouncedFn('second');
      await sleep(60);
      
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('second');
    });
  });

  describe("throttle", () => {
    it("limits function execution rate", async () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 50);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(fn).toHaveBeenCalledTimes(1);
      
      await sleep(60);
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("retry", () => {
    it("succeeds on first try", async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retry(fn, 3, 10);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("retries on failure and eventually succeeds", async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');
      
      const result = await retry(fn, 3, 10);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("throws after max attempts", async () => {
      const fn = vi.fn().mockRejectedValue(new Error('always fails'));
      
      await expect(retry(fn, 2, 10)).rejects.toThrow('always fails');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("Stopwatch", () => {
    it("measures elapsed time", async () => {
      const stopwatch = createStopwatch();
      
      stopwatch.start();
      await sleep(50);
      const elapsed = stopwatch.stop();
      
      expect(elapsed).toBeGreaterThanOrEqual(45);
      expect(stopwatch.isRunning()).toBe(false);
    });

    it("can be paused and resumed", async () => {
      const stopwatch = createStopwatch();
      
      stopwatch.start();
      await sleep(25);
      stopwatch.pause();
      
      expect(stopwatch.isPaused()).toBe(true);
      
      await sleep(25);
      stopwatch.resume();
      await sleep(25);
      
      const elapsed = stopwatch.stop();
      expect(elapsed).toBeLessThan(70); // Should exclude paused time
    });

    it("can be reset", () => {
      const stopwatch = createStopwatch();
      stopwatch.start();
      stopwatch.reset();
      
      expect(stopwatch.isRunning()).toBe(false);
      expect(stopwatch.getElapsed()).toBe(0);
    });

    it("throws error when starting already running stopwatch", () => {
      const stopwatch = createStopwatch();
      stopwatch.start();
      
      expect(() => stopwatch.start()).toThrow('Stopwatch is already running');
    });
  });

  describe("measureTime", () => {
    it("measures execution time of synchronous function", () => {
      const fn = () => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      };
      
      const [result, elapsed] = measureTime(fn);
      
      expect(result).toBe(499500); // Sum of 0 to 999
      expect(elapsed).toBeGreaterThan(0);
    });
  });

  describe("measureAsync", () => {
    it("measures execution time of asynchronous function", async () => {
      const fn = async () => {
        await sleep(50);
        return 'done';
      };
      
      const [result, elapsed] = await measureAsync(fn);
      
      expect(result).toBe('done');
      expect(elapsed).toBeGreaterThanOrEqual(45);
    });
  });

  describe("benchmark", () => {
    it("benchmarks a function", () => {
      const fn = () => Math.sqrt(Math.random());
      
      const result = benchmark(fn, 100);
      
      expect(result.iterations).toBe(100);
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.minTime).toBeGreaterThan(0);
      expect(result.maxTime).toBeGreaterThanOrEqual(result.minTime);
      expect(result.opsPerSecond).toBeGreaterThan(0);
    });
  });
});