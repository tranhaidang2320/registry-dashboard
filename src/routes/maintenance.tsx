import { createFileRoute, Link } from '@tanstack/react-router'
import { Terminal, ShieldAlert, Database } from 'lucide-react'

import PageHeader from '@/components/PageHeader'
import { Panel, PanelHeader } from '@/components/Panel'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const Route = createFileRoute('/maintenance')({
  component: Maintenance,
})

function Maintenance() {
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
              <BreadcrumbPage>Maintenance</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <PageHeader
        title="Registry Maintenance"
        subtitle="Operate safely. Follow the runbook before running destructive actions."
      />

      <Panel>
        <PanelHeader>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Database className="h-4 w-4" />
            Garbage Collection
          </div>
        </PanelHeader>
        <div className="p-4 space-y-4">
          <div className="border rounded-lg p-4 bg-muted/40">
            <p className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
              <ShieldAlert className="h-4 w-4" />
              Warning
            </p>
            <p className="text-sm text-muted-foreground">
              Before running garbage collection, ensure the registry is in
              <strong> read-only mode</strong> or <strong>stopped</strong> to
              prevent data corruption.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Runbook</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Switch registry to read-only mode in configuration.</li>
              <li>Execute the garbage collection command (see below).</li>
              <li>Wait for completion.</li>
              <li>Switch registry back to read-write mode.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Dry Run (Safe)</h4>
            <div className="border rounded-md p-3 font-mono text-xs flex items-center justify-between">
              <code>registry garbage-collect --dry-run /etc/docker/registry/config.yml</code>
              <Terminal className="h-4 w-4 text-muted-foreground" />
            </div>

            <h4 className="text-xs font-medium text-muted-foreground">Actual Run (Reclaims Space)</h4>
            <div className="border rounded-md p-3 font-mono text-xs flex items-center justify-between">
              <code>registry garbage-collect /etc/docker/registry/config.yml</code>
              <Terminal className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}
