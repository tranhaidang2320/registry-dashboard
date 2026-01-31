import * as React from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ChevronLeft, Copy, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { getManifest } from '../lib/registry.functions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/PageHeader'
import { Panel } from '@/components/Panel'
import StateBlock from '@/components/StateBlock'
import DigestPill from '@/components/DigestPill'
import CopyButton from '@/components/CopyButton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const Route = createFileRoute('/repo/$name/ref/$ref')({
  loader: ({ params }) =>
    getManifest({ data: { name: params.name, ref: params.ref } }),
  component: ManifestDetails,
  errorComponent: ({ error }) => <ManifestError error={error} />,
  pendingComponent: ManifestPending,
})

function formatBytes(bytes?: number | null) {
  if (!bytes || Number.isNaN(bytes)) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

function ManifestDetails() {
  const { name, ref } = Route.useParams()
  const manifest = Route.useLoaderData()
  const router = useRouter()

  const manifestType = manifest.mediaType || manifest.contentType || ''
  const isManifestList =
    manifestType.includes('manifest.list') ||
    manifestType.includes('image.index')

  const size = React.useMemo(() => {
    if (isManifestList && Array.isArray(manifest.manifests)) {
      return manifest.manifests.reduce(
        (total: number, item: { size?: number }) => total + (item.size ?? 0),
        0,
      )
    }

    if (Array.isArray(manifest.layers)) {
      return manifest.layers.reduce(
        (total: number, layer: { size?: number }) => total + (layer.size ?? 0),
        0,
      )
    }

    return null
  }, [isManifestList, manifest.layers, manifest.manifests])

  const subtitle = (
    <div className="flex flex-wrap items-center gap-2">
      {manifest.digest ? <DigestPill digest={manifest.digest} /> : null}
      {manifestType ? <Badge variant="secondary">{manifestType}</Badge> : null}
    </div>
  )

  const handleCopyDigest = async () => {
    if (!manifest.digest) return
    try {
      await navigator.clipboard.writeText(manifest.digest)
      toast.success('Copied')
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Repositories</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/repo/$name" params={{ name }}>
                  {name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{ref}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.invalidate()}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <PageHeader
        title={
          <span className="font-mono break-all">
            {name}:{ref}
          </span>
        }
        subtitle={subtitle}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/repo/$name" params={{ name }}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyDigest}
              disabled={!manifest.digest}
            >
              <Copy className="h-4 w-4" />
              Copy digest
            </Button>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isManifestList ? (
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
          ) : (
            <TabsTrigger value="layers">Layers</TabsTrigger>
          )}
          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="py-4 gap-4">
              <CardHeader className="px-4 pb-0">
                <CardTitle>Identity</CardTitle>
              </CardHeader>
              <CardContent className="px-4 space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Repository</p>
                  <p className="font-mono break-all">{name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reference</p>
                  <p className="font-mono break-all">{ref}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">Digest</p>
                  {manifest.digest ? <DigestPill digest={manifest.digest} /> : <span>-</span>}
                </div>
              </CardContent>
            </Card>

            <Card className="py-4 gap-4">
              <CardHeader className="px-4 pb-0">
                <CardTitle>Manifest</CardTitle>
              </CardHeader>
              <CardContent className="px-4 space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Schema Version</p>
                  <p className="font-medium">{manifest.schemaVersion ?? '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Media Type</p>
                  <p className="font-medium break-all">
                    {manifest.mediaType || manifest.contentType || '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="py-4 gap-4">
              <CardHeader className="px-4 pb-0">
                <CardTitle>Size</CardTitle>
              </CardHeader>
              <CardContent className="px-4 space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">{formatBytes(size)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Notes</p>
                  <p className="text-xs text-muted-foreground">
                    Size is computed from layers or platform manifests.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isManifestList ? (
          <TabsContent value="platforms">
            <Panel className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Digest</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manifest.manifests?.map((item: any, index: number) => (
                    <TableRow key={item.digest || index}>
                      <TableCell className="font-medium">
                        {item.platform?.os}/{item.platform?.architecture}
                        {item.platform?.variant ? `/${item.platform.variant}` : ''}
                      </TableCell>
                      <TableCell>
                        {item.digest ? <DigestPill digest={item.digest} /> : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            to="/repo/$name/ref/$ref"
                            params={{ name, ref: item.digest }}
                          >
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Panel>
          </TabsContent>
        ) : (
          <TabsContent value="layers">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Config</span>
                {manifest.config?.digest ? (
                  <DigestPill digest={manifest.config.digest} />
                ) : (
                  <span>-</span>
                )}
                {manifest.config?.digest ? (
                  <CopyButton value={manifest.config.digest} label="Copy config digest" />
                ) : null}
              </div>

              <Panel className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Layer digest</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Media type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manifest.layers?.map((layer: any, index: number) => (
                      <TableRow key={layer.digest || index}>
                        <TableCell className="font-mono text-xs break-all">
                          {layer.digest ? <DigestPill digest={layer.digest} /> : '-'}
                        </TableCell>
                        <TableCell>{formatBytes(layer.size)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground break-all">
                          {layer.mediaType}
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
              </Panel>
            </div>
          </TabsContent>
        )}

        <TabsContent value="raw">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                Show raw JSON (for when you don't trust UIs)
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <ScrollArea className="h-[420px] border rounded-lg">
                <pre className="p-4 font-mono text-xs bg-muted/40">
                  {JSON.stringify(manifest, null, 2)}
                </pre>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ManifestPending() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-80" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-9 w-72" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
      <Panel className="p-4">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </Panel>
    </div>
  )
}

function ManifestError({ error }: { error: unknown }) {
  const router = useRouter()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <PageHeader
        title="Manifest"
        subtitle="Unable to load manifest"
      />
      <StateBlock
        title="Can't reach registry"
        description={
          error instanceof Error ? error.message : 'Failed to load manifest.'
        }
        actions={
          <Button onClick={() => router.invalidate()} variant="outline">
            Retry
          </Button>
        }
      />
    </div>
  )
}
