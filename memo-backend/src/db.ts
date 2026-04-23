import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { TaskDatabase } from './types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'memory-curve-db.json');

const EMPTY_DB: TaskDatabase = {
  tasks: [],
};

export async function readDb(): Promise<TaskDatabase> {
  try {
    const raw = await readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as TaskDatabase;
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    };
  } catch {
    return EMPTY_DB;
  }
}

export async function writeDb(db: TaskDatabase): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}
