/**
 * Lightweight, privacy-conscious device category parser.
 * Avoids storing personal identifiers or full user-agent strings.
 */
export type DeviceCategory = "desktop" | "mobile" | "tablet" | "bot" | "other";

const BOT_REGEX = /bot|spider|crawl|slurp|facebookexternalhit|whatsapp|telegrambot|twitterbot|slackbot|discordbot|applebot/i;
const TABLET_REGEX = /ipad|tablet|(android(?!.*mobile))|kindle|playbook|silk/i;
const MOBILE_REGEX = /mobi|iphone|ipod|blackberry|iemobile|opera mini|windows phone/i;

export function parseDevice(userAgent: string | null | undefined): DeviceCategory {
  if (!userAgent) return "other";
  const ua = userAgent.trim();
  if (BOT_REGEX.test(ua)) return "bot";
  if (TABLET_REGEX.test(ua)) return "tablet";
  if (MOBILE_REGEX.test(ua)) return "mobile";
  if (/windows|macintosh|linux|cros|x11/i.test(ua)) return "desktop";
  return "other";
}
