import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Navbar() {
  const user = await auth()

  return (
    <nav className="border-b sticky justify-between top-0 z-50 p-4 h-14 w-full flex items-center bg-white">
      <h1 className='text-blue-500 font-extrabold text-xl'>
        <Link href={'/'}>
          MORENT
        </Link>
      </h1>
      <ul className="flex items-center gap-3">
        <li>
          <Link href={'/'} className="text-sm text-gray-500">
            Home
          </Link>
        </li>
        <li>
          <Link href={'/search'} className="text-sm text-gray-500">
            Search
          </Link>
        </li>
        <li>
          <Link href={'/add'} className="text-sm text-gray-500">
            Add Car
          </Link>
        </li>
        <li>
          {user ? (
            <Link
              className="text-sm text-gray-500 inline-block"
              href={'/profile'}>Profile</Link>
          ) : (
            <Link
              className="bg-green-700 hover:bg-green-800 inline-block px-3 py-2"
              href={'/sign-up'}>
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )
}
