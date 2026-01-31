import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'
import ThemeScript from '../components/ThemeScript'
import { ThemeProvider } from '../components/ThemeProvider'
import { CommandPaletteProvider } from '../components/CommandPalette'
import { Toaster } from '../components/ui/sonner'
import { getRegistryMeta } from '../lib/registry.functions'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Registry Dashboard',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  loader: () => getRegistryMeta(),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { endpoint } = Route.useLoaderData()

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <CommandPaletteProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Header endpoint={endpoint} />
              <main>{children}</main>
              <Toaster />
            </div>
          </CommandPaletteProvider>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
