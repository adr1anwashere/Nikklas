// Adds the labelled sample data. Run from the repository root: npm run seed
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const file = process.env.NIKKLAS_DB || 'data/nikklas.db';
mkdirSync(dirname(file), { recursive: true });
const db = new DatabaseSync(file);
db.exec('pragma busy_timeout = 5000; pragma foreign_keys = on;');
db.exec(readFileSync('db/schema.sql', 'utf8'));
db.exec(readFileSync('db/seed-demo.sql', 'utf8'));
console.log("Sample data added. Remove before a pilot: delete from users where id like 'demo-%';");
