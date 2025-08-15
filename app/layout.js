import Footer from "@/components/Footer";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Auction App",
  description: "Auction App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <head>
        <link rel="icon" href="/images/favicon.png" />
      </head>
      <body
        className={`flex flex-col min-h-screen font-sans text-foreground bg-background`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
