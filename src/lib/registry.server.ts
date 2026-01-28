// src/lib/registry.server.ts
// This file contains server-only logic and is not imported on the client.

const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:5000'

export async function fetchRepositories(): Promise<string[]> {
  const response = await fetch(`${REGISTRY_URL}/v2/_catalog`)
  if (!response.ok) {
    throw new Error(`Failed to fetch catalog: ${response.statusText}`)
  }
  const data = (await response.json()) as { repositories: string[] }
  return data.repositories
}

export async function fetchTags(name: string): Promise<string[]> {
  const response = await fetch(`${REGISTRY_URL}/v2/${name}/tags/list`)
  if (!response.ok) {
    throw new Error(`Failed to fetch tags for ${name}: ${response.statusText}`)
  }
  const data = (await response.json()) as { name: string; tags: string[] | null }
  return data.tags || []
}

export async function fetchManifest(name: string, ref: string): Promise<any> {
  const headers = new Headers({
    Accept:
      'application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.oci.image.index.v1+json',
  })

  const response = await fetch(`${REGISTRY_URL}/v2/${name}/manifests/${ref}`, {
    headers,
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch manifest for ${name}:${ref}: ${response.statusText}`,
    )
  }

  const digest = response.headers.get('Docker-Content-Digest')
  const contentType = response.headers.get('Content-Type')
  const data = await response.json()

  return {
    digest,
    contentType,
    ...data,
  }
}

export async function deleteManifestByTag(
  name: string,
  tag: string,
): Promise<{ success: true }> {
  const headResponse = await fetch(
    `${REGISTRY_URL}/v2/${name}/manifests/${tag}`,
    {
      method: 'HEAD',
      headers: {
        Accept:
          'application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json',
      },
    },
  )

  if (!headResponse.ok) {
    throw new Error(
      `Failed to get digest for ${name}:${tag}: ${headResponse.statusText}`,
    )
  }

  const digest = headResponse.headers.get('Docker-Content-Digest')
  if (!digest) {
    throw new Error(`No digest found for ${name}:${tag}`)
  }

  const deleteResponse = await fetch(
    `${REGISTRY_URL}/v2/${name}/manifests/${digest}`,
    {
      method: 'DELETE',
    },
  )

  if (!deleteResponse.ok) {
    throw new Error(
      `Failed to delete manifest ${digest}: ${deleteResponse.statusText}`,
    )
  }

  return { success: true }
}
