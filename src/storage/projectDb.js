import { openDB } from "idb";

const DB_NAME = "dj-architect";
const DB_VERSION = 1;
const STORE = "kv";
const KEY = "project_state_v1";

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });
}

export async function loadProjectState() {
  const db = await getDb();
  return db.get(STORE, KEY);
}

export async function saveProjectState(state) {
  const db = await getDb();
  return db.put(STORE, state, KEY);
}
