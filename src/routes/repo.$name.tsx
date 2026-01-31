import * as React from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ExternalLink, RefreshCw, Copy } from 'lucide-react'
import { toast } from 'sonner'

import { getManifest, getTags } from '../lib/registry.functions'
import { usePaginationStack } from '@/lib/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/PageHeader'
import PageControls from '@/components/PageControls'
import { Panel, PanelHeader } from '@/components/Panel'
import StateBlock from '@/components/StateBlock'
import RowActionsMenu from '@/components/RowActionsMenu'
import DigestPill from '@/components/DigestPill'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const PAGE_SIZE = 50

type TagRow = {
  tag: string
}

type TagMeta = {
  digest?: string
  type?: 'Index' | 'Manifest'
  mediaType?: string
}

export const Route = createFileRoute('/repo/$name')({
  validateSearch: (search: Record<string, unknown>) => ({
    last: typeof search.last === 'string' ? search.last : undefined,
  }),
  loaderDeps: ({ params, search }) => ({ name: params.name, last: search.last }),
  loader: ({ deps }) =>
    getTags({
      data: {
        name: deps.name,
        last: deps.last ?? null,
        n: PAGE_SIZE,
      },
    }),
  component: RepoTags,
  errorComponent: ({ error }) => <TagsError error={error} />,
  pendingComponent: TagsPending,
})

function RepoTags() {
  const { name } = Route.useParams()
  const { tags, nextLast } = Route.useLoaderData()
  const { last } = Route.useSearch()
  const router = useRouter()
  const { stack, saveStack } = usePaginationStack(`tags:${name}`)

  const [meta, setMeta] = React.useState<Record<string, TagMeta>>({})
  const [isResolving, setIsResolving] = React.useState(false)

  React.useEffect(() => {
    setMeta({})
    saveStack([])
  }, [name, saveStack])

  const unresolvedTags = React.useMemo(
    () => tags.filter((tag) => !meta[tag]?.digest),
    [meta, tags],
  )

  const resolveTag = React.useCallback(
    async (tag: string) => {
      const result = await getManifest({ data: { name, ref: tag } })
      const mediaType = result.mediaType || result.contentType || ''
      const type =
        mediaType.includes('manifest.list') || mediaType.includes('image.index')
          ? 'Index'
          : 'Manifest'
      const digest = result.digest || ''

      setMeta((prev) => ({
        ...prev,
        [tag]: {
          digest,
          type,
          mediaType,
        },
      }))

      return digest
    },
    [name],
  )

  const resolveDigests = React.useCallback(async () => {
    if (isResolving || unresolvedTags.length === 0) {
      return
    }

    setIsResolving(true)
    try {
      const results = await Promise.allSettled(
        unresolvedTags.map((tag) => resolveTag(tag)),
      )

      const failures = results.filter((result) => result.status === 'rejected')
      if (failures.length > 0) {
        toast.error('Some digests failed to resolve')
      }
    } finally {
      setIsResolving(false)
    }
  }, [isResolving, resolveTag, unresolvedTags])

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(`docker pull ${name}:<tag>`)
      toast.success('Copied')
    } catch {
      toast.error('Copy failed')
    }
  }

  const handleCopyDigest = async (tag: string) => {
    try {
      const digest = meta[tag]?.digest || (await resolveTag(tag))
      if (!digest) {
        toast.error('Digest not available')
        return
      }
      await navigator.clipboard.writeText(digest)
      toast.success('Copied')
    } catch {
      toast.error('Copy failed')
    }
  }

  const data = React.useMemo<TagRow[]>(() => tags.map((tag) => ({ tag })), [tags])

  const columns = React.useMemo<ColumnDef<TagRow>[]>(
    () => [
      {
        accessorKey: 'tag',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="px-0"
          >
            Tag
          </Button>
        ),
        cell: ({ row }) => {
          const tag = row.original.tag
          const digest = meta[tag]?.digest
          const type = meta[tag]?.type

          return (
            <div className="flex flex-col gap-1">
              <Link
                to="/repo/$name/ref/$ref"
                params={{ name, ref: tag }}
                className="font-mono text-sm break-all hover:underline"
              >
                {tag}
              </Link>
              <div className="flex items-center gap-2 sm:hidden">
                {digest ? (
                  <DigestPill digest={digest} />
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
                {type ? (
                  <Badge variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ) : null}
              </div>
            </div>
          )
        },
      },
      {
        id: 'digest',
        enableSorting: false,
        enableColumnFilter: false,
        header: () => <div className="hidden sm:table-cell">Digest</div>,
        cell: ({ row }) => {
          const digest = meta[row.original.tag]?.digest
          return (
            <div className="hidden sm:flex">
              {digest ? (
                <DigestPill digest={digest} />
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </div>
          )
        },
      },
      {
        id: 'type',
        enableSorting: false,
        enableColumnFilter: false,
        header: () => <div className="hidden sm:table-cell">Type</div>,
        cell: ({ row }) => {
          const type = meta[row.original.tag]?.type
          return (
            <div className="hidden sm:flex">
              {type ? (
                <Badge variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </div>
          )
        },
      },
      {
        id: 'actions',
        enableSorting: false,
        enableColumnFilter: false,
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const tag = row.original.tag
          const digest = meta[tag]?.digest

          return (
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                <Link
                  to="/repo/$name/ref/$ref"
                  params={{ name, ref: tag }}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View
                </Link>
              </Button>
              <RowActionsMenu
                actions={[
                  {
                    label: 'View',
                    onSelect: () =>
                      router.navigate({
                        to: '/repo/$name/ref/$ref',
                        params: { name, ref: tag },
                      }),
                  },
                  {
                    label: 'Copy pull command',
                    onSelect: async () => {
                      try {
                        await navigator.clipboard.writeText(`docker pull ${name}:${tag}`)
                        toast.success('Copied')
                      } catch {
                        toast.error('Copy failed')
                      }
                    },
                  },
                  {
                    label: 'Copy digest',
                    onSelect: () => void handleCopyDigest(tag),
                    disabled: !digest && isResolving,
                  },
                ]}
              />
            </div>
          )
        },
      },
    ],
    [handleCopyDigest, isResolving, meta, name, router],
  )

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'tag', desc: false },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleNext = () => {
    if (!nextLast) return
    const nextStack = [...stack, last ?? null]
    saveStack(nextStack)
    router.navigate({
      to: '/repo/$name',
      params: { name },
      search: { last: nextLast },
    })
  }

  const handlePrev = () => {
    if (stack.length === 0) return
    const nextStack = stack.slice(0, -1)
    const prevLast = nextStack[nextStack.length - 1] ?? null
    saveStack(nextStack)
    router.navigate({
      to: '/repo/$name',
      params: { name },
      search: prevLast ? { last: prevLast } : {},
    })
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
              <BreadcrumbPage>{name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="outline" size="sm" onClick={() => router.invalidate()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <PageHeader
        title={<span className="font-mono break-all">{name}</span>}
        subtitle={`${tags.length} tags${nextLast ? ' - more available' : ''}`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyTemplate}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy pull template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resolveDigests}
              disabled={isResolving || unresolvedTags.length === 0}
            >
              {isResolving ? 'Resolving...' : 'Resolve digests'}
            </Button>
          </>
        }
      />

      <PageControls
        leftControls={
          <Input
            placeholder="Search tags..."
            value={(table.getColumn('tag')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('tag')?.setFilterValue(event.target.value)
            }
            className="sm:w-[360px]"
          />
        }
        rightControls={
          <div className="flex items-center gap-2">
            {last ? (
              <span className="text-xs text-muted-foreground">Token: {last}</span>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={stack.length === 0}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!nextLast}
            >
              Next
            </Button>
          </div>
        }
      />

      <Panel>
        <PanelHeader>
          <div className="text-sm font-medium">Tags</div>
          <div className="text-xs text-muted-foreground">
            {tags.length} tags
          </div>
        </PanelHeader>
        <div className="p-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-0">
                    <StateBlock
                      title="No tags found"
                      description="Push an image to get started."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </div>
  )
}

function TagsPending() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-72" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <Panel>
        <PanelHeader>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </PanelHeader>
        <div className="p-4 space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </Panel>
    </div>
  )
}

function TagsError({ error }: { error: unknown }) {
  const router = useRouter()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <PageHeader title="Tags" subtitle="Unable to load tags" />
      <StateBlock
        title="Can't reach registry"
        description={
          error instanceof Error ? error.message : 'Failed to load tags.'
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
