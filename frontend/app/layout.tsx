import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerBridge AI | AI Career Intelligence & Skill Gap Discovery",
  description:
    "AI-powered Career Intelligence platform that analyzes your skills, identifies gaps, creates a personalized roadmap, and connects you with real opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
