import { createServerFn } from '@tanstack/react-start'
import { fetchTagsPage } from '../../registry.server'
import { validateTagListInput } from './validators'

export const getTags = createServerFn({
  method: 'GET',
})
  .inputValidator(validateTagListInput)
  .handler(async ({ data }) => fetchTagsPage(data.name, data))
