import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "KithLy Sender Experience",
  description: "Phase 1 MVP UI for buying and sending item-based gifts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} font-[family-name:var(--font-manrope)]`}>
        {children}
      </body>
    </html>
  );
}
