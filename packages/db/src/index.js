import { Pool } from 'pg';
export function createPool(databaseUrl) {
    return new Pool({ connectionString: databaseUrl });
}
export * from './migrate';
//# sourceMappingURL=index.js.map