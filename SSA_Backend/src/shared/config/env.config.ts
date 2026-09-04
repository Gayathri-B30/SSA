import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the .env file in the root directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const envConfig = {
  database: {
    url: process.env.DATABASE_URL || undefined,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'architect_erp',
    ssl: process.env.DB_SSL === 'true' || !!process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  }
};
