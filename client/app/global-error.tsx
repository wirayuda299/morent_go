'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang='en'>
      <body>
        <div className='flex min-h-screen flex-col items-center justify-center px-6 py-24'>
          <div className='flex max-w-md flex-col items-center text-center'>
            <div className='mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100'>
              <AlertTriangle className='h-10 w-10 text-red-600' />
            </div>
            <h1 className='mb-3 text-4xl font-extrabold tracking-tight lg:text-5xl'>
              Fatal Error
            </h1>
            <h2 className='mb-6 text-2xl font-semibold tracking-tight'>
              Application crashed
            </h2>
            <p className='mb-8 text-gray-600'>
              Sorry, a critical error has occurred. Our team has been notified
              and is working to restore service as quickly as possible.
            </p>
            <div className='flex w-full flex-col gap-4 sm:w-auto sm:flex-row'>
              <button
                onClick={reset}
                className='inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto'
              >
                <RefreshCw className='h-4 w-4' />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
