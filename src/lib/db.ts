import Dexie, { type EntityTable } from 'dexie';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { useState, useEffect } from 'react';

// -- Legacy Dexie DB (for migration) --
export interface KeyValSetting {
  key: string;
  value: any;
}
const legacyDb = new Dexie('UnwindDB') as Dexie & {
  settings: EntityTable<KeyValSetting, 'key'>;
};
legacyDb.version(1).stores({ settings: 'key' });
export const db = legacyDb;

// -- Yjs Setup --
export const ydoc = new Y.Doc();
export const ySettings = ydoc.getMap('settings');

let syncPromise: Promise<void> | null = null;

export async function initYjs() {
  if (typeof window === "undefined") return;
  if (syncPromise) return syncPromise;
  
  syncPromise = new Promise((resolve) => {
    const provider = new IndexeddbPersistence('unwind-yjs-db', ydoc);
    provider.on('synced', async () => {
      // Migrate from Dexie if not already migrated to Yjs
      if (!localStorage.getItem('unwind_migrated_to_yjs')) {
        try {
          const allSettings = await legacyDb.settings.toArray();
          ydoc.transact(() => {
            allSettings.forEach(setting => {
              if (!ySettings.has(setting.key)) {
                ySettings.set(setting.key, setting.value);
              }
            });
          });
          localStorage.setItem('unwind_migrated_to_yjs', 'true');
        } catch (e) {
          console.error("Failed to migrate Dexie to Yjs", e);
        }
      }
      resolve();
    });
  });
  
  return syncPromise;
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  if (typeof window === "undefined") return defaultValue;
  await initYjs();
  const val = ySettings.get(key);
  return val !== undefined ? (val as T) : defaultValue;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  if (typeof window === "undefined") return;
  await initYjs();
  ySettings.set(key, value);
}

export async function migrateFromLocalStorage() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("unwind_migrated_to_dexie_v1")) return;

  const keys = [
    "unwind_latest_prediction",
    "unwind_streak",
    "unwind_plan",
    "unwind_breathe_sessions",
    "unwind_history",
    "unwind_focus",
    "unwind_habits_state",
    "unwind_last_checkin",
    "unwind_daily_checkins",
    "unwind_habit_history"
  ];

  for (const key of keys) {
    const val = localStorage.getItem(key);
    if (val !== null) {
      try {
        let parsed = val;
        try { parsed = JSON.parse(val); } catch (e) { parsed = val; }
        await setSetting(key, parsed);
      } catch (e) {
        console.error(`Failed to migrate ${key}`, e);
      }
    }
  }

  localStorage.setItem("unwind_migrated_to_dexie_v1", "true");
}

export function useYSetting<T>(key: string, defaultValue: T): T {
  const [val, setVal] = useState<T>(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let isMounted = true;

    initYjs().then(() => {
      if (!isMounted) return;
      const initialVal = ySettings.get(key);
      if (initialVal !== undefined) setVal(initialVal as T);
    });

    const observer = (event: Y.YMapEvent<any>) => {
      if (event.keysChanged.has(key)) {
        const newVal = ySettings.get(key);
        setVal(newVal !== undefined ? (newVal as T) : defaultValue);
      }
    };

    ySettings.observe(observer);

    return () => {
      isMounted = false;
      ySettings.unobserve(observer);
    };
  }, [key, defaultValue]);

  return val;
}
