import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24'>
      <div className='flex max-w-md flex-col items-center text-center'>
        <div className='mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-muted'>
          <FileQuestion className='h-10 w-10 text-muted-foreground' />
        </div>
        <h1 className='mb-3 text-4xl font-extrabold tracking-tight lg:text-5xl'>
          404
        </h1>
        <h2 className='mb-6 text-2xl font-semibold tracking-tight'>
          Page not found
        </h2>
        <p className='mb-8 text-muted-foreground'>
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The
          page might have been moved, deleted, or never existed.
        </p>
        <Button asChild size='lg' className='gap-2'>
          <Link href='/'>
            <Home className='h-4 w-4' />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
