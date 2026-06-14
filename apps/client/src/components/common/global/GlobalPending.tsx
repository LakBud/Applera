import { Loader } from '../Loader';

export function GlobalPending() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader fullScreen />
    </div>
  );
}
