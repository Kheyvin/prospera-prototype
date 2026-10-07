'use client';

import { cn } from '../../lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn(
        'inline-block w-4 h-4 border-2 border-[var(--color-muted)] border-t-[var(--color-accent)] rounded-full animate-spin',
        className
      )}
    />
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm text-[var(--color-muted)] italic py-8 text-center">
      {children}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="px-3 py-2 bg-[var(--color-danger-dark)]/[0.12] border border-[var(--color-danger-dark)]/40 rounded text-xs text-[var(--color-danger-dark)]">
      {message}
    </div>
  );
}
