import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { migrate } from './migrations'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    const file = join(app.getPath('userData'), 'buzzz.db')
    db = new Database(file)
    db.pragma('journal_mode = WAL')
    migrate(db)
  }
  return db
}

export function closeDb(): void {
  db?.close()
  db = null
}
