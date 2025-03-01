'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24'>
      <div className='flex max-w-md flex-col items-center text-center'>
        <div className='mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100'>
          <AlertTriangle className='h-10 w-10 text-red-600' />
        </div>
        <h1 className='mb-3 text-4xl font-extrabold tracking-tight lg:text-5xl'>
          Server Error
        </h1>
        <h2 className='mb-6 text-2xl font-semibold tracking-tight'>
          Something went wrong
        </h2>
        <p className='mb-8 text-muted-foreground'>
          Sorry, we encountered an unexpected error on our server. Our team has
          been notified and is working to fix the issue.
        </p>
        <div className='flex w-full flex-col gap-4 sm:w-auto sm:flex-row'>
          <Button
            onClick={reset}
            variant='outline'
            size='lg'
            className='w-full gap-2 sm:w-auto'
          >
            <RefreshCw className='h-4 w-4' />
            Try Again
          </Button>
          <Button asChild size='lg' className='w-full gap-2 sm:w-auto'>
            <Link href='/'>
              <Home className='h-4 w-4' />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
