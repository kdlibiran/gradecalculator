"use client";

import { ThemeProvider } from "next-themes";
import "./globals.css";
import { useState, useEffect } from "react";

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
      <head>
        <title>Grade Calculator</title>
        <meta name="description" content="Calculate your grade based on your score and total score." />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
