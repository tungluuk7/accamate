import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AudioProvider } from "@/components/providers/AudioProvider";
import { GlobalTools } from "@/components/layout/GlobalTools";

export const metadata: Metadata = {
  title: "AccaMate - ACCA Study Hub",
  description: "Personalized ACCA Study Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased text-text-primary bg-surface dark:bg-background-dark">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AudioProvider>
            {children}
            <GlobalTools />
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}