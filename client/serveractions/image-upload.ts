"use server";

import { api } from "@/lib/axios";
import { auth } from "@clerk/nextjs/server";

export async function uploadImage(formData: FormData) {
  try {
    const { getToken } = await auth();

    const res = await api.post("/image/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "Bearer " + (await getToken()),
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
