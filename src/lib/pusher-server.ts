import Pusher from "pusher";

// Defaults provided by user; can be overridden via env vars
const appId = process.env.PUSHER_APP_ID || "2066248";
const key = process.env.PUSHER_KEY || "df85e7135740b89156e4";
const secret = process.env.PUSHER_SECRET || "63dceaa11fe5763c8269";
const cluster = process.env.PUSHER_CLUSTER || "ap2";

export const pusherServer = new Pusher({
  appId,
  key,
  secret,
  cluster,
  useTLS: true,
});

