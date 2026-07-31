import Dexie, { type EntityTable } from 'dexie';

export interface KeyValSetting {
  key: string;
  value: any;
}

const db = new Dexie('UnwindDB') as Dexie & {
  settings: EntityTable<KeyValSetting, 'key'>;
};

db.version(1).stores({
  settings: 'key'
});

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  if (typeof window === "undefined") return defaultValue; // SSR safety
  try {
    const item = await db.settings.get(key);
    return item !== undefined ? item.value : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  if (typeof window === "undefined") return;
  await db.settings.put({ key, value });
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

export { db };
