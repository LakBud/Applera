import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__protected/cvs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__protected/cvs"!</div>
}
