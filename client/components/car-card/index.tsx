import Image from "next/image";
import Link from "next/link";

import { Car } from "@/types";
import FavButton from "./fav-btn";
import { formatPrice } from "@/utils";


export default function CarCard({ car }: { car: Car }) {
  return (
    <div className="min-w-[300px] h-full max-w-[350px] shadow-md  bg-white rounded-md p-3 overflow-hidden">
      <header className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-base capitalize">{car.name}</h3>
          <p className="text-xs font-medium">{car.type}</p>
        </div>
        <FavButton isFavorite={car.is_favorite} carId={car.id} />
      </header>
      <div className="pt-2">
        <Image
          src={car?.thumbnails[0]?.url}
          width={300}
          height={300}
          alt="car"
          loading="lazy"
          quality={70}
          placeholder="blur"
          blurDataURL={car.thumbnails[0].url}
          className=" object-cover object-center rounded-md"
        />
        <div className="flex justify-between items-center pt-2">
          <button className="flex items-center gap-2">
            <Image
              src={"/gas-station.svg"}
              width={30}
              height={30}
              alt="car"
              className="object-contain size-6"
            />
            <p className="text-sm font-semibold text-gray-500">
              {car.fuelTankSize}L
            </p>
          </button>
          <button className="flex items-center gap-2">
            <Image
              src={"/Car.svg"}
              width={30}
              height={30}
              alt="car"
              className="object-contain size-6"
            />
            <p className="text-sm font-semibold text-gray-500 capitalize">
              {car.transmission}
            </p>
          </button>
          <button className="flex items-center gap-2">
            <Image
              src={"/users.svg"}
              width={30}
              height={30}
              alt="car"
              className="object-contain size-6"
            />
            <p className="text-sm font-semibold text-gray-500 capitalize">
              {car.capacity} people
            </p>
          </button>
        </div>
        <div className="flex items-center justify-between pt-4">
          <p className="font-semibold text-base truncate">
            {formatPrice(car.price)}/
            <span className="text-gray-500 text-sm font-normal">day</span>
          </p>
          <Link
            href={`/car/${car.id}`}
            className="bg-green-600 text-white rounded-sm px-3 py-1 text-sm hover:bg-green-700"
          >
            More info
          </Link>
        </div>
      </div>
    </div>
  );
}
