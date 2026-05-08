import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Financial Stock Broker Agent',
  description:
    'Autonomous AI-powered broker agent for real-time portfolio management and trade execution.',
};

/**
 * RootLayout wraps every page in the App Router with global styles and metadata.
 *
 * @param children - Page content rendered inside the layout.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
