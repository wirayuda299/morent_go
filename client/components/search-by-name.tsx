'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";

import { Form, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { searchByNameSchema, SearchByNameSchemaType } from "@/validation";
import { Car } from "@/types";
import CarCard from "./car-card";
import { searchCar } from "@/helpers/client/car";

export default function SearchByName() {
  const [searchResult, setSearchResult] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const { userId, getToken } = useAuth();

  const form = useForm<SearchByNameSchemaType>({
    resolver: zodResolver(searchByNameSchema),
    defaultValues: { name: "" },
  });

  const handleSubmit = async (data: SearchByNameSchemaType) => {
    if (!userId) {
      toast.error("User is not authenticated");
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      const token = await getToken()
      if (!token) throw new Error("Unauthorized")

      const response = await searchCar({
        token,
        user_id: userId,
        search_by: "name",
        name: data.name
      });
      setSearchResult(response || []);
    } catch (error) {
      if ((error as any).status === 404) {
        toast.error("No car matches the query");
      } else {
        toast.error((error as Error).message || "Failed to search car");
      }
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minDuration = 500;
      setTimeout(() => {
        setLoading(false);
        form.reset();
      }, Math.max(0, minDuration - elapsedTime));
    }
  };

  useEffect(() => {
    if (searchParams.get("type")) {
      setSearchResult([]);
    }
  }, [searchParams]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="p-4 flex w-full gap-2 flex-wrap bg-white mt-5"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-[300px]">
                <FormLabel className="flex items-center gap-2">
                  <p className="text-gray-900 text-sm font-medium">Search</p>
                  <Input
                    {...field}
                    placeholder="Search car by name"
                    className="bg-white-200 placeholder:pl-2 border-none focus-visible:ring-0 p-2 text-gray-900"
                    type="search"
                    autoComplete="off"
                  />
                </FormLabel>
              </FormItem>
            )}
          />
          <Button
            disabled={loading || form.formState.isSubmitting}
            className="self-end flex-1 md:max-w-max bg-green-600 hover:bg-green-700"
          >
            {loading || form.formState.isSubmitting ? "Please wait..." : "Search"}
          </Button>
        </form>
      </Form>

      {searchResult.length > 0 && (
        <div className="py-3">
          <h3 className="font-semibold py-3">Search result :</h3>
          {searchResult.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </>
  );
}
