import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

export default async function Navbar() {
  const user = await auth();

  return (
    <nav className='sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b bg-white p-4'>
      <h1 className='text-xl font-extrabold text-blue-500'>
        <Link href={'/'}>MORENT</Link>
      </h1>
      <ul className='flex items-center gap-3'>
        <li>
          <Link href={'/'} className='text-sm text-gray-500'>
            Home
          </Link>
        </li>
        <li>
          <Link href={'/search'} className='text-sm text-gray-500'>
            Search
          </Link>
        </li>
        <li>
          <Link href={'/add'} className='text-sm text-gray-500'>
            Add Car
          </Link>
        </li>
        <li>
          {user ? (
            <Link
              className='inline-block text-sm text-gray-500'
              href={'/profile'}
            >
              Profile
            </Link>
          ) : (
            <Link
              className='inline-block bg-green-700 px-3 py-2 hover:bg-green-800'
              href={'/sign-up'}
            >
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
