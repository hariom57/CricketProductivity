import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RunRate - DSA Cricket Chase',
  description: 'Track your DSA progress like a cricket run chase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-black">
        {children}
      </body>
    </html>
  );
}
