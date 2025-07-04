import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MathQuest - การผจญภัยแห่งตัวเลข",
  description: "เกมฝึกคณิตศาสตร์ออนไลน์ สนุกกับการเรียนรู้แบบผจญภัย",
  keywords: "คณิตศาสตร์, เกมการศึกษา, ฝึกเลข, การเรียนรู้ออนไลน์",
  openGraph: {
    title: "MathQuest - การผจญภัยแห่งตัวเลข",
    description: "เกมฝึกคณิตศาสตร์ออนไลน์ สนุกกับการเรียนรู้แบบผจญภัย",
    type: "website",
    locale: "th_TH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${ibmPlexSansThai.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}