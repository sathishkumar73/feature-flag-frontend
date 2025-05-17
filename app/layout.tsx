import Sidebar from '@/components/Sidebar';
import "./globals.css";
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-white min-h-screen">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
