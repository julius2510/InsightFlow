import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'InsightFlow — Interactive AI Data Explorer',
  description:
    'Turn raw data into clear insights. Explore CSV & Excel datasets, run statistics, generate charts, clean records, and uncover patterns with zero login and 100% privacy.',
  keywords: [
    'data explorer',
    'csv analytics',
    'excel visualization',
    'recharts',
    'client-side data analysis',
    'ai insights',
    'data cleaning',
  ],
  authors: [{ name: 'InsightFlow' }],
  openGraph: {
    title: 'InsightFlow — Interactive AI Data Explorer',
    description:
      'Explore datasets, calculate statistics, create charts, and discover patterns in seconds.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
