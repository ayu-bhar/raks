// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CampusConnect",
  description: "College Registry App",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning here helps if extensions add attributes to html/body
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* NO NAVBAR HERE */}
        {children}
        {/* NO FOOTER HERE */}
      </body>
    </html>
  );
}