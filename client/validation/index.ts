import { z } from 'zod';

export const addCarSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Car title must have at least 3 characters' }),
  type: z
    .string()
    .trim()
    .min(3, { message: 'Car type must have at least 3 characters' }),
  price: z.coerce
    .number()
    .min(10, { message: 'Rent price must be more than 10 USD' }),
  capacity: z.coerce
    .number()
    .min(1, { message: 'Capacity must be at least 1' })
    .max(12, { message: 'Capacity must not greater than 12' }),

  transmission: z.enum(['automatic', 'manual']),
  city: z
    .string()
    .trim()
    .min(4, { message: 'City must have at least 4 characters' })
    .max(100, { message: 'City must not be greater than 100' }),
  country: z
    .string()
    .trim()
    .min(4, { message: 'country must have at least 4 characters' })
    .max(100, { message: 'country must not be greater than 100' }),
  streetAddress: z
    .string()
    .trim()
    .min(4, { message: 'Street address must have at least 4 characters' })
    .max(100, { message: 'Street address  must not be greater than 100' }),
  fuelTankSize: z.coerce
    .number()
    .min(10, { message: 'Fuel capacity must be at least 10' })
    .max(200, { message: 'Fuel capacity must not be greater than 200' }),
  description: z
    .string()
    .trim()
    .min(30, { message: 'Description must have at least 30 characters' })
    .max(300, { message: 'Description must not exceeds 300 characters' }),
  thumbnails: z.array(z.instanceof(File)),

  features: z.array(z.string()),
});

export const searchSchema = z.object({
  city: z.string(),
  from: z.string(),
});
export const searchByNameSchema = z.object({
  name: z.string(),
});

export const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

export type UserSchema = z.infer<typeof userSchema>;
export type SearchSchemaType = z.infer<typeof searchSchema>;
export type SearchByNameSchemaType = z.infer<typeof searchByNameSchema>;
export type AddCarSchemaType = z.infer<typeof addCarSchema>;
