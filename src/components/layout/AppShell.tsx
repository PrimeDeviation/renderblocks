import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export function AppShell({ children, header, footer }: AppShellProps) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {header && (
        <header className="flex-shrink-0 px-4 py-2 md:px-6 md:py-3">
          {header}
        </header>
      )}

      <main className="flex-1 relative overflow-hidden">{children}</main>

      {footer && (
        <footer className="flex-shrink-0 px-4 py-2 md:px-6 md:py-3">
          {footer}
        </footer>
      )}
    </div>
  );
}

export default AppShell;
