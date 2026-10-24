import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
async function runMigrations() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL not set');
        process.exit(1);
    }
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
        await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )`);
        const migrationsDir = join(process.cwd(), 'packages/db/src/migrations');
        const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
        for (const file of files) {
            const res = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
            if (res.rowCount && res.rowCount > 0)
                continue;
            const sql = readFileSync(join(migrationsDir, file), 'utf-8');
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log('Applied:', file);
            }
            catch (e) {
                await client.query('ROLLBACK');
                throw e;
            }
        }
    }
    finally {
        client.release();
        await pool.end();
    }
}
runMigrations().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map