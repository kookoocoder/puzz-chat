"use client";

import PusherClient from "pusher-js";

// Defaults provided by user; can be overridden via env vars
const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "df85e7135740b89156e4";
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

export const pusherClient = new PusherClient(key, {
  cluster,
  forceTLS: true,
});

