import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hatiya Unity",
  description: "this is a Strong unity",
};

// মোবাইল অটো-জুম বন্ধ করার জন্য viewport কনফিগারেশন
export const viewport = {
 
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}

      <Toaster position="top-right" richColors />

      </body>

    </html>
  );
}