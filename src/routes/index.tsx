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
import { ArrowUpDown, ExternalLink, RefreshCw } from 'lucide-react'

import { getCatalogPage } from '../lib/registry.functions'
import { usePaginationStack } from '@/lib/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/PageHeader'
import PageControls from '@/components/PageControls'
import { Panel, PanelHeader } from '@/components/Panel'
import StateBlock from '@/components/StateBlock'
import RowActionsMenu from '@/components/RowActionsMenu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const PAGE_SIZE = 50

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
        n: PAGE_SIZE,
      },
    }),
  component: Catalog,
  errorComponent: ({ error }) => <CatalogError error={error} />,
  pendingComponent: CatalogPending,
})

function Catalog() {
  const { repositories, nextLast } = Route.useLoaderData()
  const { last } = Route.useSearch()
  const router = useRouter()
  const { stack, saveStack } = usePaginationStack('catalog')

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
          <Link
            to="/repo/$name"
            params={{ name: row.original.repo }}
            className="font-medium hover:underline"
          >
            {row.getValue('repo')}
          </Link>
        ),
      },
      {
        id: 'actions',
        enableSorting: false,
        enableColumnFilter: false,
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/repo/$name"
                params={{ name: row.original.repo }}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </Link>
            </Button>
            <RowActionsMenu
              actions={[
                {
                  label: 'View tags',
                  onSelect: () =>
                    router.navigate({
                      to: '/repo/$name',
                      params: { name: row.original.repo },
                    }),
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [router],
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

  const handleNext = () => {
    if (!nextLast) return
    const nextStack = [...stack, last ?? null]
    saveStack(nextStack)
    router.navigate({
      to: '/',
      search: { last: nextLast },
    })
  }

  const handlePrev = () => {
    if (stack.length === 0) return
    const nextStack = stack.slice(0, -1)
    const prevLast = nextStack[nextStack.length - 1] ?? null
    saveStack(nextStack)
    router.navigate({
      to: '/',
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
              <BreadcrumbPage>Repositories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button variant="outline" size="sm" onClick={() => router.invalidate()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <PageHeader
        title="Repositories"
        subtitle="Browsing registry:2 via server proxy"
      />

      <PageControls
        leftControls={
          <Input
            placeholder="Search repositories..."
            value={(table.getColumn('repo')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('repo')?.setFilterValue(event.target.value)
            }
            className="sm:w-[360px]"
          />
        }
        rightControls={
          <div className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} repositories
          </div>
        }
      />

      <Panel>
        <PanelHeader>
          <div className="text-sm font-medium">Repositories</div>
          <div className="flex items-center gap-2">
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
                      title="Nothing here (yet)."
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

function CatalogPending() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Panel>
        <PanelHeader>
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
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

function CatalogError({ error }: { error: unknown }) {
  const router = useRouter()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <PageHeader
        title="Repositories"
        subtitle="Browsing registry:2 via server proxy"
      />
      <StateBlock
        title="Can't reach registry"
        description={
          error instanceof Error
            ? error.message
            : 'Check your REGISTRY_URL configuration.'
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
