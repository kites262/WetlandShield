export interface AppConfig {
  apiBaseUrl: string
}

function normalizeBaseUrl(value: string | undefined): string {
  const trimmed = value?.trim()

  if (!trimmed) {
    return '/api'
  }

  if (trimmed === '/') {
    return '/'
  }

  return trimmed.replace(/\/+$/, '')
}

export function readAppConfig(env: ImportMetaEnv = import.meta.env): AppConfig {
  return {
    apiBaseUrl: normalizeBaseUrl(env.VITE_API_BASE_URL),
  }
}

export const appConfig = readAppConfig()
