'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Image from 'next/image';
import { Loader, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form';
import { addCarSchema, type AddCarSchemaType } from '@/validation';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { addNewCar } from '@/serveractions/car';
import { uploadImage } from '@/serveractions/image-upload';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function AddCarForm() {
  const form = useForm<AddCarSchemaType>({
    resolver: zodResolver(addCarSchema),
    defaultValues: {
      capacity: 0,
      name: '',
      description: '',
      fuelTankSize: 0,
      city: '',
      country: '',
      streetAddress: '',
      price: 0,
      transmission: 'manual',
      type: '',
      thumbnails: [],
      features: [],
    },
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control: form.control,
    name: 'features' as unknown as never,
  });

  const isSubmitting = form.formState.isSubmitting,
    isValid = form.formState.isValid;

  const [preview, setPreview] = useState<
    {
      file: File;
      preview: string;
    }[]
  >([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    form.setValue('thumbnails', [...form.getValues('thumbnails'), ...files]);
    setPreview(prev => [
      ...prev,
      ...files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(preview[index].preview);

    const updatedThumbnails = form
        .getValues('thumbnails')
        .filter((_, i) => i !== index),
      updatedPreviews = preview.filter((_, i) => i !== index);

    form.setValue('thumbnails', updatedThumbnails);
    setPreview(updatedPreviews);
  };

  const reset = () => {
    form.reset();
    setPreview([]);
  };

  const handleSubmit = async (data: AddCarSchemaType) => {
    try {
      const formData = new FormData();
      data.thumbnails.forEach(file => {
        formData.append('files', file);
      });
      const thumbnails = await uploadImage(formData);
      if (thumbnails.length > 0) {
        await addNewCar(data, thumbnails);
        toast.success('Car has been added');
        reset();
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message !== 'NEXT_REDIRECT') {
          toast.error(error.message || 'Failed to add car');
        }
      } else {
        toast.error('something went wrong');
      }
    }
  };
  return (
    <Card className='mx-auto w-full max-w-4xl'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>Add New Car</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className='space-y-6'
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Ex: Mercedez Benz' />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='capacity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Car capacity'
                        min={0}
                        type='number'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='fuelTankSize'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel tank size</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        min={0}
                        type='number'
                        placeholder='Fuel tank size'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Price <span className='text-xs'>(IDR)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='Ex: 120000'
                        min={0}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='streetAddress'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Street address' />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='transmission'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmission</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Ex: Jakarta' />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Ex: sedan' />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Features</FormLabel>
              <div className='space-y-2'>
                {featureFields.map((field, index) => (
                  <div key={field.id} className='flex items-center space-x-2'>
                    <FormField
                      control={form.control}
                      name={`features.${index}`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormControl>
                            <Input {...field} placeholder='Enter a feature' />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={() => removeFeature(index)}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='mt-2'
                onClick={() => appendFeature('')}
              >
                <Plus className='mr-2 h-4 w-4' /> Add Feature
              </Button>
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className='min-h-[100px]'
                      placeholder='Please add description about the car'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Thumbnails</FormLabel>
              <div className='mt-2 flex flex-wrap gap-4'>
                {preview.length < 4 && (
                  <label
                    htmlFor='thumbnails'
                    className='flex h-24 w-24 cursor-pointer items-center justify-center rounded bg-gray-100 transition-colors hover:bg-gray-200'
                  >
                    <Plus className='text-gray-400' />
                    <input
                      type='file'
                      className='hidden'
                      id='thumbnails'
                      multiple
                      accept='image/*'
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
                {preview.map((thumb, index) => (
                  <div
                    key={index}
                    className='relative flex h-24 w-24 items-center justify-center rounded bg-gray-100'
                  >
                    <Image
                      src={thumb.preview || '/placeholder.svg'}
                      alt={`Thumbnail ${index + 1}`}
                      width={96}
                      height={96}
                      className='h-full w-full rounded object-cover'
                    />
                    <button
                      type='button'
                      onClick={() => handleRemoveImage(index)}
                      className='absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              disabled={isSubmitting || !isValid}
              type='submit'
              className='w-full'
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className='mr-2 animate-spin' />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
