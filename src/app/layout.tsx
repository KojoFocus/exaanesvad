import type { Metadata } from 'next';
import '@/styles/globals.css';
import { CartProvider } from '@/contexts/CartContext';
import { SiteModeProvider } from '@/contexts/SiteModeContext';

export const metadata: Metadata = {
  title: {
    template: '%s · EXA-ANESVAD',
    default: 'EXA-ANESVAD — Skills. Dignity. Community Transformation.',
  },
  description:
    'EXA-ANESVAD trains marginalized communities in Ghana through livelihood skills and connects their craft to buyers across Africa.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SiteModeProvider><CartProvider>{children}</CartProvider></SiteModeProvider>
      </body>
    </html>
  );
}
