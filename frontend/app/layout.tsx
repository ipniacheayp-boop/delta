import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Airline — Home",
  description: "Enterprise airline booking platform (sample)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <main className="container mx-auto px-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
