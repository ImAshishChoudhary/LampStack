import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar onExpandChange={setSidebarExpanded} />
      <main 
        className="flex-1 transition-all duration-300" 
        style={{ 
          marginLeft: sidebarExpanded 
            ? '0' 
            : 'clamp(48px, 12vw, 64px)'
        }}
      >
        {children}
      </main>
    </div>
  );
}
