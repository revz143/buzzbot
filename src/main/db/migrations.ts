import type Database from 'better-sqlite3'

const MIGRATIONS: string[] = [
  // v1
  `
  CREATE TABLE tasks (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    mode          TEXT    NOT NULL CHECK (mode IN ('work','personal')),
    label         TEXT    NOT NULL,
    sort          INTEGER NOT NULL DEFAULT 0,
    done          INTEGER NOT NULL DEFAULT 0,
    done_at       TEXT,
    remind_at     TEXT,
    snoozed_until TEXT,
    last_fired_on TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  );
  CREATE INDEX idx_tasks_mode_sort ON tasks(mode, sort);

  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE mode_schedules (
    mode       TEXT PRIMARY KEY CHECK (mode IN ('work','personal')),
    enabled    INTEGER NOT NULL DEFAULT 0,
    day_mask   INTEGER NOT NULL DEFAULT 31,
    start_time TEXT    NOT NULL DEFAULT '09:00',
    end_time   TEXT    NOT NULL DEFAULT '18:00'
  );
  INSERT INTO mode_schedules (mode, enabled, day_mask, start_time, end_time)
    VALUES ('work', 0, 31, '09:00', '18:00'), ('personal', 0, 127, '08:00', '22:00');

  CREATE TABLE day_history (
    date      TEXT NOT NULL,
    mode      TEXT NOT NULL,
    total     INTEGER NOT NULL,
    done      INTEGER NOT NULL,
    completed INTEGER NOT NULL,
    PRIMARY KEY (date, mode)
  );
  `
]

export function migrate(db: Database.Database): void {
  const current = db.pragma('user_version', { simple: true }) as number
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v])
      db.pragma(`user_version = ${v + 1}`)
    })()
  }
}
