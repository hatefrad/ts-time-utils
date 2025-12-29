/**
 * Plugin system for extending ChainedDate with custom methods
 *
 * @example
 * ```ts
 * import { extend } from 'ts-time-utils/plugins';
 * import { ChainedDate } from 'ts-time-utils/chain';
 *
 * // Define plugin methods
 * extend('myPlugin', {
 *   nextMonday(this: ChainedDate): ChainedDate {
 *     const day = this.weekday();
 *     const daysUntilMonday = day === 0 ? 1 : 8 - day;
 *     return this.add(daysUntilMonday, 'days');
 *   }
 * });
 *
 * // Use plugin methods
 * chain(new Date()).nextMonday().format('YYYY-MM-DD');
 * ```
 */

// Import ChainedDate class directly - safe because chain.js doesn't import plugins.js
// We need the actual class (not just the type) to modify its prototype
let ChainedDateConstructor: any = null;

/**
 * Get ChainedDate class lazily to ensure it's fully initialized
 */
function getChainedDate() {
  if (!ChainedDateConstructor) {
    // Use dynamic import that works in both CJS and ESM
    try {
      // Try ESM import path first
      ChainedDateConstructor = (globalThis as any).__chainedDateClass;
      if (!ChainedDateConstructor) {
        // Fallback: The class will be set by chain.js when it loads
        throw new Error('ChainedDate not yet loaded. Import chain.js before using plugins.');
      }
    } catch (e) {
      throw new Error('ChainedDate class not available. Ensure chain.js is imported before registering plugins.');
    }
  }
  return ChainedDateConstructor;
}

/**
 * Initialize the plugin system with ChainedDate class
 * This is called automatically when chain.js is imported
 * @internal
 */
export function __initPluginSystem(ChainedDateClass: any) {
  ChainedDateConstructor = ChainedDateClass;
}

/**
 * Plugin function type - methods receive ChainedDate instance as `this`
 */
export type PluginFunction = (this: any, ...args: any[]) => any;

/**
 * Plugin definition - map of method names to functions
 */
export interface Plugin {
  [methodName: string]: PluginFunction;
}

/**
 * Internal registry of installed plugins
 */
interface PluginRegistry {
  [pluginName: string]: {
    plugin: Plugin;
    originalMethods: Map<string, Function>;
  };
}

const registry: PluginRegistry = {};

/**
 * Extend ChainedDate with custom methods
 *
 * @param pluginName - Unique name for the plugin
 * @param methods - Object mapping method names to functions
 *
 * @example
 * ```ts
 * extend('businessDays', {
 *   addBusinessDays(this: ChainedDate, days: number): ChainedDate {
 *     let current = this.clone();
 *     let remaining = days;
 *
 *     while (remaining > 0) {
 *       current = current.add(1, 'days');
 *       if (current.isWeekday()) remaining--;
 *     }
 *
 *     return current;
 *   }
 * });
 *
 * chain(new Date()).addBusinessDays(5);
 * ```
 */
export function extend(pluginName: string, methods: Plugin): void {
  if (registry[pluginName]) {
    throw new Error(`Plugin "${pluginName}" is already registered. Use a different name or uninstall first.`);
  }

  // Get ChainedDate class and save original methods before overwriting
  const ChainedDateClass = getChainedDate();
  const originalMethods = new Map<string, Function>();

  Object.entries(methods).forEach(([methodName, fn]) => {
    // Save original method if it exists
    if (methodName in ChainedDateClass.prototype) {
      const original = (ChainedDateClass.prototype as any)[methodName];
      if (typeof original === 'function') {
        originalMethods.set(methodName, original);
      }
      console.warn(`Method "${methodName}" already exists on ChainedDate and will be overwritten`);
    }
    // Add the plugin method
    (ChainedDateClass.prototype as any)[methodName] = fn;
  });

  // Register the plugin with its original methods
  registry[pluginName] = { plugin: methods, originalMethods };
}

/**
 * Remove a plugin and its methods from ChainedDate
 *
 * @param pluginName - Name of the plugin to uninstall
 *
 * @example
 * ```ts
 * uninstall('businessDays');
 * ```
 */
export function uninstall(pluginName: string): void {
  const entry = registry[pluginName];
  if (!entry) {
    throw new Error(`Plugin "${pluginName}" is not registered`);
  }

  // Get ChainedDate class and restore/remove methods
  const ChainedDateClass = getChainedDate();
  Object.keys(entry.plugin).forEach((methodName) => {
    // If there was an original method, restore it
    const original = entry.originalMethods.get(methodName);
    if (original) {
      (ChainedDateClass.prototype as any)[methodName] = original;
    } else {
      // Otherwise, delete the method entirely
      delete (ChainedDateClass.prototype as any)[methodName];
    }
  });

  // Remove from registry
  delete registry[pluginName];
}

/**
 * Get list of all registered plugin names
 *
 * @returns Array of plugin names
 *
 * @example
 * ```ts
 * getRegisteredPlugins(); // ['businessDays', 'myPlugin']
 * ```
 */
export function getRegisteredPlugins(): string[] {
  return Object.keys(registry);
}

/**
 * Get list of methods provided by a plugin
 *
 * @param pluginName - Name of the plugin
 * @returns Array of method names, or empty array if plugin not found
 *
 * @example
 * ```ts
 * getPluginMethods('businessDays'); // ['addBusinessDays', 'subtractBusinessDays']
 * ```
 */
export function getPluginMethods(pluginName: string): string[] {
  const entry = registry[pluginName];
  return entry ? Object.keys(entry.plugin) : [];
}

/**
 * Check if a plugin is registered
 *
 * @param pluginName - Name of the plugin
 * @returns True if plugin is registered
 *
 * @example
 * ```ts
 * isPluginRegistered('businessDays'); // true
 * ```
 */
export function isPluginRegistered(pluginName: string): boolean {
  return pluginName in registry;
}

/**
 * Declare plugin methods for TypeScript support
 *
 * Use module augmentation to add type definitions for your plugin methods:
 *
 * @example
 * ```ts
 * import { ChainedDate } from 'ts-time-utils/chain';
 *
 * declare module 'ts-time-utils/chain' {
 *   interface ChainedDate {
 *     addBusinessDays(days: number): ChainedDate;
 *     subtractBusinessDays(days: number): ChainedDate;
 *   }
 * }
 * ```
 */
export interface PluginDeclaration {}
