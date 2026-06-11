import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  onRefresh?: () => void;
  showRefresh?: boolean;
  showFullscreen?: boolean;
  dark?: boolean;
}

export function DashboardLayout({ children, onRefresh, showRefresh, showFullscreen, dark = false }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header onRefresh={onRefresh} showRefresh={showRefresh} showFullscreen={showFullscreen} />
        <main className={dark ? 'p-0' : 'p-6'}>
          {children}
        </main>
      </div>
    </div>
  );
}
