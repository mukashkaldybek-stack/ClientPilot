import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '../components/Sidebar';
import { ActiveTimerBar } from '../components/ActiveTimerBar';

export const metadata: Metadata = {
  title: 'ClientPilot | Freelance Command Center',
  description:
    'All-in-one micro-SaaS for freelancers: Client CRM, Project Management, Live Time Tracking, and Automated Invoicing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f17] text-slate-100 flex min-h-screen antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <ActiveTimerBar />
          <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
