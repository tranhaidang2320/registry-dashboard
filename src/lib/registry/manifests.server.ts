import { ensureOk, registryFetch } from './client.server'

const MANIFEST_ACCEPT = [
  'application/vnd.docker.distribution.manifest.v2+json',
  'application/vnd.docker.distribution.manifest.list.v2+json',
  'application/vnd.oci.image.manifest.v1+json',
  'application/vnd.oci.image.index.v1+json',
].join(', ')

export async function fetchManifest(name: string, ref: string): Promise<any> {
  const response = await registryFetch(`/v2/${name}/manifests/${ref}`, {
    headers: {
      Accept: MANIFEST_ACCEPT,
    },
  })

  await ensureOk(response, `Failed to fetch manifest for ${name}:${ref}`)

  const digest = response.headers.get('Docker-Content-Digest')
  const contentType = response.headers.get('Content-Type')
  const data = await response.json()

  return {
    digest,
    contentType,
    ...data,
  }
}

async function resolveManifestDigest(name: string, ref: string): Promise<string> {
  const headResponse = await registryFetch(`/v2/${name}/manifests/${ref}`, {
    method: 'HEAD',
    headers: {
      Accept: MANIFEST_ACCEPT,
    },
  })

  await ensureOk(headResponse, `Failed to get digest for ${name}:${ref}`)

  const digest = headResponse.headers.get('Docker-Content-Digest')
  if (!digest) {
    throw new Error(`No digest found for ${name}:${ref}`)
  }

  return digest
}

export async function fetchManifestDigest(
  name: string,
  ref: string,
): Promise<string> {
  return resolveManifestDigest(name, ref)
}

export async function deleteManifestByTag(
  name: string,
  tag: string,
): Promise<{ success: true }> {
  const digest = await resolveManifestDigest(name, tag)

  const deleteResponse = await registryFetch(`/v2/${name}/manifests/${digest}`, {
    method: 'DELETE',
  })

  await ensureOk(deleteResponse, `Failed to delete manifest ${digest}`)

  return { success: true }
}
