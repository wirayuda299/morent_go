import { Home, Car, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';

const dashboardSidebarList = [
  {
    label: 'dashboard',
    path: '/admin',
    Icon: Home,
  },
  {
    label: 'cars',
    path: '/admin/cars',
    Icon: Car,
  },
  {
    label: 'bookings',
    path: '/admin/bookings',
    Icon: Calendar,
  },
  {
    label: 'settings',
    path: '/admin/settings',
    Icon: Settings,
  },
];
export function DashboardSidebar() {
  return (
    <Sidebar className='border-r'>
      <SidebarHeader className='border-b p-4'>
        <h2 className='text-lg font-semibold'>CarRent Admin</h2>
      </SidebarHeader>
      <SidebarContent className='p-3'>
        <SidebarMenu className='space-y-3'>
          {dashboardSidebarList.map(({ label, path, Icon }) => (
            <SidebarMenuItem key={label}>
              <SidebarMenuButton asChild>
                <Link href={path} className='flex items-center gap-2'>
                  <Icon className='!h-6 !w-6' />
                  <span className='text-base capitalize'>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
