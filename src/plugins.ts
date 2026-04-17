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

import { ChainedDate } from './chain.js';

/**
 * Get ChainedDate class for prototype mutation.
 * Importing `plugins` now brings in `chain` directly, so the class is available
 * without a hidden global handshake.
 */
function getChainedDate() {
  if (!ChainedDate) {
    throw new Error('ChainedDate export is not available yet. Import chain.js before registering plugins.');
  }
  return ChainedDate;
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
  };
}

const registry: PluginRegistry = {};

interface MethodState {
  original?: Function;
  owners: string[];
}

const methodStates: Record<string, MethodState> = {};

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

  const ChainedDateClass = getChainedDate();

  Object.entries(methods).forEach(([methodName, fn]) => {
    const current = (ChainedDateClass.prototype as any)[methodName];
    if (!methodStates[methodName]) {
      methodStates[methodName] = {
        original: typeof current === 'function' ? current : undefined,
        owners: []
      };
    }
    if (methodName in ChainedDateClass.prototype) {
      console.warn(`Method "${methodName}" already exists on ChainedDate and will be overwritten`);
    }
    methodStates[methodName].owners.push(pluginName);
    // Add the plugin method
    (ChainedDateClass.prototype as any)[methodName] = fn;
  });

  registry[pluginName] = { plugin: methods };
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

  const ChainedDateClass = getChainedDate();
  Object.keys(entry.plugin).forEach((methodName) => {
    const state = methodStates[methodName];
    if (!state) {
      delete (ChainedDateClass.prototype as any)[methodName];
      return;
    }

    state.owners = state.owners.filter((owner) => owner !== pluginName);

    const nextOwner = state.owners[state.owners.length - 1];
    if (nextOwner) {
      const nextPlugin = registry[nextOwner];
      if (nextPlugin && methodName in nextPlugin.plugin) {
        (ChainedDateClass.prototype as any)[methodName] = nextPlugin.plugin[methodName];
        return;
      }
      delete (ChainedDateClass.prototype as any)[methodName];
      return;
    }

    if (state.original) {
      (ChainedDateClass.prototype as any)[methodName] = state.original;
    } else {
      delete (ChainedDateClass.prototype as any)[methodName];
    }

    delete methodStates[methodName];
  });

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
