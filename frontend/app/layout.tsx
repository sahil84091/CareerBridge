import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerBridge AI | Career Intelligence & Skill Gap Discovery",
  description: "AI-powered Career Intelligence platform for resume analysis, skill gap detection, personalized roadmaps, and opportunity matching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#070B14] text-slate-100 antialiased selection:bg-blue-500/30 selection:text-blue-200">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-850 py-6 text-center text-xs text-slate-500 glass-panel">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} CareerBridge AI. All rights reserved.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Backend Engine: Active (FastAPI)
              </span>
              <span>•</span>
              <span>Zero-Friction MVP</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
