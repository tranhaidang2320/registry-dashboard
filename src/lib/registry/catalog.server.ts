import { ensureOk, registryFetch } from './client.server'

function parseCatalogNextLast(linkHeader: string | null) {
  if (!linkHeader) {
    return null
  }

  const match = linkHeader.match(
    /<[^>]*[?&]last=([^&>]+)[^>]*>\s*;\s*rel="next"/i,
  )
  if (!match) {
    return null
  }

  return decodeURIComponent(match[1])
}

export async function fetchCatalogPage(options?: {
  last?: string | null
  n?: number | null
}): Promise<{ repositories: string[]; nextLast: string | null }> {
  const params = new URLSearchParams()

  if (options?.last) {
    params.set('last', options.last)
  }

  if (options?.n && Number.isFinite(options.n) && options.n > 0) {
    params.set('n', String(options.n))
  }

  const path = params.toString()
    ? `/v2/_catalog?${params.toString()}`
    : '/v2/_catalog'
  const response = await registryFetch(path)

  await ensureOk(response, 'Failed to fetch catalog')

  const data = (await response.json()) as { repositories: string[] }
  const nextLast = parseCatalogNextLast(response.headers.get('Link'))

  return { repositories: data.repositories, nextLast }
}

export async function fetchRepositories(): Promise<string[]> {
  const data = await fetchCatalogPage()
  return data.repositories
}
