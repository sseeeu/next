// app/layout.js
import "./globals.css";
import Navbar from "./components/Navbar"; // Import the Navbar component

export const metadata = {
  title: "My Services App",
  description: "A Next.js app with Firebase and Tailwind CSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar /> {/* Add Navbar here */}
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
