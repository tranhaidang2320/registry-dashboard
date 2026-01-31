import { createServerFn } from '@tanstack/react-start'
import { getRegistryEndpoint } from '../../registry.server'

export const getRegistryMeta = createServerFn({
  method: 'GET',
}).handler(async () => ({
  endpoint: getRegistryEndpoint(),
}))
