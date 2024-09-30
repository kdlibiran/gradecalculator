"use client";

import { ThemeProvider } from "next-themes";
import "./globals.css";
import { useState, useEffect } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grade Calculator",
  description: "Calculate your grade based on your score and total score.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
