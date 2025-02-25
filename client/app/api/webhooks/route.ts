import { createUser } from "@/serveractions/user";

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    return new Response("Error: SIGNING_SECRET is missing", { status: 500 });
  }

  const wh = new Webhook(SIGNING_SECRET);
  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Error: Missing Svix headers");
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  console.log("Received headers:", { svix_id, svix_timestamp, svix_signature });

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  console.log("Received webhook body:", body);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("Webhook verified successfully");
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Error: Verification error", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (!id) {
    console.error("Error: Missing user ID in webhook event");
    return new Response("Error: Missing user ID", { status: 400 });
  }

  if (eventType === "user.created") {
    try {
      await createUser(id);
      console.log("User created successfully:", id);
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
