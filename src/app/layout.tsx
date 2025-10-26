import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthProtector from '@/components/auth/AuthProtector';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'SafeSpace - Community Safety Ratings',
  description: 'A community-driven platform for sharing safety ratings of locations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="max-h-screen w-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased w-full h-full`}>
        <AuthProvider>
          <AuthProtector>{children}</AuthProtector>
          
          <script src="https://accounts.google.com/gsi/client" async defer></script>
        </AuthProvider>
      </body>
    </html>
  );
}
