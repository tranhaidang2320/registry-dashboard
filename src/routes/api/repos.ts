import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getRepositories } from '../../lib/registry.functions'

export const Route = createFileRoute('/api/repos')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const repositories = await getRepositories()
          return json({ repositories })
        } catch (error) {
          return json({ error: (error as Error).message }, { status: 500 })
        }
      },
    },
  },
})
