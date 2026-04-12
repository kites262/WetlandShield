import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';

type EnvSource = Record<string, string | undefined>;

export type Config = {
  port: number;
  apiPrefix: string;
  aiBaseUrl: string;
  aiApiKey: string;
  aiModel: string;
  aiTimeoutMs: number;
};

function loadServerEnv() {
  const envPath = join(process.cwd(), '.env');

  if (existsSync(envPath)) {
    loadEnvFile(envPath);
  }
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseString(value: string | undefined, fallback = '') {
  return value?.trim() || fallback;
}

function normalizeApiPrefix(value: string | undefined) {
  if (!value || value === '/') {
    return '';
  }

  const trimmed = value.trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '';
}

function normalizeBaseUrl(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : '';
}

export function createConfig(env: EnvSource): Config {
  return {
    port: parseNumber(env.PORT, 3000),
    apiPrefix: normalizeApiPrefix(env.API_PREFIX ?? '/api'),
    aiBaseUrl: normalizeBaseUrl(env.AI_BASE_URL),
    aiApiKey: parseString(env.AI_API_KEY),
    aiModel: parseString(env.AI_MODEL, 'deepseek-chat'),
    aiTimeoutMs: parseNumber(env.AI_TIMEOUT_MS, 30000),
  };
}

loadServerEnv();

export const config = createConfig(process.env);
