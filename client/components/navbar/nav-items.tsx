'use client';

import { useUser } from '@clerk/nextjs';
import {
  Home,
  LogIn,
  Menu,
  PlusCircle,
  Search,
  UserCircle,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Search',
    href: '/search',
    icon: Search,
  },
  {
    name: 'Add Car',
    href: '/add',
    icon: PlusCircle,
  },
];

export default function NavItems() {
  const { isLoaded, isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='md:hidden'
            aria-label='Toggle menu'
          >
            {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </Button>
        </SheetTrigger>
        <SheetContent side='right' className='w-full pr-0 sm:max-w-sm'>
          <SheetHeader className='px-1'>
            <SheetTitle>MORENT</SheetTitle>
          </SheetHeader>
          <nav className='mt-8'>
            <ul className='space-y-2'>
              {navigation.map(item => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'hover:bg-muted',
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className='h-4 w-4' />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href={isLoaded && isSignedIn ? '/profile' : '/sign-up'}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    isLoaded && isSignedIn
                      ? pathname === '/profile'
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'hover:bg-muted'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {isLoaded && isSignedIn ? (
                    <>
                      <UserCircle className='h-4 w-4' />
                      Profile
                    </>
                  ) : (
                    <>
                      <LogIn className='h-4 w-4' />
                      Login
                    </>
                  )}
                </Link>
              </li>
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      <ul className='hidden items-center gap-6 md:flex'>
        {navigation.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 text-sm transition-colors hover:text-primary',
                  isActive
                    ? 'font-medium text-primary'
                    : 'text-muted-foreground',
                )}
              >
                <Icon className='h-4 w-4' />
                {item.name}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href={isLoaded && isSignedIn ? '/profile' : '/sign-up'}
            className={cn(
              isLoaded && isSignedIn
                ? cn(
                    'flex items-center gap-2 text-sm transition-colors hover:text-primary',
                    pathname === '/profile'
                      ? 'font-medium text-primary'
                      : 'text-muted-foreground',
                  )
                : 'inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90',
            )}
          >
            {isLoaded && isSignedIn ? (
              <>
                <UserCircle className='h-4 w-4' />
                Profile
              </>
            ) : (
              <>
                <LogIn className='h-4 w-4' />
                Login
              </>
            )}
          </Link>
        </li>
      </ul>
    </>
  );
}
