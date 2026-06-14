import { AlertTriangle } from 'lucide-react';

import { Button } from '../../ui/button';

export function GlobalError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.';

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-bg text-tx-body px-6">
      <div className="max-w-md w-full border border-border bg-white/70 rounded-xl p-6 shadow-sm text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-lg font-semibold text-tx-h1">Something went wrong</h1>

        <p className="text-sm text-tx-muted wrap-break-words">{message}</p>

        <Button
          onClick={() => window.location.reload()}
          className="text-sm px-4 py-2 rounded-md bg-green-800 text-white hover:bg-green-700 transition"
        >
          Reload page
        </Button>
      </div>
    </div>
  );
}
