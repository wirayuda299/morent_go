import { auth } from "@clerk/nextjs/server"
import { Cog, FuelIcon, User2Icon } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"

import { searchCar } from "@/helpers/client/car"
import RentForm from "@/components/rent-form"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function CarDetail({ params }: Props) {
  const id = (await params).id
  const { userId, getToken } = await auth()

  const car = await searchCar({
    search_by: "id",
    carId: id,
    user_id: userId!,
    token: (await getToken()) as string
  })
  if (car.length < 1) notFound()

  return (

    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative w-full h-64 md:h-96">
            <Image
              src={car[0].thumbnails[0].url}
              alt="Car main image"
              fill
              className="rounded-lg object-cover object-center" />

          </div>
          {car[0]?.thumbnails.length > 1 && (
            <div className="grid grid-cols-3 gap-4">
              {car[0].thumbnails.map(thumbnail => (
                <Image key={thumbnail.public_id} src={thumbnail.url} alt="Car image 1" width={150} height={100} className="rounded-lg" />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 w-full">
          <h1 className="text-3xl font-bold">{car[0].name}</h1>
          <p className="text-gray-600 text-wrap break-all">
            {car[0].description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User2Icon className="w-5 h-5 text-gray-500" />
              <span>{car[0].capacity} Seats</span>
            </div>


            <div className="flex items-center space-x-2">
              <FuelIcon className="w-5 h-5 text-gray-500" />
              <span>{car[0].fuelTankSize}L</span>
            </div>
            <div className="flex items-center space-x-2">
              <Cog className="w-5 h-5 text-gray-500" />
              <span className="capitalize">{car[0].transmission}</span>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Book Now</h2>
            <RentForm carId={car[0].id} />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-3 gap-4">
          {car[0]?.features.map(feat => (
            <li key={feat} className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="capitalize">{feat}</span>
            </li>

          ))}
        </ul>
      </div>
    </div>
  )
}
