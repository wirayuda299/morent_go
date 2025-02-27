'use server';

import { api } from '@/lib/axios';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';

export async function uploadImage(formData: FormData) {
  const log = logger.child({ module: 'uploadImage' });
  log.info('Uploading image', { formData });

  try {
    const { getToken } = await auth();

    const res = await api.post('/image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + (await getToken()),
      },
    });

    log.info('Image uploaded successfully', { response: res.data });
    return res.data;
  } catch (error) {
    log.error('Error uploading image', { error });
    throw error;
  }
}
