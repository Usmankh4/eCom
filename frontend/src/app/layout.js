import { Inter, Fira_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: "400",  
});

const geistMono = Fira_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: "400",  
});

export const metadata = {
  title: "eCom - Next.js eCommerce",
  description: "Modern eCommerce platform built with Next.js and TypeScript",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ReactQueryProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
