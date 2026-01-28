import { createFileRoute, Link } from '@tanstack/react-router'
import { getManifest } from '../lib/registry.functions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Layers, Info, Box } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/repo/$name/ref/$ref')({
  loader: ({ params }) => getManifest({ data: { name: params.name, ref: params.ref } }),
  component: ManifestDetails,
})

function ManifestDetails() {
  const { name, ref } = Route.useParams()
  const manifest = Route.useLoaderData()

  const isManifestList =
    manifest.contentType === 'application/vnd.docker.distribution.manifest.list.v2+json' ||
    manifest.contentType === 'application/vnd.oci.image.index.v1+json'

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/repo/$name" params={{ name }}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Tags
          </Link>
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight break-all">
            {name}:{ref}
          </h1>
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className="font-mono">
              {manifest.digest}
            </Badge>
            <Badge>{manifest.contentType}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Schema Version</dt>
                <dd className="text-lg font-semibold">{manifest.schemaVersion}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Media Type</dt>
                <dd className="text-lg font-semibold">{manifest.mediaType || manifest.contentType}</dd>
              </div>
              {manifest.config && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Config Digest</dt>
                  <dd className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                    {manifest.config.digest}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {isManifestList ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                Platforms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Digest</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manifest.manifests.map((m: any, i: number) => (
                    <TableRow key={m.digest || i}>
                      <TableCell className="font-medium">
                        {m.platform.os}/{m.platform.architecture}
                        {m.platform.variant && ` (${m.platform.variant})`}
                      </TableCell>
                      <TableCell className="font-mono text-xs break-all">
                        <Link
                          to="/repo/$name/ref/$ref"
                          params={{ name, ref: m.digest }}
                          className="text-blue-500 hover:underline"
                        >
                          {m.digest}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {(m.size / 1024 / 1024).toFixed(2)} MB
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Layers ({manifest.layers?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Media Type</TableHead>
                    <TableHead>Digest</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manifest.layers?.map((layer: any, i: number) => (
                    <TableRow key={layer.digest || i}>
                      <TableCell className="text-xs text-muted-foreground">
                        {layer.mediaType}
                      </TableCell>
                      <TableCell className="font-mono text-xs break-all">
                        {layer.digest}
                      </TableCell>
                      <TableCell className="text-right">
                        {(layer.size / 1024 / 1024).toFixed(2)} MB
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!manifest.layers || manifest.layers.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                        No layers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
