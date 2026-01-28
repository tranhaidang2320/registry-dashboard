import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { deleteTag } from '../../lib/registry.functions'

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
          return json({ error: (error as Error).message }, { status: 500 })
        }
      },
    },
  },
})
