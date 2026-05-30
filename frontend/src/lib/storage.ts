/**
 * Capacitor-safe storage adapter for Zustand persist middleware.
 *
 * Uses @capacitor/preferences on native (iOS/Android) so data
 * survives OS memory pressure. Falls back to localStorage on web.
 */

import { Preferences } from "@capacitor/preferences";
import { createJSONStorage, type StateStorage } from "zustand/middleware";
import { Capacitor } from "@capacitor/core";

/** True when running inside a native Capacitor shell. */
const isNative = Capacitor.isNativePlatform();

const capacitorStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const { value } = await Preferences.get({ key: name });
    return value;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await Preferences.set({ key: name, value });
  },
  removeItem: async (name: string): Promise<void> => {
    await Preferences.remove({ key: name });
  },
};

const webStorage: StateStorage = {
  getItem: (name: string) => localStorage.getItem(name),
  setItem: (name: string, value: string) => localStorage.setItem(name, value),
  removeItem: (name: string) => localStorage.removeItem(name),
};

const rawStorage: StateStorage = isNative ? capacitorStorage : webStorage;

/**
 * Wrapped with createJSONStorage so Zustand persist can
 * serialize/deserialize state automatically.
 */
export const appStorage = createJSONStorage(() => rawStorage);
