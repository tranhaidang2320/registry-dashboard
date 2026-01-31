import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getManifestDigest, getTags } from '../lib/registry.functions'

type TagRow = {
  tag: string
}

export const Route = createFileRoute('/repo/$name')({
  loader: ({ params }) => getTags({ data: params.name }),
  component: RepoTags,
})

function RepoTags() {
  const { name } = Route.useParams()
  const tags = Route.useLoaderData()
  const [digests, setDigests] = React.useState<Record<string, string>>({})
  const [isResolving, setIsResolving] = React.useState(false)

  React.useEffect(() => {
    setDigests({})
  }, [name])

  const unresolvedTags = React.useMemo(
    () => tags.filter((tag) => !digests[tag]),
    [digests, tags],
  )

  const resolveDigests = React.useCallback(async () => {
    if (isResolving || unresolvedTags.length === 0) {
      return
    }

    setIsResolving(true)
    try {
      const results = await Promise.allSettled(
        unresolvedTags.map((tag) =>
          getManifestDigest({ data: { name, ref: tag } }),
        ),
      )

      setDigests((prev) => {
        const next = { ...prev }
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            next[unresolvedTags[index]] = result.value
          }
        })
        return next
      })
    } finally {
      setIsResolving(false)
    }
  }, [isResolving, name, unresolvedTags])

  const data = React.useMemo<TagRow[]>(
    () => tags.map((tag) => ({ tag })),
    [tags],
  )

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
          const digest = digests[tag]
          return (
            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className="w-fit">
                {tag}
              </Badge>
              {digest ? (
                <span className="text-xs font-mono text-muted-foreground break-all">
                  {digest}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Digest not resolved.
                </span>
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
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/repo/$name/ref/$ref"
                params={{ name, ref: row.original.tag }}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Details
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [digests, name],
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

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Link>
        </Button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight break-all">{name}</h1>
            <p className="text-muted-foreground">
              Browse tags and versions for this repository.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tags ({tags.length})</CardTitle>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={resolveDigests}
              disabled={isResolving || unresolvedTags.length === 0}
            >
              {isResolving ? 'Resolving...' : 'Resolve digests'}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Filter tags..."
              value={(table.getColumn('tag')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('tag')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />

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
                    <TableCell colSpan={columns.length} className="text-center py-10">
                      No tags found for this repository.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
