import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__protected/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__protected/dashboard"!</div>
}
