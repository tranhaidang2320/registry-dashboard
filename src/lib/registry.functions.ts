// src/lib/registry.functions.ts
// This file contains the server function wrappers that are safe to import anywhere.

import { createServerFn } from '@tanstack/react-start'
import {
  deleteManifestByTag,
  fetchManifest,
  fetchRepositories,
  fetchTags,
} from './registry.server'

export const getRepositories = createServerFn({
  method: 'GET',
}).handler(fetchRepositories)

export const getTags = createServerFn({
  method: 'GET',
})
  .inputValidator((name: string) => name)
  .handler(async ({ data: name }) => fetchTags(name))

export const getManifest = createServerFn({
  method: 'GET',
})
  .inputValidator((d: { name: string; ref: string }) => d)
  .handler(async ({ data: { name, ref } }) => fetchManifest(name, ref))

export const deleteTag = createServerFn({
  method: 'POST',
})
  .inputValidator((d: { name: string; tag: string }) => d)
  .handler(async ({ data: { name, tag } }) => deleteManifestByTag(name, tag))
