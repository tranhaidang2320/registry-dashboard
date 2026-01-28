import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getTags, deleteTag } from '../lib/registry.functions'
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
import { ChevronLeft, ExternalLink, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export const Route = createFileRoute('/repo/$name')({
  loader: ({ params }) => getTags({ data: params.name }),
  component: RepoTags,
})

function RepoTags() {
  const { name } = Route.useParams()
  const tags = Route.useLoaderData()
  const router = useRouter()

  const handleDelete = async (tag: string) => {
    try {
      await deleteTag({ data: { name, tag } })
      router.invalidate()
    } catch (error) {
      alert((error as Error).message)
    }
  }

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
              Manage tags and versions for this repository.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tags ({tags.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag}>
                  <TableCell className="font-medium">
                    <Badge variant="secondary">{tag}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          to="/repo/$name/ref/$ref"
                          params={{ name, ref: tag }}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Details
                        </Link>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the tag <span className="font-semibold text-foreground">{tag}</span> from the repository <span className="font-semibold text-foreground">{name}</span>. 
                              This action cannot be undone, although the data will remain until garbage collection is run.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(tag)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tags.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-10">
                    No tags found for this repository.
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
