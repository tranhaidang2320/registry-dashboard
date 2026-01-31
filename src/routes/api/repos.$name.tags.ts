import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getTags } from '../../lib/registry.functions'
import logger from '../../lib/logger.server'

export const Route = createFileRoute('/api/repos/$name/tags')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const tags = await getTags({ data: params.name })
          return json({ name: params.name, tags })
        } catch (error) {
          logger.error(
            { err: error, route: '/api/repos/$name/tags', params },
            'api error',
          )
          return json({ error: (error as Error).message }, { status: 500 })
        }
      },
    },
  },
})
