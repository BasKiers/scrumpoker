import React, { useState, useEffect, PropsWithChildren } from 'react';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <header className="sticky top-0 z-10 w-full flex items-center justify-between px-6 py-4 border-b bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40">
        <span className="font-bold text-lg">ScrumPoker</span>
        <button
          className="rounded p-2 border hover:bg-muted transition-colors"
          aria-label="Toggle dark mode"
          onClick={() => setDark((d: boolean) => !d)}
        >
          {dark ? '🌙' : '☀️'}
        </button>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 mt-0">{children}</main>
      <footer className="w-full px-6 py-4 border-t text-sm text-muted-foreground bg-card text-center mt-auto">
        &copy; {new Date().getFullYear()} ScrumPoker
      </footer>
    </div>
  );
}; 