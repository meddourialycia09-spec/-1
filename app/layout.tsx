import type {Metadata} from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
});

export const metadata: Metadata = {
  title: 'منصة أكاديميا | Academia',
  description: 'منصة تعليمية متطورة للطلاب والمدربين',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="font-sans bg-surface-900 text-surface-200 antialiased min-h-screen flex flex-col selection:bg-emerald-500/30" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
