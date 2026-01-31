import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getRepositories } from '../lib/registry.functions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export const Route = createFileRoute('/')({
  loader: () => getRepositories(),
  component: Catalog,
  errorComponent: ({ error }) => <CatalogError error={error} />,
})

function Catalog() {
  const repositories = Route.useLoaderData()

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registry Catalog</h1>
          <p className="text-muted-foreground">
            Browse and manage your OCI repositories.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repositories ({repositories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repositories.map((repo) => (
                <TableRow key={repo}>
                  <TableCell className="font-medium">{repo}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to="/repo/$name"
                        params={{ name: repo }}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Tags
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {repositories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground">No repositories found.</p>
                      <p className="text-sm text-muted-foreground/60">
                        Check your REGISTRY_URL configuration.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CatalogError({ error }: { error: unknown }) {
  const router = useRouter()
  const message = 'Failed to load repositories.'

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Unable to load repositories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex gap-2">
            <Button onClick={() => router.invalidate()}>Retry</Button>
            <Button variant="secondary" asChild>
              <Link to="/maintenance">Registry Maintenance</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
