import { Geist, Geist_Mono, Nunito } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthProtector from '@/components/auth/AuthProtector';
import SearchBarComponent from '@/components/ui/SearchBar';
import { NotificationCompnent } from '@/components/ui/Notification';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
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
      <body className={`${nunito.variable} ${geistSans.variable} ${geistMono.variable} antialiased w-full h-full`}>
        <NotificationCompnent>
          <AuthProvider>
            <AuthProtector>
              <SearchBarComponent>
                {children}
              </SearchBarComponent>
            </AuthProtector>

            <script src="https://accounts.google.com/gsi/client" async defer></script>
          </AuthProvider>
        </NotificationCompnent>
      </body>
    </html>
  );
}
