import { config as loadEnv } from 'dotenv';
loadEnv({ path: process.env.PROJECT_ENV_FILE || 'project/.env', quiet: true });
loadEnv({ path: '.env', quiet: true });

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
export const API_BASE_URL = (process.env.API_BASE_URL || BASE_URL).replace(/\/+$/, '');

export function apiPath(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
}
