/**
 * Async time utilities for delays, timeouts, and performance
 */

/**
 * Sleep for a specified number of milliseconds
 * @param ms - milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Add a timeout to any promise
 * @param promise - promise to add timeout to
 * @param ms - timeout in milliseconds
 * @param timeoutMessage - optional timeout error message
 */
export function timeout<T>(
  promise: Promise<T>, 
  ms: number, 
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), ms)
    )
  ]);
}

/**
 * Debounce function - delays execution until after delay has passed since last call
 * @param fn - function to debounce
 * @param delay - delay in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function - limits execution to once per delay period
 * @param fn - function to throttle
 * @param delay - delay in milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Retry a promise-returning function with exponential backoff
 * @param fn - function that returns a promise
 * @param maxAttempts - maximum number of attempts
 * @param baseDelay - base delay in milliseconds
 * @param maxDelay - maximum delay in milliseconds
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
        maxDelay
      );
      
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Stopwatch for measuring elapsed time
 */
export class Stopwatch {
  private startTime: number | null = null;
  private endTime: number | null = null;
  private pausedTime: number = 0;
  private pauseStart: number | null = null;

  /**
   * Start the stopwatch
   */
  start(): void {
    if (this.startTime !== null) {
      throw new Error('Stopwatch is already running');
    }
    this.startTime = performance.now();
    this.endTime = null;
    this.pausedTime = 0;
    this.pauseStart = null;
  }

  /**
   * Stop the stopwatch
   */
  stop(): number {
    if (this.startTime === null) {
      throw new Error('Stopwatch is not running');
    }
    
    if (this.pauseStart !== null) {
      this.pausedTime += performance.now() - this.pauseStart;
      this.pauseStart = null;
    }
    
    this.endTime = performance.now();
    const elapsed = this.endTime - this.startTime - this.pausedTime;
    return elapsed;
  }

  /**
   * Pause the stopwatch
   */
  pause(): void {
    if (this.startTime === null) {
      throw new Error('Stopwatch is not running');
    }
    if (this.pauseStart !== null) {
      throw new Error('Stopwatch is already paused');
    }
    this.pauseStart = performance.now();
  }

  /**
   * Resume the stopwatch
   */
  resume(): void {
    if (this.pauseStart === null) {
      throw new Error('Stopwatch is not paused');
    }
    this.pausedTime += performance.now() - this.pauseStart;
    this.pauseStart = null;
  }

  /**
   * Reset the stopwatch
   */
  reset(): void {
    this.startTime = null;
    this.endTime = null;
    this.pausedTime = 0;
    this.pauseStart = null;
  }

  /**
   * Get elapsed time without stopping
   */
  getElapsed(): number {
    if (this.startTime === null) {
      return 0;
    }
    
    const now = performance.now();
    let pausedTime = this.pausedTime;
    
    if (this.pauseStart !== null) {
      pausedTime += now - this.pauseStart;
    }
    
    return now - this.startTime - pausedTime;
  }

  /**
   * Check if stopwatch is running
   */
  isRunning(): boolean {
    return this.startTime !== null && this.endTime === null && this.pauseStart === null;
  }

  /**
   * Check if stopwatch is paused
   */
  isPaused(): boolean {
    return this.pauseStart !== null;
  }
}

/**
 * Create a new stopwatch instance
 */
export function createStopwatch(): Stopwatch {
  return new Stopwatch();
}

/**
 * Measure execution time of a synchronous function
 * @param fn - function to measure
 * @returns tuple of [result, elapsed time in ms]
 */
export function measureTime<T>(fn: () => T): [T, number] {
  const start = performance.now();
  const result = fn();
  const elapsed = performance.now() - start;
  return [result, elapsed];
}

/**
 * Measure execution time of an asynchronous function
 * @param fn - async function to measure
 * @returns promise that resolves to tuple of [result, elapsed time in ms]
 */
export async function measureAsync<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = performance.now();
  const result = await fn();
  const elapsed = performance.now() - start;
  return [result, elapsed];
}

/**
 * Performance measurement and async utilities
 */

import type { BenchmarkResult } from './types.js';

/**
 * Benchmark a function by running it multiple times
 * @param fn - function to benchmark
 * @param iterations - number of iterations to run
 */
export function benchmark(fn: () => void, iterations: number = 1000): BenchmarkResult {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const [, elapsed] = measureTime(fn);
    times.push(elapsed);
  }
  
  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const average = totalTime / iterations;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  return {
    totalTime,
    average,
    min,
    max,
    iterations,
    total: totalTime
  };
}