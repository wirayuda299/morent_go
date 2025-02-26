'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SearchSchemaType } from '@/validation';

export type CarLocation = {
  city: string;
  country: string;
  street_address: string;
};

export function LocationPicker({
  address,
  form,
}: {
  form: UseFormReturn<SearchSchemaType>;
  address: CarLocation[];
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const filtered = [...new Set(address.map(addrr => addrr.city))];

  const handleClick = (currentValue: string) => {
    setValue(currentValue === value ? '' : currentValue);
    setOpen(false);
    form.setValue('city', currentValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between border-none bg-white-200 text-sm text-gray-900'
        >
          {value
            ? address?.find(addr => addr.city === value)?.city
            : 'Select city...'}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0'>
        <Command className='w-full'>
          <CommandInput placeholder='Search city...' />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {filtered?.map(location => (
                <CommandItem
                  key={location}
                  value={location}
                  onSelect={currentValue => handleClick(currentValue)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === location ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {location}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
