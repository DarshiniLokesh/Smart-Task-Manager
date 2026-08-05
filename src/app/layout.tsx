import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Smart Task Manager | AI-Powered Kanban & Prioritization',
  description:
    'Full-stack Smart Task Manager built with Next.js App Router, TypeScript, MongoDB, Mongoose, dnd-kit, Zustand, and OpenAI API.',
  keywords: [
    'Smart Task Manager',
    'Next.js',
    'TypeScript',
    'MongoDB',
    'Mongoose',
    'Kanban',
    'OpenAI',
    'Inngest',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} antialiased bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
