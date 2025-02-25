import { api } from "@/lib/axios";
import { auth } from "@clerk/nextjs/server";
import { log } from "console";

export async function getAllUsers() {
  try {
    const users = await api.get("/users/find-all");

    log("GET ALL USERS", users);
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
    log("GET USER TOTAL RENTAL ", users);
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

    log("GET USER RECENT BOOKING", res);
    return res.data;
  } catch (error) {
    throw error;
  }
}
