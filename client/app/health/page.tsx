import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Clock, Info, Server } from 'lucide-react';

export default function HealthPage() {
  const appVersion = '1.0.0';
  const startTime = new Date('2024-01-01').toISOString();
  const currentTime = new Date().toISOString();

  // Calculate uptime (in a real app, you'd track this properly)
  const uptimeStart = new Date('2024-01-01');
  const now = new Date();
  const uptimeDays = Math.floor(
    (now.getTime() - uptimeStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className='container mx-auto px-4 py-10'>
      <div className='mb-8 flex flex-col items-center justify-center'>
        <h1 className='mb-2 text-3xl font-bold'>Application Health Status</h1>
        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
          >
            Healthy
          </Badge>
          <span className='text-sm text-muted-foreground'>
            Last checked: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              Status
            </CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm'>API</span>
                <Badge
                  variant='outline'
                  className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                >
                  Online
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm'>Database</span>
                <Badge
                  variant='outline'
                  className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                >
                  Connected
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm'>Cache</span>
                <Badge
                  variant='outline'
                  className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                >
                  Available
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Clock className='h-5 w-5 text-blue-500' />
              Uptime
            </CardTitle>
            <CardDescription>System uptime information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm'>Days Up</span>
                <span className='font-medium'>{uptimeDays} days</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm'>Started At</span>
                <span className='font-medium'>
                  {new Date(startTime).toLocaleDateString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm'>Current Time</span>
                <span className='font-medium'>
                  {new Date(currentTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Info className='h-5 w-5 text-purple-500' />
              Information
            </CardTitle>
            <CardDescription>Application details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm'>Version</span>
                <span className='font-medium'>{appVersion}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm'>Environment</span>
                <Badge variant='outline'>Production</Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm'>Framework</span>
                <span className='font-medium'>Next.js</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='mt-6'>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Server className='h-5 w-5 text-orange-500' />
            System Resources
          </CardTitle>
          <CardDescription>Current resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <div className='mb-1 flex justify-between'>
                <span className='text-sm'>CPU Usage</span>
                <span className='text-sm font-medium'>25%</span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-muted'>
                <div
                  className='h-full rounded-full bg-green-500'
                  style={{ width: '25%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className='mb-1 flex justify-between'>
                <span className='text-sm'>Memory Usage</span>
                <span className='text-sm font-medium'>40%</span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-muted'>
                <div
                  className='h-full rounded-full bg-blue-500'
                  style={{ width: '40%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className='mb-1 flex justify-between'>
                <span className='text-sm'>Disk Space</span>
                <span className='text-sm font-medium'>15%</span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-muted'>
                <div
                  className='h-full rounded-full bg-purple-500'
                  style={{ width: '15%' }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
