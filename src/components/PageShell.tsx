import type { ReactNode } from "react";

export function PageShell({
  title,
  children,
  back,
}: {
  title?: string;
  children: ReactNode;
  back?: { to: string; label?: string };
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground font-bold">
              U
            </span>
            <span className="text-lg font-semibold tracking-tight">Unspin</span>
          </a>
          {back ? (
            <a href={back.to} className="text-sm text-muted-foreground hover:text-foreground">
              ← {back.label ?? "Back"}
            </a>
          ) : (
            <a href="/history/" className="text-sm text-muted-foreground hover:text-foreground">
              History
            </a>
          )}
        </div>
        {title && (
          <div className="mx-auto max-w-2xl px-4 pb-3">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">{children}</main>
    </div>
  );
}
