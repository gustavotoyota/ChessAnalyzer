import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChessAnalyzer",
  description: "Improve your chess with Chess Analyzer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
