import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { DataLoader } from '@/components/layout/data-loader';
import { MessageCircle, Phone } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DataLoader />
      <Sidebar />
      <div className="ml-64 transition-all duration-300">
        <Header />
        <main className="p-6">{children}</main>
      </div>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <a
          href="https://wa.me/447735310744"
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all hover:scale-110"
          title="WhatsApp: +44 7735 310744"
        >
          <MessageCircle size={22} />
        </a>
        <a
          href="tel:+233502262294"
          className="flex size-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600 transition-all hover:scale-110"
          title="Call: 050 226 2294"
        >
          <Phone size={22} />
        </a>
      </div>
    </div>
  );
}
