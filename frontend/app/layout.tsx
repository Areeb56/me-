import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'AIOS - Autonomous AI Operating System',
  description: 'The next generation AI-powered operating system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}