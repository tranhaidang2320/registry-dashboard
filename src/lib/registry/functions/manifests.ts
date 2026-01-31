import { createServerFn } from '@tanstack/react-start'
import {
  deleteManifestByTag,
  fetchManifest,
  fetchManifestDigest,
} from '../../registry.server'
import { validateNameRefInput, validateNameTagInput } from './validators'

export const getManifest = createServerFn({
  method: 'GET',
})
  .inputValidator(validateNameRefInput)
  .handler(async ({ data: { name, ref } }) => fetchManifest(name, ref))

export const getManifestDigest = createServerFn({
  method: 'GET',
})
  .inputValidator(validateNameRefInput)
  .handler(async ({ data: { name, ref } }) => fetchManifestDigest(name, ref))

export const deleteTag = createServerFn({
  method: 'POST',
})
  .inputValidator(validateNameTagInput)
  .handler(async ({ data: { name, tag } }) => deleteManifestByTag(name, tag))
