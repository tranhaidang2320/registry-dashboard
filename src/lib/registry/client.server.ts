import logger from '../logger.server'

const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5000'
const REGISTRY_USERNAME = process.env.REGISTRY_USERNAME
const REGISTRY_PASSWORD = process.env.REGISTRY_PASSWORD
const BASIC_AUTH =
  REGISTRY_USERNAME && REGISTRY_PASSWORD
    ? `Basic ${Buffer.from(
        `${REGISTRY_USERNAME}:${REGISTRY_PASSWORD}`,
      ).toString('base64')}`
    : null

function withAuthHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers)
  if (BASIC_AUTH && !headers.has('Authorization')) {
    headers.set('Authorization', BASIC_AUTH)
  }
  return headers
}

function buildRegistryUrl(path: string) {
  let base: URL
  try {
    base = new URL(REGISTRY_URL)
  } catch {
    throw new Error(`Invalid REGISTRY_URL: ${REGISTRY_URL}`)
  }

  const [rawPath, rawSearch] = path.split('?')
  const basePath = base.pathname.replace(/\/+$/, '')
  const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`

  base.pathname = `${basePath}${normalizedPath}`
  base.search = rawSearch ? `?${rawSearch}` : ''

  return base.toString()
}

async function readErrorBody(response: Response): Promise<string | null> {
  try {
    const contentType = response.headers.get('Content-Type') ?? ''
    if (contentType.includes('application/json')) {
      const data = await response.json()
      return JSON.stringify(data)
    }

    const text = await response.text()
    return text.trim() || null
  } catch {
    return null
  }
}

function formatStatus(response: Response) {
  return response.statusText
    ? `${response.status} ${response.statusText}`
    : String(response.status)
}

export async function ensureOk(response: Response, context: string) {
  if (response.ok) {
    return response
  }

  const body = await readErrorBody(response)
  const detail = body ? ` - ${body}` : ''

  throw new Error(`${context} (status ${formatStatus(response)})${detail}`)
}

export async function registryFetch(path: string, options?: RequestInit) {
  const method = options?.method ?? 'GET'
  const start = Date.now()
  const url = buildRegistryUrl(path)

  try {
    const response = await fetch(url, {
      ...options,
      headers: withAuthHeaders(options),
    })
    const durationMs = Date.now() - start
    const logMeta = { method, path, status: response.status, durationMs }

    if (response.ok) {
      logger.info(logMeta, 'registry request')
    } else {
      logger.warn(logMeta, 'registry request failed')
    }

    return response
  } catch (error) {
    const durationMs = Date.now() - start
    logger.error(
      { err: error, method, path, durationMs },
      'registry request error',
    )
    throw error
  }
}
