import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300','400','500','600','700'],
})

export const metadata: Metadata = {
  title: 'LinGrind — English Speaking Practice',
  description: 'Immersive AI English speaking practice. Free, browser-based.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={`en`} className={dmSans.variable}>
      <head>
        {/*
          Charlottenburg Circles — loaded directly here so it is guaranteed
          to resolve before first paint, regardless of Next.js static-file
          caching. The path must match public/fonts/Charlottenburg-Circles.ttf
        */}
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
@font-face {
  font-family: 'Charlottenburg';
  src: url('/fonts/Charlottenburg-Circles.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}
.logo-title {
  font-family: 'Charlottenburg', Georgia, serif !important;
  font-weight: normal !important;
}
            `.trim(),
          }}
        />
      </head>
      <body className="antialiased" style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
