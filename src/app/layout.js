import './globals.css'

export const metadata = {
  title: 'Daisy',
  description: 'Your productivity sanctuary',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
