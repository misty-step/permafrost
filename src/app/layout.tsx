import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PERMAFROST - Cold War Weather Station",
  description: "Historical weather data visualization from 1940 to present - Cold War Industrial Control Room Aesthetic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
