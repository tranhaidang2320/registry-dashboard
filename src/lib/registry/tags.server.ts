import { ensureOk, registryFetch } from './client.server'

export async function fetchTags(name: string): Promise<string[]> {
  const response = await registryFetch(`/v2/${name}/tags/list`)
  await ensureOk(response, `Failed to fetch tags for ${name}`)

  const data = (await response.json()) as { name: string; tags: string[] | null }
  return data.tags || []
}
