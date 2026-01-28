import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Terminal, ShieldAlert, Database } from 'lucide-react'

export const Route = createFileRoute('/maintenance')({
  component: Maintenance,
})

function Maintenance() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Registry Maintenance</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Garbage Collection
            </CardTitle>
            <CardDescription>
              Reclaim disk space by removing blobs that are no longer referenced by any manifest.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-4 w-4" />
                Warning
              </p>
              <p className="text-sm">
                Before running garbage collection, ensure the registry is in <strong>read-only mode</strong> or <strong>stopped</strong> to prevent data corruption.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Runbook</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Switch registry to read-only mode in configuration.</li>
                <li>Execute the garbage collection command (see below).</li>
                <li>Wait for completion.</li>
                <li>Switch registry back to read-write mode.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Dry Run (Safe)</h4>
              <div className="bg-slate-950 text-slate-50 p-3 rounded font-mono text-sm flex items-center justify-between">
                <code>registry garbage-collect --dry-run /etc/docker/registry/config.yml</code>
                <Terminal className="h-4 w-4 text-slate-500" />
              </div>

              <h4 className="text-sm font-medium">Actual Run (Reclaims Space)</h4>
              <div className="bg-slate-950 text-slate-50 p-3 rounded font-mono text-sm flex items-center justify-between">
                <code>registry garbage-collect /etc/docker/registry/config.yml</code>
                <Terminal className="h-4 w-4 text-slate-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
