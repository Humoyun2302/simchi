import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'simchi-offline'
const STORE = 'drafts'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE)
        }
      },
    })
  }
  return dbPromise
}

export async function saveOfflineDraft(key: string, value: unknown) {
  try {
    const db = await getDb()
    await db.put(STORE, { value, updatedAt: Date.now() }, key)
  } catch {
    // ignore offline storage failures
  }
}

export async function loadOfflineDraft<T>(key: string): Promise<T | null> {
  try {
    const db = await getDb()
    const row = await db.get(STORE, key)
    return (row?.value as T) ?? null
  } catch {
    return null
  }
}

export async function clearOfflineDraft(key: string) {
  try {
    const db = await getDb()
    await db.delete(STORE, key)
  } catch {
    // ignore
  }
}
