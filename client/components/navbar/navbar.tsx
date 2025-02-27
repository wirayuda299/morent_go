import { Car } from 'lucide-react';
import Link from 'next/link';

import NavItems from './nav-items';

export default function Navbar() {
  return (
    <nav className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-14 items-center justify-between px-4'>
        <Link
          href='/'
          className='flex items-center gap-2 text-xl font-bold text-primary transition-colors hover:text-primary/90'
        >
          <Car className='h-5 w-5' />
          <span>MORENT</span>
        </Link>

        <NavItems />
      </div>
    </nav>
  );
}
