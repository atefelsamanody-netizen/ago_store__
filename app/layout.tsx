import { Inter } from "next/font/google";
import MusicPlayer from "./components/MusicPlayer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body className={inter.className}>
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}