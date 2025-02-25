import { api } from "@/lib/axios";
import { auth } from "@clerk/nextjs/server";

export async function getTotalRevenues() {
  try {
    const { getToken, sessionClaims } = await auth();

    const res = await api.get("/admin/revenue", {
      headers: {
        Authorization: "Bearer " + (await getToken()),
        Role: sessionClaims?.metadata.role,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getActiveRentals() {
  try {
    const { getToken, sessionClaims } = await auth();
    const res = await api.get("/admin/active-rental", {
      headers: {
        Authorization: "Bearer " + (await getToken()),
        Role: sessionClaims?.metadata.role,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getTotalCustomers() {
  try {
    const { getToken, sessionClaims } = await auth();
    const res = await api.get("/admin/total-customers", {
      headers: {
        Authorization: "Bearer " + (await getToken()),
        Role: sessionClaims?.metadata.role,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
