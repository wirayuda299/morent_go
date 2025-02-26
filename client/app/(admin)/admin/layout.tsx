import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className='flex p-3'>
      <DashboardSidebar />
      {children}
    </SidebarProvider>
  );
}
