'use server';

import { userSchema, UserSchema } from '@/validation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof UserSchema]?: string[];
  };
}

export async function createUser(id: string) {
  const log = logger.child({ module: 'createUser' });
  log.info('Creating user', { id });

  try {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/create`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    });
    log.info('User created successfully');
  } catch (error) {
    log.error('Error creating user', { error });
    throw error;
  }
}

export async function updateUser(
  prevState: ActionResponse | null,
  formData: FormData,
) {
  const log = logger.child({ module: 'updateUser' });
  log.info('Updating user', { formData });

  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const username = formData.get('username') as string;

    const data = {
      firstName,
      lastName,
      username,
    };

    const validatedData = userSchema.safeParse(data);
    if (!validatedData.success) {
      log.warn('Validation failed', { errors: validatedData.error.flatten().fieldErrors });
      return {
        success: false,
        message: 'Please fix the errors in the form',
        errors: validatedData.error.flatten().fieldErrors,
      };
    }
    const { userId } = await auth();
    if (!userId) {
      log.warn('Unauthorized user attempt');
      return {
        success: false,
        message: 'Unauthorized',
      };
    }
    const client = await clerkClient();

    await client.users.updateUser(userId!, validatedData.data);
    revalidatePath('/profile');
    log.info('User profile updated successfully');
    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    log.error('Error updating user', { error });
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}

