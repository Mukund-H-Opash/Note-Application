// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import AuthWrapper from './AuthWrapper'; // Import the new AuthWrapper

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Note Application',
  description: 'A note-taking application with admin and user features',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthWrapper>{children}</AuthWrapper> {/* Wrap children */}
        </Providers>
      </body>
    </html>
  );
}