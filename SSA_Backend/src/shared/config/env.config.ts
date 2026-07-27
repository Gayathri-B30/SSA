import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the .env file in the root directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const envConfig = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'architect_erp',
  }
};
