import type { Metadata } from "next";
import AdvertiseClient from "./client";

export const metadata: Metadata = {
  title: "GPTW Ads Network — Advertise to AI Developers | GetPaidToWait",
  description:
    "Tasteful, context-aware sponsored slots injected directly into Claude, ChatGPT, and Gemini load/thinking indicators. Capture attention when developers are waiting.",
  openGraph: {
    title: "GPTW Ads Network — Advertise to AI Developers",
    description:
      "Reach 12k+ active developers during AI thinking time. Pay per impression, zero waste.",
  },
};

export default function AdvertisePage() {
  return <AdvertiseClient />;
}
