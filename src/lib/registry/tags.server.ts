import { ensureOk, registryFetch } from './client.server'

function parseTagsNextLast(linkHeader: string | null) {
  if (!linkHeader) {
    return null
  }

  const match = linkHeader.match(
    /<[^>]*[?&]last=([^&>]+)[^>]*>\s*;\s*rel=\"next\"/i,
  )
  if (!match) {
    return null
  }

  return decodeURIComponent(match[1])
}

export async function fetchTagsPage(
  name: string,
  options?: { last?: string | null; n?: number | null },
): Promise<{ tags: string[]; nextLast: string | null }> {
  const params = new URLSearchParams()

  if (options?.last) {
    params.set('last', options.last)
  }

  if (options?.n && Number.isFinite(options.n) && options.n > 0) {
    params.set('n', String(options.n))
  }

  const path = params.toString()
    ? `/v2/${name}/tags/list?${params.toString()}`
    : `/v2/${name}/tags/list`

  const response = await registryFetch(path)
  await ensureOk(response, `Failed to fetch tags for ${name}`)

  const data = (await response.json()) as { name: string; tags: string[] | null }
  const nextLast = parseTagsNextLast(response.headers.get('Link'))

  return { tags: data.tags || [], nextLast }
}

export async function fetchTags(name: string): Promise<string[]> {
  const data = await fetchTagsPage(name)
  return data.tags
}
