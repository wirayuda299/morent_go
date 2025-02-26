'use server';

import { auth } from '@clerk/nextjs/server';

export async function getUserToken() {
  const { getToken } = await auth();
  return await getToken();
}
