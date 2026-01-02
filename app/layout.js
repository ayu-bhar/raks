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
    <html lang="en">
      <body className={inter.className}>
        {/* NO NAVBAR HERE */}
        {children}
        {/* NO FOOTER HERE */}
      </body>
    </html>
  );
}