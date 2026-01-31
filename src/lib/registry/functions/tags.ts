import { createServerFn } from '@tanstack/react-start'
import { fetchTags } from '../../registry.server'
import { assertString } from './validators'

export const getTags = createServerFn({
  method: 'GET',
})
  .inputValidator((name: unknown) => assertString(name, 'name'))
  .handler(async ({ data: name }) => fetchTags(name))
