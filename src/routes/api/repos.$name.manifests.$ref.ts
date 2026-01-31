import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getManifest } from '../../lib/registry.functions'
import logger from '../../lib/logger.server'

export const Route = createFileRoute('/api/repos/$name/manifests/$ref')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const manifest = await getManifest({
            data: { name: params.name, ref: params.ref },
          })
          return json(manifest)
        } catch (error) {
          logger.error(
            { err: error, route: '/api/repos/$name/manifests/$ref', params },
            'api error',
          )
          return json({ error: (error as Error).message }, { status: 500 })
        }
      },
    },
  },
})
