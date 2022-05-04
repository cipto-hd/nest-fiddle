import { registerAs } from '@nestjs/config';

export const AppConfig = registerAs('app', () => ({
  apiKey: process.env.API_KEY,
  environment: process.env.NODE_ENV || 'development',
})); /* () => ({
  environment: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: +process.env.DB_PORT || 3306,
  },
}); */
