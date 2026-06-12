import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GetPaidToWait — Turn AI loading time into passive income",
  description:
    "Earn up to 50% revenue share while your AI tools think. Replace idle spinners with sponsor ads in VS Code, Chrome, and terminal.",
  openGraph: {
    title: "GetPaidToWait — Turn AI loading time into passive income",
    description:
      "Earn up to 50% revenue share while your AI tools think. Replace idle spinners with sponsor ads.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
