import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { deleteTag } from '../../lib/registry.functions'
import logger from '../../lib/logger.server'

export const Route = createFileRoute('/api/repos/$name/tags/$tag')({
  server: {
    handlers: {
      DELETE: async ({ params }) => {
        try {
          await deleteTag({
            data: { name: params.name, tag: params.tag },
          })
          return json({ success: true })
        } catch (error) {
          logger.error(
            { err: error, route: '/api/repos/$name/tags/$tag', params },
            'api error',
          )
          return json({ error: (error as Error).message }, { status: 500 })
        }
      },
    },
  },
})
