"use client";

import { useEventListener } from "@/hooks/use-event";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChessAnalyzer",
  description: "Improve your chess with Chess Analyzer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [clientWidth, setClientWidth] = useState(0);

  useEffect(() => {
    setClientWidth(innerWidth);
  }, []);

  useEventListener(
    () => window,
    "resize",
    () => setClientWidth(innerWidth)
  );

  return (
    <html
      lang="en"
      style={{
        fontSize: clientWidth < 650 ? `${clientWidth / 650}rem` : undefined,
      }}
    >
      <body className={inter.className}>{children}</body>
    </html>
  );
}
