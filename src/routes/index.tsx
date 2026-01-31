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
import { getCatalogPage } from '../lib/registry.functions'
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
import { Input } from '@/components/ui/input'
import { ArrowUpDown, ExternalLink } from 'lucide-react'

type RepoRow = {
  repo: string
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    last: typeof search.last === 'string' ? search.last : undefined,
  }),
  loaderDeps: ({ search }) => ({ last: search.last }),
  loader: ({ deps }) =>
    getCatalogPage({
      data: {
        last: deps.last ?? null,
      },
    }),
  component: Catalog,
  errorComponent: ({ error }) => <CatalogError error={error} />,
})

function Catalog() {
  const { repositories, nextLast } = Route.useLoaderData()
  const router = useRouter()

  const data = React.useMemo<RepoRow[]>(
    () => repositories.map((repo) => ({ repo })),
    [repositories],
  )

  const columns = React.useMemo<ColumnDef<RepoRow>[]>(
    () => [
      {
        accessorKey: 'repo',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="px-0"
          >
            Repository
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('repo')}</div>
        ),
      },
      {
        id: 'actions',
        enableSorting: false,
        enableColumnFilter: false,
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/repo/$name"
                params={{ name: row.original.repo }}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Tags
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'repo', desc: false },
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registry Catalog</h1>
          <p className="text-muted-foreground">
            Browse your OCI repositories.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repositories ({repositories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Input
                placeholder="Filter repositories..."
                value={
                  (table.getColumn('repo')?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  table.getColumn('repo')?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              <Button
                variant="outline"
                onClick={() =>
                  router.navigate({
                    to: '/',
                    search: nextLast ? { last: nextLast } : {},
                  })
                }
                disabled={!nextLast}
              >
                Next
              </Button>
            </div>

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
          </div>
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
