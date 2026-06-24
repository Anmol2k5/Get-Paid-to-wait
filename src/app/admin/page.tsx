import type { Metadata } from "next";
import AdminClient from "./client";

export const metadata: Metadata = {
  title: "GPTW Admin — Campaign Moderation | GetPaidToWait",
  description: "Admin dashboard for reviewing and moderating ad campaigns.",
  robots: "noindex, nofollow",
};

export default function AdminPage() {
  return <AdminClient />;
}
