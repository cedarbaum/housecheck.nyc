import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "housecheck.nyc",
  description: "Explore NYC housing data",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏠</text></svg>",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Suspense fallback={<div></div>}>
            <main className="flex flex-col justify-between p-4 md:p-8 w-full">
              {children}
            </main>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
