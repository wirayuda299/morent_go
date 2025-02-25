"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});
export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof z.infer<typeof userSchema>]?: string[];
  };
}

export async function createUser(id: string) {
  try {
    await fetch(`http://localhost:8000/users/create`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id,
      }),
    });
  } catch (error) {
    console.info(error);
    throw error;
  }
}

export async function updateUser(
  prevState: ActionResponse | null,
  formData: FormData,
) {
  try {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const username = formData.get("username") as string;

    const data = {
      firstName,
      lastName,
      username,
    };

    const validatedData = userSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        message: "Please fix the errors in the form",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }
    const client = await clerkClient();

    await client.users.updateUser(userId!, validatedData.data);
    revalidatePath("/profile");
    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Update user error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}
