import Filter from '@/components/filter';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Filter />
      <main className='w-full'>
        <SidebarTrigger className='!text-black' />
        {children}
      </main>
    </SidebarProvider>
  );
}
