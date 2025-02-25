import { api } from "@/lib/axios";
import { Car } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { log } from "console";

export async function getAllCars(sort: string = "popular") {
  try {
    const { getToken, userId } = await auth();
    const res = await api.get<Car[]>(`/car/find-all/${userId}?sort=${sort}`, {
      headers: {
        Authorization: "Bearer " + (await getToken()),
      },
    });
    log("GET ALL CARS", res);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getAvailableCars() {
  try {
    const { getToken } = await auth();
    const res = await api.get<Car[]>(`/car/available-car`, {
      headers: {
        Authorization: "Bearer " + (await getToken()),
      },
    });

    log("GET AVAILABLE CARS", res);
    return res.data;
  } catch (error) {
    console.info(error);
    throw error;
  }
}

export async function getFeaturedCategories() {
  try {
    const { getToken } = await auth();
    const res = await api.get<string[]>(`/car/featured_categories`, {
      headers: {
        Authorization: "Bearer " + (await getToken()),
      },
    });

    log("GET FEATURED CATEGORIES", res);
    return res.data;
  } catch (error) {
    console.info(error);
    throw error;
  }
}

type SearchPayload = {
  user_id: string;
  search_by: string;
  token: string;
  name?: string;
  capacity?: string;
  type?: string;
  carId?: string;
};

export async function searchCar(payload: SearchPayload): Promise<Car[]> {
  try {
    if (!payload.user_id) {
      throw new Error("User ID is required");
    }

    const params = new URLSearchParams({
      user_id: payload.user_id,
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.capacity ? { capacity: payload.capacity } : {}),
      ...(payload.type ? { type: payload.type } : {}),
      ...(payload.carId && { id: payload.carId }),
      search_by: payload.search_by,
    });

    const res = await api.get(`/car/search?${params.toString()}`, {
      headers: {
        Authorization: "Bearer " + payload.token,
      },
    });

    log("SEARCH CARS:" + params.toString(), res);

    return res.data;
  } catch (e) {
    throw e;
  }
}
