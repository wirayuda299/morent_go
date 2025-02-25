import { api } from "@/lib/axios";
import { auth } from "@clerk/nextjs/server";

export async function getAllUsers() {
  try {
    const users = await api.get("/users/find-all");
    return users;
  } catch (error) {
    throw error;
  }
}

export async function getUserTotalRental() {
  try {
    const { userId, getToken } = await auth();
    const users = await api.get(`/users/total-rentals?userId=${userId}`, {
      headers: {
        Authorization: "Bearer " + (await getToken()),
      },
    });
    return users.data;
  } catch (error) {
    throw error;
  }
}

type Rental = {
  car_id: string;
  car_name: string;
  pickup_date: string; // Bisa dijadikan Date jika ingin otomatis parsing
  rental_id: string;
  return_date: string; // Bisa dijadikan Date juga
  status: "pending" | "paid" | "canceled"; // Sesuai dengan kemungkinan status
  total_price: number;
  user_id: string;
};

export async function GetUserRecentBooking(): Promise<Rental[]> {
  try {
    const { userId, getToken } = await auth();
    const res = await api.get("/users/recent-booking?userId=" + userId, {
      headers: {
        Authorization: "Bearer " + (await getToken()),
      },
    });

    return res.data;
  } catch (error) {
    throw error;
  }
}
